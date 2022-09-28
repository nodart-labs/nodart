import {$} from '../utils'
import {HttpClient} from "./http_client";
import {Route, RouteEntry, RouteEntryObject, RouteData} from "../interfaces/router";

export class Router {

    protected _retrieveRouteParamPattern: RegExp = /^:(\+)?([a-z\d_]+)(\?)?$/i

    protected _routeParamEntryPointer: string = ':'

    constructor(protected _routes: RouteEntry) {
    }

    httpRoute(http: HttpClient): RouteData {

        const {pathname} = http.parseURL

        const route: RouteData = {
            route: '',
            name: '',
            path: '',
            action: '',
            pathname,
            params: {},
        }

        for (let [routeName, routeData] of Object.entries(this._routes)) {

            const data = this.findRoute(routeData, pathname)

            if (data) return Object.assign(route, data, {route: routeName})
        }

        return route
    }

    findRoute(routeData: Route, urlPath: string): RouteData | void {

        urlPath = $.trimPath(urlPath)

        const urlPathSplit = urlPath.split('/')

        if (typeof routeData === 'string') return this.getRouteObject(routeData, urlPath, urlPathSplit)

        for (let route of routeData) {

            route instanceof Object || (route = {path: route})

            const data = this.getRouteObject(route.path, urlPath, urlPathSplit)

            if (data) {

                if (false === this.fetchRoutePathEntryParamTypes(route, data.params)) return

                return {...route, ...data}
            }
        }
    }

    routePathHasParamEntry(path: string) {

        return path.includes(this._routeParamEntryPointer)
    }

    getRouteObject(path: string, urlPath: string, urlPathSplit: string[]): RouteData | void {

        path = $.trimPath(path)

        if (path === urlPath) return {path, pathname: urlPath, params: {}}

        if (false === this.routePathHasParamEntry(path)) return

        const pathSplit = path.split('/')

        const params = {}

        if (urlPathSplit.length > pathSplit.length) return

        for (const [index, entry] of pathSplit.entries()) {

            const target = urlPathSplit[index]

            if (false === entry.startsWith(this._routeParamEntryPointer)) {

                if (target === entry) continue

                return
            }

            const {param, isOptional, isNumber} = this.parseRoutePathEntryParam(entry)

            if (!param) return

            if (isOptional && target === undefined) return {
                path,
                params,
                pathname: urlPath
            }

            if (isNumber && (isNaN(params[param] = parseFloat(target)))) return

            params[param] ??= target
        }

        return {path, params, pathname: urlPath}
    }

    parseRoutePathEntryParam(pathEntry: string) {

        const match = pathEntry.match(this._retrieveRouteParamPattern) // /^(:(\+)?([a-z\d_]+)(\?)?)|(\*)$/i

        return {
            param: match?.[2],
            isOptional: !!match?.[3],
            isNumber: !!match?.[1],
        }
    }

    fetchRoutePathEntryParamTypes(route: RouteEntryObject, params: { [name: string]: string | number }): void | false {

        if (!route.types) return

        for (const [name, value] of Object.entries(params)) {

            if (route.types[name] instanceof Function) params[name] = (route.types[name] as Function)(value) ?? value

            if (route.types[name] instanceof RegExp && !value.toString().match(<RegExp>route.types[name])) return false

            if (route.types[name] === Number && isNaN(params[name] = parseFloat(<string>value))) return false
        }
    }

    arrangeRouteParams(data: RouteData) {

        const {path, params} = data

        const arrange = []

        path.split('/').forEach(entry => {

            const data = this.parseRoutePathEntryParam(entry)

            data.param && (data.param in params) && arrange.push(params[data.param])
        })

        return arrange
    }

}
