import {$} from '../utils'
import {HttpClient} from "./http_client";

export type typeRouteEntries = {
    [name: string]: typeRoutePathData
}

type typeRoutePathData = string | Array<string | typeRoutePathObject>

type typeRoutePathObject = {
    path: string,
    name?: string,
    action?: string,
    types?: {
        // determine which type should be attached to url path string parameter.
        [pathName: string]: typeof Number | RegExp | ((value: any) => any)
    },
    redirects?: {
        path?: string,
        name?: string,
    }
}

type typeParseRoutePathData = {
    pathName: string,
    param: string | undefined,
    isOptional: boolean,
    isSkip: boolean,
    isNumber: boolean,
    index: number,
    pathNames: string[]
}

export declare type typeDataRoute = {
    route?: string,
    name?: string,
    path: string,
    pathname: string,
    params?: object,
    action?: string,
    [addon: string]: any
}

export class Router {

    protected _retrieveRouteEntryPattern: RegExp = /^(:(\+)?([a-z\d_]+)(\?)?)|(\*)$/i

    protected _routeParamEntryPointer: string = ':'

    protected _skipRouteEntryPointer: string = '*'

    constructor(protected _routes: typeRouteEntries) {
    }

    httpRoute(http: HttpClient): typeDataRoute {
        const {pathname} = http.parseURL
        let route = undefined

        for (let [routeName, routeData] of Object.entries(this._routes)) {
            if ((route = this.findRoute(routeData, pathname))) return {
                route: routeName,
                name: route.name,
                path: route.path,
                pathname: route.pathname,
                params: route.params,
                action: route.action,
            }
        }

        return {
            route: '',
            name: '',
            path: '',
            action: '',
            pathname,
            params: {},
        }
    }

    findRoute(routeData: typeRoutePathData, pathname: string): typeDataRoute | null {

        pathname = $.trimPath(pathname)

        const targetPath = pathname.split('/')
        const getMatch = (routeObject: typeRoutePathObject) => this.getRouteObject(routeObject, pathname, targetPath)

        let match = null

        typeof routeData === 'string'
            ? match = getMatch({path: routeData})
            : routeData.some(route => match = typeof route === 'string' ? getMatch({path: route}) : getMatch(route))

        return match
    }

    getRouteObject(routeData: typeRoutePathObject, pathname: string, targetPath: any[]): typeDataRoute | null {

        let {path, types} = routeData

        if (!types && !path.includes(this._skipRouteEntryPointer) && !path.includes(this._routeParamEntryPointer)) {
            path = $.trimPath(path)
            return path === pathname ? {...routeData, path, pathname} : null
        }

        types ||= {}

        let isMatch = undefined

        const params = this.getRouteParams(path, (args: typeParseRoutePathData) => {
            const value = this.getValidatedRouteParamValue(args, targetPath, types)
            isMatch === false || value === undefined || (isMatch = value !== false)
            return value
        })

        return isMatch ? {...routeData, path, params, pathname} : null
    }

    getRouteParams(routePath: string, assignParamValueCallback: (args: typeParseRoutePathData) => any) {

        routePath = $.trimPath(routePath)
        const params = {}
        const pathNames = $.trimPath(routePath).split('/')

        for (let [index, pathName] of pathNames.entries()) {
            const data = this.getRoutePathEntryData(pathName)
            const value = assignParamValueCallback({
                ...data,
                pathName,
                index,
                pathNames,
            })
            data.param && (['string', 'number']).includes(typeof value) && (params[data.param] = value)
        }

        return params
    }

    getRoutePathEntryData(pathEntry: string) {
        const match = pathEntry.match(this._retrieveRouteEntryPattern) // /^(:(\+)?([a-z\d_]+)(\?)?)|(\*)$/i
        return {
            param: match?.[3],
            isOptional: !!match?.[4],
            isSkip: !!match?.[5],
            isNumber: !!match?.[2],
        }
    }

    getRouteParamValue(args: typeParseRoutePathData,
        targetPath: any[],
        paramTypes: object = {}): undefined | string | number | boolean {

        const {index, param, pathName, isNumber} = args
        const target = targetPath[index]

        if (target === undefined) return
        let value = undefined

        if (isNumber || (param && paramTypes[param] === Number)) isNaN(value = parseFloat(target?.toString())) && (value = false)
        if (param) {
            paramTypes[param] instanceof Function && (value = paramTypes[param](target) ?? target)
            paramTypes[param] instanceof RegExp && target?.toString().match(paramTypes[param]) === null && (value = false)
        }

        return param ? (value ?? target) : pathName
    }

    getValidatedRouteParamValue(args: typeParseRoutePathData,
        targetPath: any[],
        paramTypes: object = {}): undefined | string | number | boolean {

        const {isOptional, isSkip, index} = args
        const value = this.getRouteParamValue(args, targetPath, paramTypes)

        if (isSkip || (value === undefined && isOptional)) return
        if (value === false || !targetPath[index] || value?.toString() !== targetPath[index]?.toString()) return false

        return value
    }

    arrangeRouteParams(data: typeDataRoute) {

        const {path, params} = data
        const arrange = []

        path.split('/').forEach(entry => {
            const data = this.getRoutePathEntryData(entry)
            data.param && (data.param in params) && arrange.push(params[data.param])
        })

        return arrange
    }

}
