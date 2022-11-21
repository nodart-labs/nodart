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
exports.AppLoader = void 0;
const utils_1 = require("../utils");
const di_1 = require("./di");
class AppLoader extends di_1.DependencyInterceptor {
    constructor(app) {
        super();
        this.app = app;
        this._repository = '';
        this._repositoryPath = '';
        this._pathSuffix = '';
    }
    getDependency(acceptor, property, dependency) {
    }
    get rootDir() {
        return this.app.rootDir;
    }
    get repository() {
        return this._repository;
    }
    set repository(name) {
        this._repository = utils_1.$.trimPathEnd(name);
    }
    get sourceType() {
        return undefined;
    }
    setSource(object) {
        this._source = object;
    }
    load(path, sourceType, rootDir) {
        return utils_1.fs.getSource(this.absPath(path, rootDir), sourceType || this.sourceType);
    }
    require(path, sourceType, rootDir) {
        this._source = this.load(path, sourceType, rootDir);
        return this;
    }
    call(args = [], path, sourceType, rootDir) {
        path && this.require(path, sourceType, rootDir);
        this._source = this.resolve(this._source, args);
        this.intercept();
        return this._source;
    }
    resolve(source, args) {
        var _a;
        if ((_a = source === null || source === void 0 ? void 0 : source.prototype) === null || _a === void 0 ? void 0 : _a.constructor)
            return Reflect.construct(source, args || []);
        return source;
    }
    intercept(source, app) {
        app || (app = this.app);
        app.di.intercept(source || this._source, this);
    }
    generate() {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.getRepo();
            this.app.isStart || utils_1.fs.isDir(repo) || utils_1.fs.mkDeepDir(repo);
            yield this.onGenerate(repo);
        });
    }
    getRepo(rootDir, repoName) {
        if (rootDir || repoName) {
            rootDir || (rootDir = this.rootDir);
            repoName || (repoName = this.repository);
            return utils_1.fs.join(rootDir, repoName);
        }
        if (!this.repository)
            return '';
        return this._repositoryPath || (this._repositoryPath = utils_1.fs.join(this.rootDir, this.repository));
    }
    absPath(path, rootDir) {
        const repo = this.getRepo(rootDir);
        path = this.securePath(path);
        return repo ? utils_1.fs.join(repo, path) + this._pathSuffix : '';
    }
    isSource(path, rootDir) {
        return utils_1.fs.isFile(this.absPath(path, rootDir), ['ts', 'js']);
    }
    isFile(path, rootDir) {
        return utils_1.fs.isFile(this.absPath(path, rootDir));
    }
    securePath(path) {
        path || (path = '');
        return path.includes('.') ? path.replace(/(\.\.\\|\.\.\/)/g, '') : path;
    }
}
exports.AppLoader = AppLoader;
//# sourceMappingURL=app_loader.js.map