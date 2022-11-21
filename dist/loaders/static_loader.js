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
        var _a, _b;
        var _c, _d;
        path !== '/' && path.includes('%') && (path = decodeURIComponent(path));
        const config = args[0];
        (_c = StaticLoader.cache)[_d = config.rootDir] || (_c[_d] = {});
        if (StaticLoader.cache[config.rootDir][path] !== undefined)
            return StaticLoader.cache[config.rootDir][path];
        if (path === '/') {
            const repo = ((_a = config.static) === null || _a === void 0 ? void 0 : _a.dirname) || app_config_1.DEFAULT_STATIC_REPOSITORY;
            const index = ((_b = config.static) === null || _b === void 0 ? void 0 : _b.index) || app_config_1.DEFAULT_STATIC_INDEX;
            const indexPath = utils_1.fs.join(config.rootDir, utils_1.fs.join(repo, index));
            return StaticLoader.cache[config.rootDir][path] = utils_1.fs.isFile(indexPath) ? indexPath : '';
        }
        return this.absPath(utils_1.$.trimPath(path), config.rootDir);
    }
    serve(path, scope) {
        var _a;
        var _b, _c;
        scope.app || (scope.app = this.app);
        scope.mimeTypes || (scope.mimeTypes = http_client_1.HttpClient.mimeTypes((_a = scope.app.config.get.http) === null || _a === void 0 ? void 0 : _a.mimeTypes));
        const extension = utils_1.fs.getExtension(path);
        const readStream = utils_1.fs.system.createReadStream(path);
        const file = { error: null, exists: true };
        (_b = StaticLoader.cache)[_c = scope.app.rootDir] || (_b[_c] = {});
        readStream.on('error', (err) => __awaiter(this, void 0, void 0, function* () {
            file.exists = err.code !== 'ENOENT' && err.code !== 'EISDIR';
            file.error = err;
            if (file.exists)
                return scope.app.resolveException(new exception_1.HttpException({
                    exceptionMessage: `Could not read data from file "${path.replace(this.getRepo(scope.app.rootDir), '')}".`,
                    exceptionData: err
                }), scope.request, scope.response);
            StaticLoader.cache[scope.app.rootDir][scope.request.url] = path.endsWith('favicon.ico') ? false : '';
        }));
        readStream.on('close', () => {
            file.error || http_client_1.HttpClient.getResponseIsSent(scope.response) || scope.response.writeHead(http_1.HTTP_STATUS.OK, {
                'Content-Type': http_client_1.HttpClient.getDefaultContentType(extension, scope.mimeTypes, http_client_1.FILE_CONTENT_TYPE)
            });
            scope.callback(file.exists || StaticLoader.cache[scope.app.rootDir][scope.request.url]);
        });
        readStream.pipe(scope.response);
    }
    onGenerate(repository) {
    }
}
exports.StaticLoader = StaticLoader;
StaticLoader.cache = {};
//# sourceMappingURL=static_loader.js.map