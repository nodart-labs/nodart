export type RouteEntry = {
    [name: string]: Route
}

export type Route = string | Array<string | RouteEntryObject>

export type RouteEntryObject = {
    path: string,
    name?: string,
    action?: string,
    types?: {
        [paramName: string]: typeof Number | RegExp | ((value: any) => any)
    },
    [addon: string]: any
}

export type RouteData = {
    path: string,
    pathname: string,
    route?: string,
    name?: string,
    params?: {[name: string]: string | number},
    action?: string,
    [addon: string]: any
}
