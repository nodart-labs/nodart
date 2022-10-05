"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Observer = void 0;
class Observer {
    constructor(observable = {}, handlers) {
        this.observable = observable;
        this._setter = undefined;
        this._getter = undefined;
        handlers && this.handlers(handlers);
    }
    get getter() {
        return this._getter;
    }
    get setter() {
        return this._setter;
    }
    set getter(get) {
        this._getter = get;
    }
    set setter(set) {
        this._setter = set;
    }
    handlers(hdr) {
        hdr.set && (this._setter = hdr.set);
        hdr.get && (this._getter = hdr.get);
        return this;
    }
    get get() {
        return Observable.get(this.observable, this);
    }
    pull(data) {
        const { prop, source } = data;
        return this._getter ? this._getter(prop, data) : Array.isArray(source) ? source[prop] : source;
    }
    push(data) {
        const { prop, value } = data;
        return this._setter ? this._setter(prop, value, data) : value;
    }
    static isObject(data) {
        return !Array.isArray(data)
            && typeof data !== 'function'
            && data instanceof Object
            && data.constructor === Object;
    }
}
exports.Observer = Observer;
const setPath = (prop, path, delim) => path += path ? delim + prop : prop;
const getPath = (path, delim) => path.split(delim).slice(0, -1);
class Observable {
    static get stackPointer() {
        return Observable._stackPointer;
    }
    static get(source, observer, path = '', pathDelim = '') {
        pathDelim || (pathDelim = require('crypto').randomBytes(10).toString('hex'));
        return new Proxy(source, {
            set: (t, p, value) => {
                path = setPath(p, path, pathDelim);
                source[p] = observer.push({ prop: p, source, path: getPath(path, pathDelim), value, old: source[p] });
                return true;
            },
            get: (t, p) => {
                const isStackPointer = Observable.isStackPointer(source, p);
                const isTarget = isStackPointer || !Observer.isObject(source[p]) || Object.keys(source[p]).length === 0;
                isStackPointer || (path = setPath(p, path, pathDelim));
                const prop = isStackPointer && path ? path.split(pathDelim).at(-1) : p;
                const descriptor = { prop, source, path: getPath(path, pathDelim), isTarget };
                source[prop] = observer.pull(descriptor);
                return descriptor.isTarget ? source[prop] : Observable.get(source[prop], observer, path, pathDelim);
            }
        });
    }
    static isStackPointer(source, prop) {
        return ((Array.isArray(source) && isNaN(+prop))
            || (source instanceof Object && !source.hasOwnProperty(prop)))
            || Observable.stackPointer === prop && !(prop in source);
    }
}
Observable._stackPointer = 'stack';
//# sourceMappingURL=observer.js.map