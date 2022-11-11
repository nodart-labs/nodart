import {object} from "../utils";
import {ServiceScope} from "./interfaces/service";

export abstract class Service {

    constructor(protected _scope: ServiceScope = {}) {
    }

    setScope(scope: ServiceScope) {
        Object.assign(this._scope, scope)
    }

    mergeScope(scope: ServiceScope) {
        this._scope = object.merge(this._scope, scope)
    }

    fetchScope(pathDotted: string, def?: any) {
        return object.get(this._scope, pathDotted, def)
    }

    get scope(): ServiceScope {
        return this._scope
    }
}
