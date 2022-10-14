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
exports.AppBuilder = exports.AppExceptionResolve = exports.App = exports.DEFAULT_HOST = exports.DEFAULT_PORT = void 0;
const app_store_1 = require("./app_store");
const app_factory_1 = require("./app_factory");
const di_1 = require("./di");
const router_1 = require("./router");
const exception_1 = require("./exception");
const app_config_1 = require("./app_config");
const http_client_1 = require("./http_client");
const utils_1 = require("../utils");
const events = require('../store/system').events;
exports.DEFAULT_PORT = 3000;
exports.DEFAULT_HOST = 'localhost';
class App {
    constructor(config) {
        this.httpServiceRoutes = [];
        this._host = { port: null, protocol: null, host: null, hostname: null };
        this.config = new app_config_1.AppConfig().set(config);
        this.factory = new app_factory_1.AppFactory(this);
        this.di = new di_1.DIManager(this.config.getStrict('reference'), this);
        this.router = new router_1.Router(this.config.get.routes);
        this.builder = new AppBuilder(this);
    }
    get rootDir() {
        return utils_1.fs.path(this.config.get.rootDir);
    }
    get(loader) {
        return this.factory.createLoader(loader);
    }
    get db() {
        const orm = this.get('orm').call();
        return {
            query: orm.queryBuilder,
            orm
        };
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.factory.createApp();
            this.factory.createStore();
            this.factory.createState();
            this.factory.createEventListener();
            return this;
        });
    }
    start(port = exports.DEFAULT_PORT, protocol = 'http', host = exports.DEFAULT_HOST) {
        this.factory.createStore();
        this.factory.createState();
        this.factory.createEventListener();
        const server = this.serve(port, protocol, host);
        const http = this.service.http();
        return { app: this, http, server };
    }
    serve(port = exports.DEFAULT_PORT, protocol = 'http', host = exports.DEFAULT_HOST) {
        const type = typeof protocol === 'string' ? protocol : Object.keys(protocol)[0];
        const http = typeof protocol === 'string' ? require(protocol) : protocol[type];
        this._host = Object.freeze(http_client_1.HttpClient.fetchHostData({ port, protocol: type, host }));
        return http.createServer((req, res) => {
            (() => __awaiter(this, void 0, void 0, function* () {
                this.requestPayload && (yield this.requestPayload(req, res));
                yield App.system.listen({ event: { [events.HTTP_REQUEST]: [this, req, res] } }).catch(exception => {
                    this.resolveExceptionOnHttp(exception, req, res);
                });
            }))();
        }).listen(port, host, () => {
            console.log(`server start at port ${port}.`, this.uri);
        });
    }
    get host() {
        return Object.assign({}, this._host);
    }
    get uri() {
        return http_client_1.HttpClient.getURI(this.host);
    }
    get service() {
        return {
            http: () => {
                const httpService = this.get('http_service').call();
                httpService.subscribe((data) => {
                    this.httpServiceRoutes.push(data);
                });
                return httpService.httpAcceptor;
            }
        };
    }
    resolveExceptionOnHttp(exception, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const resolve = this.config.get.exception.resolve || AppExceptionResolve;
            yield new resolve(this, exception).resolveOnHttp(req, res);
        });
    }
    setHttpRequestPayload(payload) {
        this._requestPayload = payload;
        return this;
    }
    setHttpHandlerPayload(payload) {
        this._httpHandlerPayload = payload;
        return this;
    }
    setHttpExceptionPayload(payload) {
        this._exceptionPayload = payload;
        return this;
    }
    get requestPayload() {
        return this._requestPayload;
    }
    get httpHandlerPayload() {
        return this._httpHandlerPayload;
    }
    get exceptionPayload() {
        return this._exceptionPayload;
    }
    static store(storeName) {
        return app_store_1.AppStore.get(storeName);
    }
    static state(storeName, storeStateName) {
        return App.store(storeName).get(storeStateName);
    }
    static get system() {
        var _a, _b;
        const store = app_store_1.AppStore.get(app_config_1.SYSTEM_STORE_NAME);
        const state = (_b = (_a = app_store_1.AppStore.get(app_config_1.SYSTEM_STORE_NAME)) === null || _a === void 0 ? void 0 : _a.get(app_config_1.SYSTEM_STATE_NAME)) !== null && _b !== void 0 ? _b : {};
        return {
            events,
            store,
            state,
            setup: (data) => store.setup(app_config_1.SYSTEM_STATE_NAME, data),
            set: (data) => __awaiter(this, void 0, void 0, function* () { return yield store.set(app_config_1.SYSTEM_STATE_NAME, data); }),
            listen: (data) => __awaiter(this, void 0, void 0, function* () { return yield store.listen(app_config_1.SYSTEM_STATE_NAME, data); }),
            on: (data) => store.on(app_config_1.SYSTEM_STATE_NAME, data),
        };
    }
}
exports.App = App;
class AppExceptionResolve {
    constructor(app, exception) {
        this.app = app;
        this.exception = exception;
    }
    getHandler() {
        return this._handler || (this._handler = this.app.get('exception_handler').call([this.exception]));
    }
    getLog() {
        return this._log || (this._log = this.app.get('exception_log').call([this.exception]));
    }
    getExceptionTemplate(response) {
        return this.app.get('exception_template').call([response]);
    }
    resolveOnHttp(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const handler = this.getHandler();
            handler && (this.exception = handler) && (yield handler.resolve());
            const exceptionLog = this.getLog();
            this._httpResponseData = exceptionLog.onHttp(request, response).getHttpResponseData(request, response);
            exceptionLog.dump();
            this._sendHttpException(request, response);
        });
    }
    _sendHttpException(request, response) {
        var _a;
        if (response.headersSent || response.writableEnded || response.writableFinished)
            return;
        const data = (_a = this._httpResponseData) !== null && _a !== void 0 ? _a : {};
        const contentType = data.contentType;
        Object.assign(data, { request, response });
        this.app.exceptionPayload && Object.assign(data, this.app.exceptionPayload(data, this));
        const exceptionTemplate = this.getExceptionTemplate(data);
        response.writeHead(data.status, {
            'Content-Type': contentType === data.contentType
                ? (exceptionTemplate ? 'text/html' : contentType)
                : data.contentType
        });
        response.end(exceptionTemplate || data.content);
    }
}
exports.AppExceptionResolve = AppExceptionResolve;
class AppBuilder {
    constructor(app) {
        this.app = app;
    }
    get buildDir() {
        var _a;
        const buildDirName = this.app.config.get.buildDirName || app_config_1.DEFAULT_APP_BUILD_DIR;
        const buildDir = utils_1.fs.path(this.app.rootDir, buildDirName);
        const tsConfig = this.app.factory.tsConfig;
        return ((_a = tsConfig === null || tsConfig === void 0 ? void 0 : tsConfig.compilerOptions) === null || _a === void 0 ? void 0 : _a.outDir) === buildDirName ? buildDir : null;
    }
    get envIsBuild() {
        const buildDir = this.buildDir;
        return !!(buildDir && this.app.rootDir.startsWith(buildDir));
    }
    build(onError) {
        const buildDir = this.buildDir;
        if (buildDir === null)
            throw new exception_1.RuntimeException('App Build failed. Cannot retrieve a build directory name.'
                + ' Check that configuration parameter "buildDirName" and the option "outDir"'
                + ' in tsconfig.json file are both the same values.');
        utils_1.fs.rmDir(buildDir, (err) => {
            err || require('child_process').execFileSync('tsc', ['--build'], { shell: true, encoding: "utf-8" });
            err && (onError === null || onError === void 0 ? void 0 : onError(err));
        });
    }
}
exports.AppBuilder = AppBuilder;
//# sourceMappingURL=app.js.map