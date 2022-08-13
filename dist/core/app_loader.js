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
class AppLoader {
    constructor(_app) {
        this._app = _app;
        this._repository = '';
        this._pathSuffix = '';
        this._targetPath = '';
    }
    get targetUnderScorePath() {
        return this._targetPath.replace('/', '_');
    }
    _resolve(target, args) {
        var _a;
        if ((_a = target === null || target === void 0 ? void 0 : target.prototype) === null || _a === void 0 ? void 0 : _a.constructor)
            return Reflect.construct(target, args !== null && args !== void 0 ? args : []);
        return target;
    }
    getTarget() {
        return this._target;
    }
    onGetDependency(target) {
    }
    onGetProperty(property, value, reference) {
    }
    getReferenceTarget(reference) {
        if (!this._targetPath || !reference)
            return;
        const path = this.targetUnderScorePath;
        if (this.isTarget(reference + '/' + path))
            return path;
        if (this.isTarget(reference + '/' + this._targetPath))
            return this._targetPath;
    }
    getReferenceProps(reference) {
    }
    intercept() {
        this._app.di.interceptor(this).intercept();
    }
    require(path) {
        this._target = undefined;
        this.isSource(path) && (this._target = require(this.absPath(path)));
        utils_1.$.isPlainObject(this._target) && (this._target = this._target[Object.keys(this._target)[0]]);
        return this;
    }
    call(args) {
        this._onCall(this._target, args);
        this.intercept();
        return this._resolve(this._target, args);
    }
    generate() {
        return __awaiter(this, void 0, void 0, function* () {
            this._onGenerate(this.getRepo());
            const repo = this.getRepo();
            repo && !utils_1.fs.isDir(repo) && utils_1.fs.mkdir(repo);
            yield this._resolve();
        });
    }
    getRepo() {
        const repo = utils_1.$.trimPath(this._repository);
        return repo ? this._app.rootDir + '/' + repo : '';
    }
    absPath(path) {
        const repo = this.getRepo();
        return repo ? repo + '/' + utils_1.$.trimPath(path) + this._pathSuffix : '';
    }
    isTarget(path) {
        return utils_1.fs.isFile(this._app.rootDir + '/' + utils_1.$.trimPath(path), ['.ts', '.js']);
    }
    isSource(path) {
        return utils_1.fs.isFile(this.absPath(path), ['.ts', '.js']);
    }
}
exports.AppLoader = AppLoader;
//# sourceMappingURL=app_loader.js.map
