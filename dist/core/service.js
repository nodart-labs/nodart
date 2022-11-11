"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = void 0;
const utils_1 = require("../utils");
class Service {
    constructor(_scope = {}) {
        this._scope = _scope;
    }
    setScope(scope) {
        Object.assign(this._scope, scope);
    }
    mergeScope(scope) {
        this._scope = utils_1.object.merge(this._scope, scope);
    }
    fetchScope(pathDotted, def) {
        return utils_1.object.get(this._scope, pathDotted, def);
    }
    get scope() {
        return this._scope;
    }
}
exports.Service = Service;
//# sourceMappingURL=service.js.map