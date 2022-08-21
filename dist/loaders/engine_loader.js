"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngineLoader = void 0;
const app_loader_1 = require("../core/app_loader");
class EngineLoader extends app_loader_1.AppLoader {
    constructor() {
        super(...arguments);
        this._repository = 'views';
    }
    _onCall(target, args) {
    }
    _onGenerate(repository) {
    }
}
exports.EngineLoader = EngineLoader;
//# sourceMappingURL=engine_loader.js.map