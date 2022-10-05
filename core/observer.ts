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
        const {prop, source} = data
        return this._getter ? this._getter(prop, data) : Array.isArray(source) ? source[prop] : source
    }

    push(data: ObserverDescriptor) {
        const {prop, value} = data
        return this._setter ? this._setter(prop, value, data) : value
    }

    static isObject(data: any) {
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

        pathDelim ||= require('crypto').randomBytes(10).toString('hex')

        return new Proxy(source, {

            set: (t: any, p: string, value: any): any => {

                path = setPath(p, path, pathDelim)

                source[p] = observer.push({prop: p, source, path: getPath(path, pathDelim), value, old: source[p]})

                return true
            },

            get: (t: any, p: string): any => {

                const isStackPointer = Observable.isStackPointer(source, p)
                const isTarget = isStackPointer || !Observer.isObject(source[p]) || Object.keys(source[p]).length === 0

                isStackPointer || (path = setPath(p, path, pathDelim))

                const prop = isStackPointer && path ? path.split(pathDelim).at(-1) : p
                const descriptor = {prop, source, path: getPath(path, pathDelim), isTarget}

                source[prop] = observer.pull(descriptor)

                return descriptor.isTarget ? source[prop] : Observable.get(source[prop], observer, path, pathDelim)
            }
        })
    }

    private static isStackPointer(source: any, prop: string): boolean {
        return ((Array.isArray(source) && isNaN(+prop))
                || (source instanceof Object && !source.hasOwnProperty(prop)))
            || Observable.stackPointer === prop && !(prop in source)
    }

}

