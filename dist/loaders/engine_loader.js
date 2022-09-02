"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngineLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const app_config_1 = require("../core/app_config");
const engine_1 = require("../core/engine");
class EngineLoader extends app_loader_1.AppLoader {
    constructor(_app) {
        var _a, _b;
        super(_app);
        this._app = _app;
        this._repository = app_config_1.DEFAULT_ENGINE_VIEWS_REPOSITORY;
        this._repository = (_b = (_a = _app.config.get.engine) === null || _a === void 0 ? void 0 : _a.views) !== null && _b !== void 0 ? _b : app_config_1.DEFAULT_ENGINE_VIEWS_REPOSITORY;
    }
    _resolve(target, args) {
        var _a;
        return new engine_1.Engine((_a = args === null || args === void 0 ? void 0 : args[0]) !== null && _a !== void 0 ? _a : this.getEngineConfig());
    }
    getEngineConfig() {
        var _a;
        const config = Object.assign({}, (_a = this._app.config.get.engine) !== null && _a !== void 0 ? _a : {});
        config.views = this.getRepo();
        return config;
    }
    _onCall(target, args) {
    }
    _onGenerate(repository) {
    }
}
exports.EngineLoader = EngineLoader;
//# sourceMappingURL=engine_loader.js.map