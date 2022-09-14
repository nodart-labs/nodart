export type ObserverDescriptor = {
    source: any,
    prop: string | number,
    path: string[],
    isTarget?: boolean,
    value?: any,
    old?: any
}

export type ObserverGetter = (key: string | number, descriptor: ObserverDescriptor) => any
export type ObserverSetter = (key: string | number, value: any, descriptor: ObserverDescriptor) => any

export type ObserverHandlers = {
    set?: ObserverSetter,
    get?: ObserverGetter,
}
