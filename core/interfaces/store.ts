import {State} from "../store";

export type StoreState = { [name: string]: any }

export type StoreListeners = {
    event?: { [name: string]: (...args: any) => Promise<any> | any },
    state?: { [name: string]: (...args: any) => Promise<any> | any },
}

export type StoreListenerArguments = {
    event?: { [name: string]: any[] },
    state?: { [name: string]: any },
}

export type StoreListenerObject = {
    event?: string,
    state?: string,
    action: (...args: any) => Promise<any> | any,
    result: any,
}

export type StoreStateObject = {
    events?: object,
    states?: object,
    listeners?: StoreListenerObject[]
}

export type StoreObject = {
    [name: string]: State
}
