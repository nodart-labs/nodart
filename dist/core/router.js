"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const utils_1 = require("../utils");
const http_1 = require("./interfaces/http");
class Router {
    constructor(_routes) {
        this._routes = _routes;
        this.entries = {};
        this.paramEntries = {};
        this._paramsData = {};
        this._paramEntryPointers = {
            param: ':',
            number: '+',
            optional: '?',
        };
        this.addEntries(_routes);
    }
    addEntries(routes) {
        var _a;
        (_a = this.paramEntries)['any'] || (_a['any'] = []);
        Object.entries(routes).forEach(([name, data]) => {
            Array.isArray(data) || (data = [data]);
            for (let route of data) {
                const routeData = typeof route === 'string' ? { path: route } : route;
                this.addRoute(routeData, (http_1.HTTP_METHODS.includes(route.action) ? route.action : 'any'), name);
            }
        });
    }
    addRoute(desc, method, route) {
        var _a, _b;
        const data = this.getRouteData(typeof desc === 'string' ? { path: desc } : Object.assign({}, desc));
        data.path = utils_1.$.trimPath(data.path);
        data.path || (data.path = '/');
        data.route = route || '';
        data.types && typeof data.types === 'object' && (data.types = Object.freeze(data.types));
        if (false === data.path.includes(this._paramEntryPointers.param)) {
            (_a = this.entries)[_b = data.path] || (_a[_b] = {});
            this.entries[data.path][method] = Object.freeze(data);
            return;
        }
        this._addParamEntry(data, method);
    }
    _addParamEntry(data, method) {
        this._paramsData[data.path] = {
            index: {},
            types: {},
            names: [],
            path: data.path === '/' ? [] : data.path.split('/')
        };
        for (const [index, entry] of data.path.split('/').entries()) {
            if (entry[0] !== this._paramEntryPointers.param)
                continue;
            const number = entry[1] === this._paramEntryPointers.number;
            const optional = entry.at(-1) === this._paramEntryPointers.optional;
            let start = 1, end = entry.length;
            number && (start += 1);
            optional && (end -= 1);
            const param = entry.slice(start, end);
            this._paramsData[data.path].index[index] = param;
            this._paramsData[data.path].names[index] = param;
            this._paramsData[data.path].types[param] = { optional, number };
        }
        this.paramEntries[method] = [...[Object.freeze(data)], ...this.paramEntries[method] || []];
    }
    getRouteByURLPathname(pathname, method) {
        var _a, _b, _c, _d, _e;
        pathname = utils_1.$.trimPath(pathname);
        pathname || (pathname = '/');
        const route = ((_a = this.entries[pathname]) === null || _a === void 0 ? void 0 : _a[method]) || ((_b = this.entries[pathname]) === null || _b === void 0 ? void 0 : _b['any']);
        if (route)
            return this.getRouteData(Object.assign(Object.assign({}, route), { pathname }));
        const routes = [...this.paramEntries[method] || [], ...this.paramEntries['any']];
        const path = pathname.split('/');
        OUTER: for (const route of routes) {
            const paramData = this._paramsData[route.path] || {
                names: [],
                types: {},
                index: {},
                path: []
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
            name: '',
            path: '',
            pathname: '',
            route: '',
            action: '',
            callback: null,
            controller: null,
            params: {},
            types: {},
        }, assign);
    }
    validateParam(params, name, opts) {
        var _a;
        if (opts.number && (isNaN(params[name] = +params[name])))
            return false;
        if (typeof opts.type === 'function')
            params[name] = (_a = opts.type(params[name])) !== null && _a !== void 0 ? _a : params[name];
        if (opts.type instanceof RegExp && !params[name].toString().match(opts.type))
            return false;
        return !(opts.type === Number && isNaN(params[name] = +params[name]));
    }
    arrangeRouteParams(data) {
        data.params || (data.params = {});
        const paramData = this._paramsData[data.path] || { names: [] };
        const arrange = [];
        let i = 0;
        for (; i < paramData.names.length; i++)
            arrange.push(data.params[paramData.names[i]]);
        return arrange;
    }
}
exports.Router = Router;
//# sourceMappingURL=router.js.map