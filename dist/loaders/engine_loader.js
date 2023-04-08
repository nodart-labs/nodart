"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngineLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const app_config_1 = require("../core/app_config");
const engine_1 = require("../core/engine");
const utils_1 = require("../utils");
class EngineLoader extends app_loader_1.AppLoader {
    constructor(app) {
        var _a, _b, _c;
        super(app);
        this.app = app;
        this._repository = app_config_1.DEFAULT_ENGINE_VIEWS_REPOSITORY;
        this.repository =
            ((_c = (_b = (_a = this.app.config.get.http) === null || _a === void 0 ? void 0 : _a.engine) === null || _b === void 0 ? void 0 : _b.config) === null || _c === void 0 ? void 0 : _c.views) ||
                app_config_1.DEFAULT_ENGINE_VIEWS_REPOSITORY;
    }
    call(args) {
        return this.getEngine(args === null || args === void 0 ? void 0 : args[0]);
    }
    getEngineConfig(config) {
        var _a, _b;
        const engineConfig = Object.assign(Object.assign({}, (((_b = (_a = this.app.config.get.http) === null || _a === void 0 ? void 0 : _a.engine) === null || _b === void 0 ? void 0 : _b.config) || {})), (config || {}));
        utils_1.fs.isDir(engineConfig.views) || (engineConfig.views = this.getRepo());
        return engineConfig;
    }
    getEngine(config) {
        var _a, _b;
        config = this.getEngineConfig(config);
        return typeof ((_b = (_a = this.app.config.get.http) === null || _a === void 0 ? void 0 : _a.engine) === null || _b === void 0 ? void 0 : _b.client) === "function"
            ? this.app.config.get.http.engine.client(config)
            : new engine_1.Engine(config);
    }
    onGenerate() { }
}
exports.EngineLoader = EngineLoader;
//# sourceMappingURL=engine_loader.js.map