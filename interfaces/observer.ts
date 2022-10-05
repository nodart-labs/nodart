export type ObserverDescriptor = {
    source: any,
    prop: string | number,
    path: string[],
    isTarget?: boolean,
    value?: any,
    old?: any
}

export type ObserverGetter = (property: string | number, descriptor: ObserverDescriptor) => any
export type ObserverSetter = (property: string | number, value: any, descriptor: ObserverDescriptor) => any

export type ObserverHandlers = {
    set?: ObserverSetter,
    get?: ObserverGetter,
}

export type ObserverWatcher = {
    [property: string]: {
        get: (value: any, descriptor?: {old: any, path: string, isTarget: boolean, source: any}) => any
        set: (value: any, descriptor?: {old: any, path: string, isTarget: boolean, source: any}) => any
    }
}
