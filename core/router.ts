import { $ } from "../utils";
import {
  RouteData,
  RouteDescriptor,
  RouteDescriptorParamTypes,
  RouteEntry,
  RouterEntries,
  RouterParamEntries,
  RouterParamEntryRoutes,
  RouterParamsData,
} from "./interfaces/router";
import { AnyHttpMethods } from "./interfaces/router";
import { HTTP_METHODS } from "./interfaces/http";

const ANY_HTTP_METHODS = "any";
const SPLIT_ROUTE_ENTRY_ACTION_DELIMITER = ":";
const DEFINE_ROUTE_PATH_HTTP_METHODS_POINTER = "@";
const SPLIT_ROUTE_PATH_HTTP_METHODS_DELIMITER = ":";

const DEFINE_ROUTE_PATH_PARAM_POINTER = ":";
const DEFINE_ROUTE_PATH_NUMBER_PARAM_POINTER = "+";
const DEFINE_ROUTE_PATH_OPTIONAL_PARAM_POINTER = "?";

export class Router {
  readonly entries: RouterEntries = {};

  readonly paramEntries: RouterParamEntries = {};

  readonly paramsData: RouterParamsData = {};

  protected _paramEntryPointers = {
    param: DEFINE_ROUTE_PATH_PARAM_POINTER,
    number: DEFINE_ROUTE_PATH_NUMBER_PARAM_POINTER,
    optional: DEFINE_ROUTE_PATH_OPTIONAL_PARAM_POINTER,
  };

  constructor(protected _routes: RouteEntry) {
    this.addEntries(_routes);
  }

  addEntries(routes: RouteEntry) {
    this.paramEntries[ANY_HTTP_METHODS] ||= [];

    Object.entries(routes).forEach(([name, data]) => {
      Array.isArray(data) || (data = [data]);

      let action = "";

      if (name.includes(SPLIT_ROUTE_ENTRY_ACTION_DELIMITER)) {
        const split = name.split(SPLIT_ROUTE_ENTRY_ACTION_DELIMITER);

        name = split[0].trim();
        action = split[1]?.trim();
      }

      for (const route of data as RouteDescriptor[] | string[]) {
        let routeData: Partial<RouteDescriptor> = {};

        if (typeof route === "string") {
          if (route.startsWith(DEFINE_ROUTE_PATH_HTTP_METHODS_POINTER)) {
            const { path, methods } =
              this.fetchPathAndMethodsFromRoutePath(route);

            if (!path) continue;

            if (methods.length) {
              for (const method of methods) {
                routeData = { path, action, method };

                this.addRoute(routeData, method, name);
              }

              continue;
            }
          }

          routeData = { path: route, action };
        } else {
          routeData = route;
          routeData.action ||= action;
        }

        this.addRoute(routeData, routeData.method || ANY_HTTP_METHODS, name);
      }
    });
  }

  fetchPathAndMethodsFromRoutePath(path: string) {
    const split = path.split(SPLIT_ROUTE_PATH_HTTP_METHODS_DELIMITER);
    const methods = [];

    for (const method of split) {
      const httpMethod = method.trim().substring(1);

      if (
        !method.trim().startsWith(DEFINE_ROUTE_PATH_HTTP_METHODS_POINTER) ||
        !HTTP_METHODS.includes(httpMethod)
      ) {
        break;
      }

      methods.push(httpMethod);

      path = path.replace(
        new RegExp(
          `(^${method}${SPLIT_ROUTE_PATH_HTTP_METHODS_DELIMITER})`,
          "gi",
        ),
        "",
      );
    }

    return { path, methods };
  }

  addRoute(
    desc: string | Partial<RouteDescriptor>,
    method: AnyHttpMethods,
    route?: string,
  ) {
    const data = this.getRouteData(
      typeof desc === "string" ? { path: desc } : { ...desc },
    );

    data.path = $.trimPath(data.path);
    data.path ||= "/";
    data.route = route || "";

    data.types &&
      typeof data.types === "object" &&
      (data.types = Object.freeze(data.types));

    if (false === data.path.includes(this._paramEntryPointers.param)) {
      this.entries[data.path] ||= {};
      this.entries[data.path][method] = Object.freeze(data);

      return;
    }

    this._addParamEntry(data, method);
  }

