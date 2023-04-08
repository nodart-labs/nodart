import {
  ObserverDescriptor,
  ObserverGetter,
  ObserverHandlers,
  ObserverSetter,
} from "./interfaces/observer";

export class Observer {
  protected _setter?: ObserverSetter;
  protected _getter?: ObserverGetter;

  constructor(readonly observable: object = {}, handlers?: ObserverHandlers) {
    handlers && this.handlers(handlers);
  }

  get getter() {
    return this._getter;
  }

  set getter(get: ObserverGetter) {
    this._getter = get;
  }

  get setter() {
    return this._setter;
  }

  set setter(set: ObserverSetter) {
    this._setter = set;
  }

  handlers(hdr: ObserverHandlers) {
    hdr.set && (this._setter = hdr.set);
    hdr.get && (this._getter = hdr.get);

    return this;
  }

  get get() {
    return Observable.get(this.observable, this);
  }

  pull(data: ObserverDescriptor) {
    const { prop, source } = data;

    return this._getter
      ? this._getter(prop, data)
      : Array.isArray(source)
      ? source[prop]
      : source;
  }

  push(data: ObserverDescriptor) {
    const { prop, value } = data;

    return this._setter ? this._setter(prop, value, data) : undefined;
  }

  static isObject(data: any) {
    return data && typeof data === "object" && data.constructor === Object;
  }
}

const setPath = (prop: string, path: string, delim: string) => {
  return (path += path ? delim + prop : prop);
};
const getPath = (path: string, delim: string) => {
  return path.split(delim).slice(0, -1);
};

class Observable {
  private static _stackPointer = "stack";

  static get(
    source: object,
    observer: Observer,
    {
      path: path = "",
      pathDelim: pathDelim = "",
      lastCall: lastCall = "",
    } = {},
  ): any {
    pathDelim ||= Math.random().toString(20);

    return new Proxy(source, {
      set: (t: any, p: string, value: any): any => {
        const newPath = setPath(p, path, pathDelim);

        lastCall === newPath || (path = newPath);

        const data = observer.push({
          prop: p,
          source,
          path: getPath(path, pathDelim),
          value,
          old: source[p],
        });

        if (data !== undefined) source[p] = data;

        return true;
      },

      get: (t: any, p: string): any => {
        const isStackPointer = Observable.isStackPointer(source, p);
        const isObject = Observer.isObject(source[p]);
        const isTarget =
          !isStackPointer && (!isObject || Object.keys(source[p]).length === 0);

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

  private static isStackPointer(source: any, prop: string): boolean {
    return (
      (Array.isArray(source) && isNaN(+prop)) ||
      (source && typeof source === "object" && !source.hasOwnProperty(prop)) ||
      (Observable._stackPointer === prop && !(prop in source))
    );
  }
}
