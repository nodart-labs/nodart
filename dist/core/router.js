"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const utils_1 = require("../utils");
class Router {
    constructor(_routes) {
        this._routes = _routes;
        this._retrieveRouteParamPattern = /^:(\+)?([a-z\d_]+)(\?)?$/i;
        this._routeParamEntryPointer = ':';
    }
    httpRoute(http) {
        const { pathname } = http.parseURL;
        const route = {
            route: '',
            name: '',
            path: '',
            action: '',
            pathname,
            params: {},
        };
        for (let [routeName, routeData] of Object.entries(this._routes)) {
            const data = this.findRoute(routeData, pathname);
            if (data)
                return Object.assign(route, data, { route: routeName });
        }
        return route;
    }
    findRoute(routeData, urlPath) {
        urlPath = utils_1.$.trimPath(urlPath);
        const urlPathSplit = urlPath.split('/');
        if (typeof routeData === 'string')
            return this.getRouteObject(routeData, urlPath, urlPathSplit);
        for (let route of routeData) {
            route instanceof Object || (route = { path: route });
            const data = this.getRouteObject(route.path, urlPath, urlPathSplit);
            if (data) {
                if (false === this.fetchRoutePathEntryParamTypes(route, data.params))
                    return;
                return Object.assign(Object.assign({}, route), data);
            }
        }
    }
    routePathHasParamEntry(path) {
        return path.includes(this._routeParamEntryPointer);
    }
    getRouteObject(path, urlPath, urlPathSplit) {
        var _a;
        path = utils_1.$.trimPath(path);
        if (path === urlPath)
            return { path, pathname: urlPath, params: {} };
        if (false === this.routePathHasParamEntry(path))
            return;
        const pathSplit = path.split('/');
        const params = {};
        if (urlPathSplit.length > pathSplit.length)
            return;
        for (const [index, entry] of pathSplit.entries()) {
            const target = urlPathSplit[index];
            if (false === entry.startsWith(this._routeParamEntryPointer)) {
                if (target === entry)
                    continue;
                return;
            }
            const { param, isOptional, isNumber } = this.parseRoutePathEntryParam(entry);
            if (!param)
                return;
            if (isOptional && target === undefined)
                return {
                    path,
                    params,
                    pathname: urlPath
                };
            if (isNumber && (isNaN(params[param] = parseFloat(target))))
                return;
            (_a = params[param]) !== null && _a !== void 0 ? _a : (params[param] = target);
        }
        return { path, params, pathname: urlPath };
    }
    parseRoutePathEntryParam(pathEntry) {
        const match = pathEntry.match(this._retrieveRouteParamPattern); // /^(:(\+)?([a-z\d_]+)(\?)?)|(\*)$/i
        return {
            param: match === null || match === void 0 ? void 0 : match[2],
            isOptional: !!(match === null || match === void 0 ? void 0 : match[3]),
            isNumber: !!(match === null || match === void 0 ? void 0 : match[1]),
        };
    }
    fetchRoutePathEntryParamTypes(route, params) {
        var _a;
        if (!route.types)
            return;
        for (const [name, value] of Object.entries(params)) {
            if (route.types[name] instanceof Function)
                params[name] = (_a = route.types[name](value)) !== null && _a !== void 0 ? _a : value;
            if (route.types[name] instanceof RegExp && !value.toString().match(route.types[name]))
                return false;
            if (route.types[name] === Number && isNaN(params[name] = parseFloat(value)))
                return false;
        }
    }
    arrangeRouteParams(data) {
        const { path, params } = data;
        const arrange = [];
        path.split('/').forEach(entry => {
            const data = this.parseRoutePathEntryParam(entry);
            data.param && (data.param in params) && arrange.push(params[data.param]);
        });
        return arrange;
    }
}
exports.Router = Router;
//# sourceMappingURL=router.js.map