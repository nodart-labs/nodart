import {object} from "../utils";
import {ServiceScope} from "../interfaces/service";

export abstract class Service {

    protected constructor(protected _scope: ServiceScope = {}) {
    }

    setScope(scope: ServiceScope) {
        Object.assign(this._scope, scope)
    }

    mergeScope(scope: ServiceScope) {
        this._scope = object.merge(this._scope, scope)
    }

    fetchScope(pathDot: string, def?: any) {
        return object.get(this._scope, pathDot, def)
    }

    get scope(): ServiceScope {
        return this._scope
    }
}
