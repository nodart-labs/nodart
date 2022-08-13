"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.observable = exports.observe = exports.Observer = void 0;
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
        let { prop, source } = data;
        return this._getter ? this._getter(prop, data) : Array.isArray(source) ? source[prop] : source;
    }
    push(data) {
        let { prop, value } = data;
        return this._setter ? this._setter(prop, value, data) : value;
    }
    isObject(data) {
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
        pathDelim || (pathDelim = (Math.random() * 100).toString());
        return new Proxy(source, {
            set: (t, p, value) => {
                path = setPath(p, path, pathDelim);
                source[p] = observer.push({ prop: p, source, path: getPath(path, pathDelim), value, old: source[p] });
                return true;
            },
            get: (t, p) => {
                const isStackPointer = Observable.isStackPointer(source, p);
                const isTarget = isStackPointer || !observer.isObject(source[p]);
                isStackPointer || (path = setPath(p, path, pathDelim));
                const handle = () => {
                    const prop = isStackPointer ? path.split(pathDelim).at(-1) : p;
                    const data = isStackPointer
                        ? source[p]
                        : observer.pull({ prop, source, path: getPath(path, pathDelim), isTarget });
                    return source[p] = data;
                };
                return isTarget ? handle() : Observable.get(handle(), observer, path, pathDelim);
            }
        });
    }
    static isStackPointer(source, prop) {
        if ((Array.isArray(source) && isNaN(+prop)) || (source instanceof Object && !source.hasOwnProperty(prop)))
            return true;
        return Observable.stackPointer === prop && !(prop in source);
    }
}
Observable._stackPointer = 'stack';
function observe() {
    return function (target, propertyKey) {
        const value = target[propertyKey];
        Object.defineProperty(target, propertyKey, {
            get: function () {
                return new Observer(value);
            },
            set: function () {
            },
            configurable: true,
            enumerable: true
        });
    };
}
exports.observe = observe;
function observable(handlers) {
    return function (target, propertyKey) {
        const value = target[propertyKey];
        Object.defineProperty(target, propertyKey, {
            get: function () {
                return new Observer(value, handlers).get;
            },
            set: function () {
            },
            configurable: true,
            enumerable: true
        });
    };
}
exports.observable = observable;
//# sourceMappingURL=observer.js.map