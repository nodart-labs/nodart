"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const utils_1 = require("../utils");
class Router {
    constructor(_routes) {
        this._routes = _routes;
        this._retrieveRouteEntryPattern = /^(:(\+)?([a-z\d_]+)(\?)?)|(\*)$/i;
        this._routeParamEntryPointer = ':';
        this._skipRouteEntryPointer = '*';
    }
    httpRoute(http) {
        const { pathname } = http.parseURL;
        let route = undefined;
        for (let [routeName, routeData] of Object.entries(this._routes)) {
            if ((route = this.findRoute(routeData, pathname)))
                return {
                    route: routeName,
                    name: route.name,
                    path: route.path,
                    pathname: route.pathname,
                    params: route.params,
                };
        }
        return {
            route: '',
            name: '',
            path: '',
            pathname,
            params: {},
        };
    }
    findRoute(routeData, pathname) {
        pathname = utils_1.$.trimPath(pathname);
        const targetPath = pathname.split('/');
        const getMatch = (routeObject) => this.getRouteObject(routeObject, pathname, targetPath);
        let match = null;
        typeof routeData === 'string'
            ? match = getMatch({ path: routeData })
            : routeData.some(route => match = typeof route === 'string' ? getMatch({ path: route }) : getMatch(route));
        return match;
    }
    getRouteObject(routeData, pathname, targetPath) {
        let { path, types } = routeData;
        if (!types && !path.includes(this._skipRouteEntryPointer) && !path.includes(this._routeParamEntryPointer)) {
            path = utils_1.$.trimPath(path);
            return path === pathname ? Object.assign(Object.assign({}, routeData), { path, pathname }) : null;
        }
        types || (types = {});
        let isMatch = undefined;
        const params = this.getRouteParams(path, (args) => {
            const value = this.getValidatedRouteParamValue(args, targetPath, types);
            isMatch === false || value === undefined || (isMatch = value !== false);
            return value;
        });
        return isMatch ? Object.assign(Object.assign({}, routeData), { path, params, pathname }) : null;
    }
    getRouteParams(routePath, assignParamValueCallback) {
        routePath = utils_1.$.trimPath(routePath);
        const params = {};
        const pathNames = utils_1.$.trimPath(routePath).split('/');
        for (let [index, pathName] of pathNames.entries()) {
            const data = this.getRoutePathEntryData(pathName);
            const value = assignParamValueCallback(Object.assign(Object.assign({}, data), { pathName,
                index,
                pathNames }));
            data.param && (['string', 'number']).includes(typeof value) && (params[data.param] = value);
        }
        return params;
    }
    getRoutePathEntryData(pathEntry) {
        const match = pathEntry.match(this._retrieveRouteEntryPattern); // /^(:(\+)?([a-z\d_]+)(\?)?)|(\*)$/i
        return {
            param: match === null || match === void 0 ? void 0 : match[3],
            isOptional: !!(match === null || match === void 0 ? void 0 : match[4]),
            isSkip: !!(match === null || match === void 0 ? void 0 : match[5]),
            isNumber: !!(match === null || match === void 0 ? void 0 : match[2]),
        };
    }
    getRouteParamValue(args, targetPath, paramTypes = {}) {
        var _a;
        const { index, param, pathName, isNumber } = args;
        const target = targetPath[index];
        if (target === undefined)
            return;
        let value = undefined;
        if (isNumber || (param && paramTypes[param] === Number))
            isNaN(value = parseFloat(target === null || target === void 0 ? void 0 : target.toString())) && (value = false);
        if (param) {
            paramTypes[param] instanceof Function && (value = (_a = paramTypes[param](target)) !== null && _a !== void 0 ? _a : target);
            paramTypes[param] instanceof RegExp && (target === null || target === void 0 ? void 0 : target.toString().match(paramTypes[param])) === null && (value = false);
        }
        return param ? (value !== null && value !== void 0 ? value : target) : pathName;
    }
    getValidatedRouteParamValue(args, targetPath, paramTypes = {}) {
        var _a;
        const { isOptional, isSkip, index } = args;
        const value = this.getRouteParamValue(args, targetPath, paramTypes);
        if (isSkip || (value === undefined && isOptional))
            return;
        if (value === false || !targetPath[index] || (value === null || value === void 0 ? void 0 : value.toString()) !== ((_a = targetPath[index]) === null || _a === void 0 ? void 0 : _a.toString()))
            return false;
        return value;
    }
    arrangeRouteParams(data) {
        const { path, params } = data;
        const arrange = [];
        path.split('/').forEach(entry => {
            const data = this.getRoutePathEntryData(entry);
            data.param && (data.param in params) && arrange.push(params[data.param]);
        });
        return arrange;
    }
}
exports.Router = Router;
//# sourceMappingURL=router.js.map