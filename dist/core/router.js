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
        this._paramEntryPointers = {
            param: ':',
            number: '+',
            optional: '?',
        };
        this.paramEntries['any'] = [];
        this.addEntries(_routes);
    }
    addEntries(routes) {
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
        const data = this.getRouteData(typeof desc === 'string' ? { path: desc } : desc);
        data.path = utils_1.$.trimPath(data.path);
        data.path || (data.path = '/');
        data.route = route || '';
        if (false === data.path.includes(this._paramEntryPointers.param)) {
            (_a = this.entries)[_b = data.path] || (_a[_b] = {});
            this.entries[data.path][method] = Object.freeze(data);
            return;
        }
        this._addParamEntry(data, method);
    }
    _addParamEntry(data, method) {
        var _a;
        const paramNames = {};
        for (const [index, entry] of data.path.split('/').entries()) {
            if (entry[0] !== this._paramEntryPointers.param)
                continue;
            const number = entry[1] === this._paramEntryPointers.number;
            const optional = entry.at(-1) === this._paramEntryPointers.optional;
            let start = 1, end = entry.length;
            number && (start += 1);
            optional && (end -= 1);
            const param = entry.slice(start, end);
            paramNames[index] = param;
            data.paramNames.push(param);
            data.paramTypes[param] = { optional, number };
        }
        (_a = this.paramEntries)[method] || (_a[method] = []);
        const routeData = {
            route: Object.freeze(data),
            path: data.path === '/' ? [] : data.path.split('/'),
            paramNames
        };
        this.paramEntries[method] = [...[routeData], ...this.paramEntries[method]];
    }
    getRouteByURL(url, method) {
        var _a, _b, _c, _d;
        const pathname = url.pathname;
        const route = url.pathname || '/';
        const routeData = ((_a = this.entries[route]) === null || _a === void 0 ? void 0 : _a[method]) || ((_b = this.entries[route]) === null || _b === void 0 ? void 0 : _b['any']);
        if (routeData)
            return this.getRouteData(Object.assign(Object.assign({}, routeData), { query: url.query, pathname }));
        const routes = [...this.paramEntries[method] || [], ...this.paramEntries['any']];
        const path = pathname.split('/');
        OUTER: for (const data of routes) {
            if (path.length > data.path.length)
                continue;
            const params = {};
            let paramLength = 0;
            for (const [index, entry] of path.entries()) {
                const param = data.paramNames[index];
                if (param) {
                    params[param] = entry;
                    const { number } = data.route.paramTypes[param] || {};
                    const type = (_c = data.route.types) === null || _c === void 0 ? void 0 : _c[param];
                    if (false === this.validateParam(params, param, { number, type }))
                        continue OUTER;
                    paramLength += 1;
                }
                else if (entry !== data.path[index])
                    continue OUTER;
            }
            if (paramLength < data.route.paramNames.length) {
                const types = Object.keys(data.route.paramTypes);
                for (let i = 0; i < types.length; i++) {
                    const optional = (_d = data.route.paramTypes[types[i]]) === null || _d === void 0 ? void 0 : _d.optional;
                    if (params[types[i]] === undefined && !optional)
                        continue OUTER;
                }
            }
            return Object.assign(Object.assign({}, data.route), { query: url.query, params, pathname });
        }
        return this.getRouteData({ query: url.query, pathname });
    }
    getRouteData(assign = {}) {
        return Object.assign({
            name: '',
            path: '',
            pathname: '',
            route: '',
            action: '',
            query: {},
            callback: null,
            controller: null,
            params: {},
            paramNames: [],
            paramTypes: {},
            types: {},
        }, assign);
    }
    validateParam(params, name, opts) {
        var _a;
        if (opts.number && (isNaN(params[name] = +params[name])))
            return false;
        if (opts.type instanceof Function)
            params[name] = (_a = opts.type(params[name])) !== null && _a !== void 0 ? _a : params[name];
        if (opts.type instanceof RegExp && !params[name].toString().match(opts.type))
            return false;
        return !(opts.type === Number && isNaN(params[name] = +params[name]));
    }
    arrangeRouteParams(data) {
        data.params || (data.params = {});
        data.paramNames || (data.paramNames = []);
        const arrange = [];
        let i = 0;
        for (; i < data.paramNames.length; i++)
            arrange.push(data.params[data.paramNames[i]]);
        return arrange;
    }
}
exports.Router = Router;
//# sourceMappingURL=router.js.map