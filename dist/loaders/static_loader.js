"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const app_config_1 = require("../core/app_config");
const resource_1 = require("../core/resource");
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
    send(filePath, response) {
        const conf = this._app.config.get;
        return new resource_1.Resource(response).sendFile(filePath, conf.mimeTypes, conf.mimeType);
    }
}
exports.StaticLoader = StaticLoader;
//# sourceMappingURL=static_loader.js.map