  protected _addParamEntry(data: RouteData, method: AnyHttpMethods) {
    this.paramsData[data.path] = {
      index: {},
      types: {},
      names: [],
      path: data.path === "/" ? [] : data.path.split("/"),
    };

    for (const [index, entry] of data.path.split("/").entries()) {
      if (entry[0] !== this._paramEntryPointers.param) continue;

      const number = entry[1] === this._paramEntryPointers.number;
      const optional = entry.at(-1) === this._paramEntryPointers.optional;

      let start = 1,
        end = entry.length;

      number && (start += 1);
      optional && (end -= 1);

      const param = entry.slice(start, end);

      this.paramsData[data.path].index[index] = param;
      this.paramsData[data.path].names[index] = param;
      this.paramsData[data.path].types[param] = { optional, number };
    }

    this.paramEntries[method] = [
      ...[Object.freeze(data)],
      ...(this.paramEntries[method] || []),
    ];
  }

  getRouteByURLPathname(
    pathname: string,
    method: AnyHttpMethods,
  ): Readonly<RouteData> {
    pathname = $.trimPath(pathname);
    pathname ||= "/";

    const route =
      this.entries[pathname]?.[method] ||
      this.entries[pathname]?.[ANY_HTTP_METHODS];

    if (route) return this.getRouteData({ ...route, pathname });

    const routes = [
      ...(this.paramEntries[method] || []),
      ...this.paramEntries[ANY_HTTP_METHODS],
    ] as RouterParamEntryRoutes;

    const path = pathname.split("/");

    OUTER: for (const route of routes) {
      const paramData = this.paramsData[route.path] || {
        names: [],
        types: {},
        index: {},
        path: [],
      };

      if (path.length > paramData.path.length) continue;

      const params = {};

      let paramLength = 0;

      for (const [index, entry] of path.entries()) {
        const param = paramData.index[index];

        if (param) {
          params[param] = entry;

          const number = paramData.types[param]?.number;
          const type = route.types?.[param];

          if (false === this.validateParam(params, param, { number, type }))
            continue OUTER;

          paramLength += 1;
        } else if (entry !== paramData.path[index]) continue OUTER;
      }

      if (paramLength < paramData.names.length) {
        const types = Object.keys(paramData.types);

        for (let i = 0; i < types.length; i++) {
          const optional = paramData.types[types[i]]?.optional;

          if (params[types[i]] === undefined && !optional) continue OUTER;
        }
      }

      return this.getRouteData({ ...route, params, pathname });
    }

    return this.getRouteData({ pathname });
  }

  getRouteData(assign: Partial<RouteData> = {}): RouteData {
    return Object.assign(
      {
        name: "",
        path: "",
        pathname: "",
        route: "",
        action: "",
        method: "",
        callback: null,
        controller: null,
        params: {},
        types: {},
      },
      assign,
    );
  }

  validateParam(
    params: object,
    name: string,
    opts: {
      number?: boolean;
      type?: RouteDescriptorParamTypes;
    },
  ): boolean | void {
    if (opts.number && isNaN((params[name] = +params[name]))) return false;

    if (typeof opts.type === "function")
      params[name] =
        (opts.type as (...args) => any)(params[name]) ?? params[name];

    if (
      opts.type instanceof RegExp &&
      !params[name].toString().match(<RegExp>opts.type)
    )
      return false;

    return !(opts.type === Number && isNaN((params[name] = +params[name])));
  }

  arrangeRouteParams(data: RouteData) {
    data.params ||= {};
    const paramData = this.paramsData[data.path] || { names: [] };
    const names = paramData.names.filter((value) => value !== undefined);
    const arrange = [];
    let i = 0;

    for (; i < names.length; i++) arrange.push(data.params[names[i]]);

    return arrange;
  }
}
