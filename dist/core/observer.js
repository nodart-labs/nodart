"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Observer = void 0;
class Observer {
    constructor(observable = {}, handlers) {
        this.observable = observable;
        handlers && this.handlers(handlers);
    }
    get getter() {
        return this._getter;
    }
    set getter(get) {
        this._getter = get;
    }
    get setter() {
        return this._setter;
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
        return this._getter
            ? this._getter(prop, data)
            : Array.isArray(source)
                ? source[prop]
                : source;
    }
    push(data) {
        const { prop, value } = data;
        return this._setter ? this._setter(prop, value, data) : undefined;
    }
    static isObject(data) {
        return data && typeof data === "object" && data.constructor === Object;
    }
}
exports.Observer = Observer;
const setPath = (prop, path, delim) => {
    return (path += path ? delim + prop : prop);
};
const getPath = (path, delim) => {
    return path.split(delim).slice(0, -1);
};
class Observable {
    static get(source, observer, { path: path = "", pathDelim: pathDelim = "", lastCall: lastCall = "", } = {}) {
        pathDelim || (pathDelim = Math.random().toString(20));
        return new Proxy(source, {
            set: (t, p, value) => {
                const newPath = setPath(p, path, pathDelim);
                lastCall === newPath || (path = newPath);
                const data = observer.push({
                    prop: p,
                    source,
                    path: getPath(path, pathDelim),
                    value,
                    old: source[p],
                });
                if (data !== undefined)
                    source[p] = data;
                return true;
            },
            get: (t, p) => {
                const isStackPointer = Observable.isStackPointer(source, p);
                const isObject = Observer.isObject(source[p]);
                const isTarget = !isStackPointer && (!isObject || Object.keys(source[p]).length === 0);
                if (false === isStackPointer) {
                    const newPath = setPath(p, path, pathDelim);
                    lastCall === newPath || (path = newPath);
                    lastCall = path + pathDelim + p;
                    if (isTarget)
                        return observer.pull({
                            prop: p,
                            source,
                            value: source[p],
                            path: getPath(path, pathDelim),
                        });
                }
                if (isObject)
                    return Observable.get(source[p], observer, {
                        path,
                        pathDelim,
                        lastCall,
                    });
                return source[p];
            },
        });
    }
    static isStackPointer(source, prop) {
        return ((Array.isArray(source) && isNaN(+prop)) ||
            (source && typeof source === "object" && !source.hasOwnProperty(prop)) ||
            (Observable._stackPointer === prop && !(prop in source)));
    }
}
Observable._stackPointer = "stack";
//# sourceMappingURL=observer.js.map