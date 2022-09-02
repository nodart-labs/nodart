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
const _path = require('path');
class AppLoader {
    constructor(_app) {
        this._app = _app;
        this._repository = '';
        this._pathSuffix = '';
        this._targetPath = '';
        this._serviceScope = {};
    }
    get serviceScope() {
        return Object.assign(Object.assign({}, this._serviceScope), { app: this._app });
    }
    set serviceScope(scope) {
        Object.assign(this._serviceScope, scope);
    }
    _resolve(target, args) {
        var _a;
        if ((_a = target === null || target === void 0 ? void 0 : target.prototype) === null || _a === void 0 ? void 0 : _a.constructor)
            return Reflect.construct(target, args !== null && args !== void 0 ? args : []);
        return target;
    }
    get repository() {
        return utils_1.$.trimPath(this._repository);
    }
    getTarget() {
        return this._target;
    }
    onGetDependency(target) {
    }
    onGetProperty(property, value, reference) {
    }
    getUnderScorePath(targetPath) {
        targetPath || (targetPath = this._targetPath);
        return targetPath.replace('/', '_');
    }
    getReferenceTarget(referencePathLike, targetPath) {
        targetPath || (targetPath = this._targetPath);
        if (!targetPath || !referencePathLike)
            return;
        const path = this.getUnderScorePath(targetPath);
        if (this.isTarget(referencePathLike + '/' + path))
            return path;
        if (this.isTarget(referencePathLike + '/' + this._targetPath))
            return targetPath;
    }
    getReferenceProps(reference) {
    }
    intercept() {
        this._app.di.interceptor(this).intercept();
    }
    require(path, targetObjectType) {
        this._target = undefined;
        this.isSource(path) && (this._target = utils_1.fs.getSource(this.absPath(path), targetObjectType || this.targetType));
        return this;
    }
    get targetType() {
        return undefined;
    }
    call(args = []) {
        this._onCall(this._target, args);
        this.intercept();
        return this._resolve(this._target, args);
    }
    generate() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._onGenerate(this.getRepo());
        });
    }
    getRepo() {
        const repo = this.repository;
        if (!repo)
            return '';
        const path = _path.resolve(this._app.rootDir, repo);
        utils_1.fs.isDir(path) || utils_1.fs.mkDeepDir(path);
        return path;
    }
    absPath(path) {
        const repo = this.getRepo();
        path = this.securePath(path);
        return repo ? _path.resolve(repo, utils_1.$.trimPath(path) + this._pathSuffix) : '';
    }
    isTarget(path) {
        return utils_1.fs.isFile(_path.resolve(this._app.rootDir, utils_1.$.trimPath(path)), ['ts', 'js']);
    }
    isSource(path) {
        return utils_1.fs.isFile(this.absPath(path), ['ts', 'js']);
    }
    isFile(path) {
        return utils_1.fs.isFile(this.absPath(path));
    }
    securePath(path) {
        return path.replace('../', '').replace('..\\', '');
    }
    intersectLoader(loaderName, subRepo, targetPath) {
        subRepo || (subRepo = '');
        targetPath || (targetPath = this._targetPath);
        const loader = this._app.get(loaderName);
        if (!loader)
            return;
        const referenceTarget = loader.getReferenceTarget(loader.repository + (subRepo ? '/' + utils_1.$.trimPath(subRepo) : ''), utils_1.$.trimPath(targetPath));
        if (referenceTarget)
            return loader.require(subRepo + '/' + referenceTarget);
    }
}
exports.AppLoader = AppLoader;
//# sourceMappingURL=app_loader.js.map