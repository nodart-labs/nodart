import {Controller} from "../core/controller";

export type RouteEntry = {
    [name: string]: Route
}

export type Route = string | RouteDescriptor | Array<string | RouteDescriptor>

export type RouteDescriptor = {
    path: string,
    name?: string,
    action?: string,
    controller?: (route: RouteData) => typeof Controller
    types?: {
        [paramName: string]: typeof Number | RegExp | ((value: any) => any)
    },
    [addon: string]: any
}

export type RouteData = RouteDescriptor & {
    pathname: string,
    route?: string,
    params?: {[name: string]: string | number},
    query?: {[name: string]: any},
}
