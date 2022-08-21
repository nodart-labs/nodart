"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const app_config_1 = require("../core/app_config");
const utils_1 = require("../utils");
const fs = require('fs');
const path = require('path');
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
        this.isFile(path) && (this._target = this.absPath(path));
        return this;
    }
    _resolve(target, args) {
        return target;
    }
    send(filePath, response) {
        var _a;
        const ext = utils_1.$.trim(path.extname(filePath), '.');
        const mimeTypes = Object.assign(Object.assign({}, app_config_1.DEFAULT_MIME_TYPES), (_a = this._app.config.get.mimeTypes) !== null && _a !== void 0 ? _a : {});
        const contentType = mimeTypes[ext] || this._app.config.get.mimeType || app_config_1.DEFAULT_MIME_TYPE;
        fs.readFile(filePath, (err, content) => {
            // todo: exception handler
            if (err) {
                response.writeHead(500);
                response.end();
            }
            else {
                response.writeHead(200, { 'Content-Type': contentType });
                response.end(content, 'utf-8');
            }
        });
    }
}
exports.StaticLoader = StaticLoader;
//# sourceMappingURL=static_loader.js.map