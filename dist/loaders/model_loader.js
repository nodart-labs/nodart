"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const model_1 = require("../core/model");
class ModelLoader extends app_loader_1.AppLoader {
    constructor() {
        super(...arguments);
        this._repository = 'models';
        this._scope = {
            queryBuilder: null,
            orm: null,
        };
    }
    get targetType() {
        return model_1.Model;
    }
    _onCall(target) {
    }
    _onGenerate(repository) {
    }
    _resolve(target, args) {
        const model = super._resolve(target, args);
        if (!(model instanceof model_1.Model))
            return;
        Object.defineProperty(model, 'orm', {
            get: () => { var _a; return (_a = this._scope).orm || (_a.orm = this._app.get('orm').call()); },
            set: (value) => this._scope.orm = value,
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(model, 'queryBuilder', {
            get: () => { var _a; var _b; return (_b = this._scope).queryBuilder || (_b.queryBuilder = (_a = model.orm) === null || _a === void 0 ? void 0 : _a.queryBuilder); },
            set: (value) => this._scope.queryBuilder = value,
            enumerable: true,
            configurable: true
        });
        return model;
    }
}
exports.ModelLoader = ModelLoader;
//# sourceMappingURL=model_loader.js.map