"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const app_config_1 = require("../core/app_config");
const http_1 = require("../core/interfaces/http");
const utils_1 = require("../utils");
const exception_1 = require("../core/exception");
const http_client_1 = require("../core/http_client");
class StaticLoader extends app_loader_1.AppLoader {
    constructor(app) {
        super(app);
        this.app = app;
        this._repository = app_config_1.DEFAULT_STATIC_REPOSITORY;
        this.repository = app.config.get.static.dirname || app_config_1.DEFAULT_STATIC_REPOSITORY;
    }
    call(args, path) {
        if (path !== '/') {
            if (!path.includes('.'))
                return '';
            path.includes('%') && (path = decodeURIComponent(path));
        }
        const app = args[0];
        const config = args[1] || {};
        const configStatic = config.static || {};
        const favicon = configStatic.favicon || app_config_1.DEFAULT_STATIC_FAVICON;
        if (path === '/' + favicon) {
            const repo = configStatic.dirname || app_config_1.DEFAULT_STATIC_REPOSITORY;
            const faviconPath = utils_1.fs.join(config.rootDir, utils_1.fs.join(repo, favicon));
            if (app.service.cashier.isFile(faviconPath))
                return faviconPath;
            const response = args[2];
            response.writeHead(http_1.HTTP_STATUS.NO_CONTENT, { 'Content-Type': http_1.HTTP_CONTENT_MIME_TYPES.icon });
            response.end();
            return false;
        }
        if (path === '/') {
            const repo = configStatic.dirname || app_config_1.DEFAULT_STATIC_REPOSITORY;
            const index = configStatic.index || app_config_1.DEFAULT_STATIC_INDEX;
            const indexPath = utils_1.fs.join(config.rootDir, utils_1.fs.join(repo, index));
            return app.service.cashier.isFile(indexPath) ? indexPath : '';
        }
        return this.absPath(utils_1.$.trimPath(path), config.rootDir);
    }
    send(path, scope) {
        return new Promise((resolve) => {
            var _a;
            if (!path) {
                resolve(false);
                return;
            }
            scope.app || (scope.app = this.app);
            scope.mimeTypes || (scope.mimeTypes = http_client_1.HttpClient.mimeTypes((_a = scope.app.config.get.http) === null || _a === void 0 ? void 0 : _a.mimeTypes));
            const extension = utils_1.fs.getExtension(path);
            const readStream = utils_1.fs.system.createReadStream(path);
            const file = { exists: undefined, error: null };
            readStream.on('error', (err) => __awaiter(this, void 0, void 0, function* () {
                file.exists = err.code !== 'ENOENT' && err.code !== 'EISDIR';
                file.error = err;
                file.exists && (yield scope.app.resolveException(new exception_1.HttpException({
                    exceptionMessage: `Could not read data from file "${path.replace(this.getRepo(scope.app.rootDir), '')}".`,
                    exceptionData: err
                }), scope.request, scope.response));
            }));
            readStream.on('close', () => {
                var _a;
                file.error || http_client_1.HttpClient.getResponseIsSent(scope.response) || scope.response.writeHead(http_1.HTTP_STATUS.OK, {
                    'Content-Type': http_client_1.HttpClient.getDefaultContentType(extension, scope.mimeTypes, http_client_1.FILE_CONTENT_TYPE)
                });
                resolve((_a = file.exists) !== null && _a !== void 0 ? _a : true);
            });
            readStream.pipe(scope.response);
        });
    }
    onCall() {
    }
    onGenerate(repository) {
    }
}
exports.StaticLoader = StaticLoader;
//# sourceMappingURL=static_loader.js.map