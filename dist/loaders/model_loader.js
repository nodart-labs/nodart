"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelLoader = void 0;
const app_loader_1 = require("../core/app_loader");
class ModelLoader extends app_loader_1.AppLoader {
    constructor() {
        super(...arguments);
        this._repository = 'models';
    }
    _onCall(target) {
    }
    _onGenerate(repository) {
    }
}
exports.ModelLoader = ModelLoader;
//# sourceMappingURL=model_loader.js.map