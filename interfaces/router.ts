export type RouteEntry = {
    [name: string]: Route
}

export type Route = string | Array<string | RouteEntryObject>

export type RouteEntryObject = {
    path: string,
    name?: string,
    action?: string,
    types?: {
        // determine which type should be attached to url path string parameter.
        [pathName: string]: typeof Number | RegExp | ((value: any) => any)
    },
}

export type RouteEntryData = {
    pathName: string,
    param: string | undefined,
    isOptional: boolean,
    isSkip: boolean,
    isNumber: boolean,
    index: number,
    pathNames: string[]
}

export type RouteData = {
    route?: string,
    name?: string,
    path: string,
    pathname: string,
    params?: object,
    action?: string,
    [addon: string]: any
}
