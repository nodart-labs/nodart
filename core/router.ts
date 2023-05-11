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
import { HTTP_METHODS, HttpMethod } from "./interfaces/http";

export class Router {
  readonly entries: RouterEntries = {};

  readonly paramEntries: RouterParamEntries = {};

  protected _paramsData: RouterParamsData = {};

  protected _paramEntryPointers = {
    param: ":",
    number: "+",
    optional: "?",
  };

  constructor(protected _routes: RouteEntry) {
    this.addEntries(_routes);
  }

  addEntries(routes: RouteEntry) {
    this.paramEntries["any"] ||= [];

    Object.entries(routes).forEach(([name, data]) => {
      Array.isArray(data) || (data = [data]);

      for (const route of data as RouteDescriptor[]) {
        const routeData = typeof route === "string" ? { path: route } : route;

        this.addRoute(
          routeData as RouteDescriptor,
          (HTTP_METHODS.includes(route.action)
            ? route.action
            : "any") as HttpMethod,
          name,
        );
      }
    });
  }

  addRoute(
    desc: string | RouteDescriptor,
    method: HttpMethod | "any",
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

  protected _addParamEntry(data: RouteData, method: HttpMethod | "any") {
    this._paramsData[data.path] = {
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

      this._paramsData[data.path].index[index] = param;
      this._paramsData[data.path].names[index] = param;
      this._paramsData[data.path].types[param] = { optional, number };
    }

    this.paramEntries[method] = [
      ...[Object.freeze(data)],
      ...(this.paramEntries[method] || []),
    ];
  }

  getRouteByURLPathname(
    pathname: string,
    method: HttpMethod | "any",
  ): Readonly<RouteData> {
    pathname = $.trimPath(pathname);
    pathname ||= "/";

    const route =
      this.entries[pathname]?.[method] || this.entries[pathname]?.["any"];

    if (route) return this.getRouteData({ ...route, pathname });

    const routes = [
      ...(this.paramEntries[method] || []),
      ...this.paramEntries["any"],
    ] as RouterParamEntryRoutes;
    const path = pathname.split("/");

    OUTER: for (const route of routes) {
      const paramData = this._paramsData[route.path] || {
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
    const paramData = this._paramsData[data.path] || { names: [] };
    const names = paramData.names.filter((value) => value !== undefined);
    const arrange = [];
    let i = 0;

    for (; i < names.length; i++) arrange.push(data.params[names[i]]);

    return arrange;
  }
}
