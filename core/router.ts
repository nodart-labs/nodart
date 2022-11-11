import {$} from '../utils'
import {
    RouteEntry,
    RouteData,
    RouterEntries,
    RouterParamEntries,
    RouterParamEntryRoutes,
    RouteDescriptorParamTypes
} from "./interfaces/router";
import {HTTP_METHODS, HttpMethod, HttpURL} from "./interfaces/http";

export class Router {

    readonly entries: RouterEntries = {}

    readonly paramEntries: RouterParamEntries = {}

    protected _paramEntryPointers = {
        param: ':',
        number: '+',
        optional: '?',
    }

    constructor(protected _routes: RouteEntry) {

        this.paramEntries['any'] = []

        this.addEntries(_routes)
    }

    addEntries(routes: RouteEntry) {

        Object.entries(routes).forEach(([name, data]) => {

            Array.isArray(data) || (data = [data])

            for (let route of data as RouteData[]) {

                const routeData = typeof route === 'string' ? {path: route} : route

                this.addRoute(
                    routeData as RouteData,
                    (HTTP_METHODS.includes(route.action) ? route.action : 'any') as HttpMethod,
                    name
                )
            }
        })
    }

    addRoute(desc: string | RouteData, method: HttpMethod | 'any', route?: string) {

        const data = this.getRouteData(typeof desc === 'string' ? {path: desc} : desc)

        data.path = $.trimPath(data.path)
        data.path ||= '/'
        data.route = route || ''

        if (false === data.path.includes(this._paramEntryPointers.param)) {
            this.entries[data.path] ||= {}
            this.entries[data.path][method] = Object.freeze(data)
            return
        }

        this._addParamEntry(data, method)
    }

    protected _addParamEntry(data: RouteData, method: HttpMethod | 'any') {

        const paramNames = {}

        for (const [index, entry] of data.path.split('/').entries()) {

            if (entry[0] !== this._paramEntryPointers.param) continue

            const number = entry[1] === this._paramEntryPointers.number
            const optional = entry.at(-1) === this._paramEntryPointers.optional

            let start = 1, end = entry.length

            number && (start += 1)
            optional && (end -= 1)

            const param = entry.slice(start, end)

            paramNames[index] = param

            data.paramNames.push(param)
            data.paramTypes[param] = {optional, number}
        }

        this.paramEntries[method] ||= []

        const routeData = {
            route: Object.freeze(data),
            path: data.path === '/' ? [] : data.path.split('/'),
            paramNames
        }

        this.paramEntries[method] = [...[routeData], ...this.paramEntries[method]]
    }

    getRouteByURL(url: HttpURL, method: HttpMethod | 'any'): RouteData {

        const pathname = url.pathname
        const route = url.pathname || '/'
        const routeData = this.entries[route]?.[method] || this.entries[route]?.['any']

        if (routeData) return this.getRouteData({...routeData, query: url.query, pathname})

        const routes = [...this.paramEntries[method] || [], ...this.paramEntries['any']] as RouterParamEntryRoutes
        const path = pathname.split('/')

        OUTER: for (const data of routes) {

            if (path.length > data.path.length) continue

            const params = {}

            let paramLength = 0

            for (const [index, entry] of path.entries()) {

                const param = data.paramNames[index]

                if (param) {

                    params[param] = entry

                    const {number} = data.route.paramTypes[param] || {}
                    const type = data.route.types?.[param]

                    if (false === this.validateParam(params, param, {number, type})) continue OUTER

                    paramLength += 1

                } else if (entry !== data.path[index]) continue OUTER
            }

            if (paramLength < data.route.paramNames.length) {

                const types = Object.keys(data.route.paramTypes)

                for (let i = 0; i < types.length; i++) {

                    const optional = data.route.paramTypes[types[i]]?.optional

                    if (params[types[i]] === undefined && !optional) continue OUTER
                }
            }

            return {...data.route, query: url.query, params, pathname}
        }

        return this.getRouteData({query: url.query, pathname})
    }

    getRouteData(assign: object = {}): RouteData {

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
        }, assign)
    }

    validateParam(
        params: object,
        name: string,
        opts: {
            number?: boolean,
            type?: RouteDescriptorParamTypes
        }): boolean | void {

        if (opts.number && (isNaN(params[name] = +params[name]))) return false

        if (opts.type instanceof Function) params[name] = (opts.type as Function)(params[name]) ?? params[name]

        if (opts.type instanceof RegExp && !params[name].toString().match(<RegExp>opts.type)) return false

        return !(opts.type === Number && isNaN(params[name] = +params[name]))
    }

    arrangeRouteParams(data: RouteData) {

        data.params ||= {}
        data.paramNames ||= []

        const arrange = []
        let i = 0
        for (; i < data.paramNames.length; i++) arrange.push(data.params[data.paramNames[i]])

        return arrange
    }
}
