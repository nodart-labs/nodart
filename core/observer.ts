import {
    ObserverDescriptor,
    ObserverHandlers,
    ObserverSetter,
    ObserverGetter
} from "../interfaces/observer";

export class Observer {

    protected _setter: ObserverSetter = undefined
    protected _getter: ObserverGetter = undefined

    constructor(readonly observable: any = {}, handlers?: ObserverHandlers) {
        handlers && this.handlers(handlers)
    }

    get getter() {
        return this._getter
    }

    get setter() {
        return this._setter
    }

    set getter(get: ObserverGetter) {
        this._getter = get
    }

    set setter(set: ObserverSetter) {
        this._setter = set
    }

    handlers(hdr: ObserverHandlers) {
        hdr.set && (this._setter = hdr.set)
        hdr.get && (this._getter = hdr.get)
        return this
    }

    get get() {
        return Observable.get(this.observable, this)
    }

    pull(data: ObserverDescriptor) {
        let {prop, source} = data
        return this._getter ? this._getter(prop, data) : Array.isArray(source) ? source[prop] : source
    }

    push(data: ObserverDescriptor) {
        let {prop, value} = data
        return this._setter ? this._setter(prop, value, data) : value
    }

    isObject(data: any) {
        return !Array.isArray(data)
            && typeof data !== 'function'
            && data instanceof Object
            && data.constructor === Object
    }

}

const setPath = (prop, path, delim) => path += path ? delim + prop : prop
const getPath = (path, delim) => path.split(delim).slice(0, -1)

class Observable {

    private static _stackPointer = 'stack'

    static get stackPointer() {
        return Observable._stackPointer
    }

    static get(source: any, observer: Observer, path: string = '', pathDelim: string = ''): any {

        pathDelim ||= (Math.random() * 100).toString()

        return new Proxy(source, {

            set: (t: any, p: string, value: any): any => {
                path = setPath(p, path, pathDelim)
                source[p] = observer.push({prop: p, source, path: getPath(path, pathDelim), value, old: source[p]})
                return true
            },

            get: (t: any, p: string): any => {

                const isStackPointer = Observable.isStackPointer(source, p)
                const isTarget = isStackPointer || !observer.isObject(source[p]) || Object.keys(source[p]).length === 0

                isStackPointer || (path = setPath(p, path, pathDelim))

                const handle = () => {

                    const prop = isStackPointer ? path.split(pathDelim).at(-1) : p
                    const data = isStackPointer
                        ? source[p]
                        : observer.pull({prop, source, path: getPath(path, pathDelim), isTarget})

                    return source[p] = data
                }

                return isTarget ? handle() : Observable.get(handle(), observer, path, pathDelim)
            }
        })
    }

    private static isStackPointer(source: any, prop: string): boolean {

        if ((Array.isArray(source) && isNaN(+prop)) || (source instanceof Object && !source.hasOwnProperty(prop))) return true

        return Observable.stackPointer === prop && !(prop in source)
    }

}

export function observe() {
    return function (target: any, propertyKey: string) {
        const value = target[propertyKey]
        Object.defineProperty(target, propertyKey, {
            get: function () {
                return new Observer(value)
            },
            set: function () {
            },
            configurable: true,
            enumerable: true
        })
    }
}

export function observable(handlers: ObserverHandlers) {
    return function (target: any, propertyKey: string) {
        const value = target[propertyKey]
        Object.defineProperty(target, propertyKey, {
            get: function () {
                return new Observer(value, handlers).get
            },
            set: function () {
            },
            configurable: true,
            enumerable: true
        })
    }
}
