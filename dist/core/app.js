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
exports.AppExceptionResolve = exports.App = void 0;
const app_store_1 = require("./app_store");
const app_factory_1 = require("./app_factory");
const di_1 = require("./di");
const router_1 = require("./router");
const app_config_1 = require("./app_config");
const events = require('../store/system').events;
class App {
    constructor(config) {
        this.config = new app_config_1.AppConfig().set(config);
        this.factory = new app_factory_1.AppFactory(this);
        this.di = new di_1.DIManager(this.config.getStrict('reference'), this);
        this.router = new router_1.Router(this.config.get.routes);
    }
    get rootDir() {
        return this.config.get.rootDir;
    }
    get(loader) {
        return this.factory.createLoader(loader);
    }
    get db() {
        const orm = this.get('orm').call([this.config.get.orm]);
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
    serve(port = 3000, protocol = 'http', host) {
        require(protocol).createServer((req, res) => {
            (() => __awaiter(this, void 0, void 0, function* () {
                this.requestPayload && (yield this.requestPayload(req, res));
                yield App.system.listen({ event: { [events.HTTP_REQUEST]: [this, req, res] } }).catch(exception => {
                    const resolve = this.config.get.exception.resolve || AppExceptionResolve;
                    new resolve(this, exception).resolveOnHttp(req, res);
                });
            }))();
        }).listen(port, host, function () {
            console.log(`server start at port ${port}.`, host ? `host: ${host}` : '');
            console.log(`${protocol}://${host ? host : 'localhost'}:${port}`);
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
//# sourceMappingURL=app.js.map