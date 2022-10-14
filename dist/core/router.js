"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const utils_1 = require("../utils");
class Router {
    constructor(_routes) {
        this._routes = _routes;
        this._routeEntryPointers = {
            param: ':',
            number: '+',
            optional: '?',
        };
    }
    httpRoute(http) {
        const { pathname, query } = http.parseURL;
        const route = {
            route: '',
            name: '',
            path: '',
            action: '',
            pathname,
            params: {},
            query,
        };
        for (let [routeName, routeData] of Object.entries(this._routes)) {
            const data = this.findRoute(routeData, http.parseURL);
            if (data)
                return Object.assign(route, data, { route: routeName });
        }
        return route;
    }
    findRoute(routeData, url) {
        url.pathname = utils_1.$.trimPath(url.pathname);
        const urlPathSplit = url.pathname.split('/');
        if (typeof routeData === 'string')
            return this.getRouteObject(routeData, url.pathname, urlPathSplit);
        Array.isArray(routeData) || (routeData = [routeData]);
        for (let route of routeData) {
            route instanceof Object || (route = { path: route });
            const data = this.getRouteObject(route.path, url.pathname, urlPathSplit);
            if (data) {
                if (false === this.fetchRoutePathEntryParamTypes(route, data.params))
                    return;
                data.query = url.query;
                return Object.assign(Object.assign({}, route), data);
            }
        }
    }
    getRouteObject(path, urlPath, urlPathSplit) {
        var _a;
        path = utils_1.$.trimPath(path);
        if (path === urlPath)
            return { path, pathname: urlPath, params: {} };
        if (false === path.includes(this._routeEntryPointers.param))
            return;
        const pathSplit = path.split('/');
        const params = {};
        if (urlPathSplit.length > pathSplit.length)
            return;
        for (const [index, entry] of pathSplit.entries()) {
            const target = urlPathSplit[index];
            if (target === entry)
                continue;
            const { param, isOptional, isNumber } = this.parseRoutePathEntry(entry);
            if (param === undefined)
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
    parseRoutePathEntry(pathEntry) {
        if (pathEntry[0] !== this._routeEntryPointers.param)
            return {};
        let param = '', i = 1, end = pathEntry.length;
        let isNumber = pathEntry[1] === this._routeEntryPointers.number;
        let isOptional = pathEntry.at(-1) === this._routeEntryPointers.optional;
        isNumber && (i += 1);
        isOptional && (end -= 1);
        for (; i < end; i++)
            param += pathEntry[i];
        return { param, isOptional, isNumber };
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
            const data = this.parseRoutePathEntry(entry);
            data.param && (data.param in params) && arrange.push(params[data.param]);
        });
        return arrange;
    }
}
exports.Router = Router;
//# sourceMappingURL=router.js.map