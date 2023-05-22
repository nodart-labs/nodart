"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const utils_1 = require("../utils");
const http_1 = require("./interfaces/http");
const ANY_HTTP_METHODS = "any";
const SPLIT_ROUTE_ENTRY_ACTION_DELIMITER = ":";
const DEFINE_ROUTE_PATH_HTTP_METHODS_POINTER = "@";
const SPLIT_ROUTE_PATH_HTTP_METHODS_DELIMITER = ":";
const DEFINE_ROUTE_PATH_PARAM_POINTER = ":";
const DEFINE_ROUTE_PATH_NUMBER_PARAM_POINTER = "+";
const DEFINE_ROUTE_PATH_OPTIONAL_PARAM_POINTER = "?";
class Router {
    constructor(_routes) {
        this._routes = _routes;
        this.entries = {};
        this.paramEntries = {};
        this.paramsData = {};
        this._paramEntryPointers = {
            param: DEFINE_ROUTE_PATH_PARAM_POINTER,
            number: DEFINE_ROUTE_PATH_NUMBER_PARAM_POINTER,
            optional: DEFINE_ROUTE_PATH_OPTIONAL_PARAM_POINTER,
        };
        this.addEntries(_routes);
    }
    addEntries(routes) {
        var _a;
        (_a = this.paramEntries)[ANY_HTTP_METHODS] || (_a[ANY_HTTP_METHODS] = []);
        Object.entries(routes).forEach(([name, data]) => {
            var _a;
            Array.isArray(data) || (data = [data]);
            let action = "";
            if (name.includes(SPLIT_ROUTE_ENTRY_ACTION_DELIMITER)) {
                const split = name.split(SPLIT_ROUTE_ENTRY_ACTION_DELIMITER);
                name = split[0].trim();
                action = (_a = split[1]) === null || _a === void 0 ? void 0 : _a.trim();
            }
            for (const route of data) {
                let routeData = {};
                if (typeof route === "string") {
                    if (route.startsWith(DEFINE_ROUTE_PATH_HTTP_METHODS_POINTER)) {
                        const { path, methods } = this.fetchPathAndMethodsFromRoutePath(route);
                        if (!path)
                            continue;
                        if (methods.length) {
                            for (const method of methods) {
                                routeData = { path, action, method };
                                this.addRoute(routeData, method, name);
                            }
                            continue;
                        }
                    }
                    routeData = { path: route, action };
                }
                else {
                    routeData = route;
                    routeData.action || (routeData.action = action);
                }
                this.addRoute(routeData, routeData.method || ANY_HTTP_METHODS, name);
            }
        });
    }
    fetchPathAndMethodsFromRoutePath(path) {
        const split = path.split(SPLIT_ROUTE_PATH_HTTP_METHODS_DELIMITER);
        const methods = [];
        for (const method of split) {
            const httpMethod = method.trim().substring(1);
            if (!method.trim().startsWith(DEFINE_ROUTE_PATH_HTTP_METHODS_POINTER) ||
                !http_1.HTTP_METHODS.includes(httpMethod)) {
                break;
            }
            methods.push(httpMethod);
            path = path.replace(new RegExp(`(^${method}${SPLIT_ROUTE_PATH_HTTP_METHODS_DELIMITER})`, "gi"), "");
        }
        return { path, methods };
    }
    addRoute(desc, method, route) {
        var _a, _b;
        const data = this.getRouteData(typeof desc === "string" ? { path: desc } : Object.assign({}, desc));
        data.path = utils_1.$.trimPath(data.path);
        data.path || (data.path = "/");
        data.route = route || "";
        data.types &&
            typeof data.types === "object" &&
            (data.types = Object.freeze(data.types));
        if (false === data.path.includes(this._paramEntryPointers.param)) {
            (_a = this.entries)[_b = data.path] || (_a[_b] = {});
            this.entries[data.path][method] = Object.freeze(data);
            return;
        }
        this._addParamEntry(data, method);
    }
    _addParamEntry(data, method) {
        this.paramsData[data.path] = {
            index: {},
            types: {},
            names: [],
            path: data.path === "/" ? [] : data.path.split("/"),
        };
        for (const [index, entry] of data.path.split("/").entries()) {
            if (entry[0] !== this._paramEntryPointers.param)
                continue;
            const number = entry[1] === this._paramEntryPointers.number;
            const optional = entry.at(-1) === this._paramEntryPointers.optional;
            let start = 1, end = entry.length;
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
    getRouteByURLPathname(pathname, method) {
        var _a, _b, _c, _d, _e;
        pathname = utils_1.$.trimPath(pathname);
        pathname || (pathname = "/");
        const route = ((_a = this.entries[pathname]) === null || _a === void 0 ? void 0 : _a[method]) ||
            ((_b = this.entries[pathname]) === null || _b === void 0 ? void 0 : _b[ANY_HTTP_METHODS]);
        if (route)
            return this.getRouteData(Object.assign(Object.assign({}, route), { pathname }));
        const routes = [
            ...(this.paramEntries[method] || []),
            ...this.paramEntries[ANY_HTTP_METHODS],
        ];
        const path = pathname.split("/");
        OUTER: for (const route of routes) {
            const paramData = this.paramsData[route.path] || {
                names: [],
                types: {},
                index: {},
                path: [],
            };
            if (path.length > paramData.path.length)
                continue;
            const params = {};
            let paramLength = 0;
            for (const [index, entry] of path.entries()) {
                const param = paramData.index[index];
                if (param) {
                    params[param] = entry;
                    const number = (_c = paramData.types[param]) === null || _c === void 0 ? void 0 : _c.number;
                    const type = (_d = route.types) === null || _d === void 0 ? void 0 : _d[param];
                    if (false === this.validateParam(params, param, { number, type }))
                        continue OUTER;
                    paramLength += 1;
                }
                else if (entry !== paramData.path[index])
                    continue OUTER;
            }
            if (paramLength < paramData.names.length) {
                const types = Object.keys(paramData.types);
                for (let i = 0; i < types.length; i++) {
                    const optional = (_e = paramData.types[types[i]]) === null || _e === void 0 ? void 0 : _e.optional;
                    if (params[types[i]] === undefined && !optional)
                        continue OUTER;
                }
            }
            return this.getRouteData(Object.assign(Object.assign({}, route), { params, pathname }));
        }
        return this.getRouteData({ pathname });
    }
    getRouteData(assign = {}) {
        return Object.assign({
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
        }, assign);
    }
    validateParam(params, name, opts) {
        var _a;
        if (opts.number && isNaN((params[name] = +params[name])))
            return false;
        if (typeof opts.type === "function")
            params[name] =
                (_a = opts.type(params[name])) !== null && _a !== void 0 ? _a : params[name];
        if (opts.type instanceof RegExp &&
            !params[name].toString().match(opts.type))
            return false;
        return !(opts.type === Number && isNaN((params[name] = +params[name])));
    }
    arrangeRouteParams(data) {
        data.params || (data.params = {});
        const paramData = this.paramsData[data.path] || { names: [] };
        const names = paramData.names.filter((value) => value !== undefined);
        const arrange = [];
        let i = 0;
        for (; i < names.length; i++)
            arrange.push(data.params[names[i]]);
        return arrange;
    }
}
exports.Router = Router;
//# sourceMappingURL=router.js.map