"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = exports.ModelBehavior = void 0;
class ModelBehavior {
    constructor(_model) {
        this._model = _model;
    }
}
exports.ModelBehavior = ModelBehavior;
class Model {
    constructor(construct) {
    }
    setProvider(provider) {
        this._provider = provider;
    }
}
exports.Model = Model;
//# sourceMappingURL=model.js.map