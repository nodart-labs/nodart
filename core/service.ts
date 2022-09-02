import {object} from "../utils";
import {App} from "./app";
import {Controller} from "./controller";

export type typeServiceScope = {
    app?: App,
    controller?: Controller,
    [key: string]: any
}

export abstract class Service {

    protected constructor(protected _scope: typeServiceScope = {}) {
    }

    setScope(scope: typeServiceScope) {
        Object.assign(this._scope, scope)
    }

    mergeScope(scope: typeServiceScope) {
        this._scope = object.merge(this._scope, scope)
    }

    fetchScope(pathDot: string, def?: any) {
        return object.get(this._scope, pathDot, def)
    }

    get scope(): typeServiceScope {
        return this._scope
    }
}
