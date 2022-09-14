"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const app_config_1 = require("../core/app_config");
class StaticLoader extends app_loader_1.AppLoader {
    constructor(_app) {
        var _a;
        super(_app);
        this._app = _app;
        this._repository = app_config_1.DEFAULT_STATIC_REPOSITORY;
        this._repository = (_a = _app.config.get.static) !== null && _a !== void 0 ? _a : app_config_1.DEFAULT_STATIC_REPOSITORY;
    }
    _onCall(target, args) {
    }
    _onGenerate(repository) {
    }
    require(path) {
        path = decodeURIComponent(path);
        this.isFile(path) && (this._target = this.absPath(path));
        return this;
    }
    _resolve(target, args) {
        return target;
    }
    send(filePath, http) {
        return http.sendFile(filePath, this._app.config.get.httpClient.fileMimeType);
    }
}
exports.StaticLoader = StaticLoader;
//# sourceMappingURL=static_loader.js.map