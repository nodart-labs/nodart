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
exports.AppBuilder = exports.AppExceptionResolve = exports.AppEmitter = exports.AppEnv = exports.AppServiceManager = exports.AppModuleFacade = exports.AppModule = exports.AppFactory = exports.App = exports.loaders = exports.DEFAULT_HOST = exports.DEFAULT_PORT = void 0;
const store_1 = require("./store");
const http_1 = require("../services/http");
const di_1 = require("./di");
const router_1 = require("./router");
const exception_1 = require("./exception");
const app_config_1 = require("./app_config");
const http_client_1 = require("./http_client");
const utils_1 = require("../utils");
const module_1 = require("../services/module");
const cashier_1 = require("../services/cashier");
const orm_1 = require("../services/orm");
const events = require('../store/system').events;
exports.DEFAULT_PORT = 3000;
exports.DEFAULT_HOST = 'localhost';
const loaders = () => App.system.state.loaders;
exports.loaders = loaders;
class App {
    constructor(config) {
        this._isStart = false;
        this._isInit = false;
        this._isServe = false;
        this._host = { port: null, protocol: null, host: null, hostname: null };
        this.config = new app_config_1.AppConfig().set(config);
        this.factory = new AppFactory(this);
        this.service = new AppServiceManager(this);
        this.router = new router_1.Router(this.config.get.routes);
        this.builder = new AppBuilder(this);
        this.emitter = new AppEmitter(this);
        this.env = new AppEnv(this);
        this.di = new di_1.DIContainer({ mediator: this, references: this.config.getStrict('reference') });
    }
    get rootDir() {
        return this.config.get.rootDir;
    }
    get(loader) {
        return this.factory.createLoader(loader);
    }
    get isStart() {
        return this._isStart;
    }
    get isInit() {
        return this._isInit;
    }
    get isServe() {
        return this._isServe;
    }
    get host() {
        return Object.assign({}, this._host);
    }
    get uri() {
        return http_client_1.HttpClient.getURI(this.host);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.service.check().throwIsInit;
            this.factory.createStore();
            this.factory.createState();
            this.factory.createEventListener();
            yield this.factory.createApp();
            this.service.cashier.cacheAppFolder();
            this._isInit = true;
            return this;
        });
    }
    start(port = exports.DEFAULT_PORT, protocol = 'http', host = exports.DEFAULT_HOST, serve) {
        return __awaiter(this, void 0, void 0, function* () {
            this.service.check().throwIsStart;
            this.factory.createState();
            this.factory.createEventListener();
            this.service.cashier.cacheAppFolder();
            const server = yield this.serve(port, protocol, host, serve);
            const http = this.service.http;
            this._isStart = true;
            return { app: this, http, server };
        });
    }
    serve(port = exports.DEFAULT_PORT, protocol = 'http', host = exports.DEFAULT_HOST, serve) {
        return __awaiter(this, void 0, void 0, function* () {
            this.service.check().throwIsServe;
            let server;
            if (serve) {
                server = serve();
            }
            else {
                server = require(protocol).createServer((req, res) => {
                    (() => __awaiter(this, void 0, void 0, function* () { return yield this.httpHandle(req, res); }))();
                }).listen(port, host, () => {
                    console.log(`server start at port ${port}.`, this.uri);
                });
            }
            this._host = Object.freeze(http_client_1.HttpClient.fetchHostData({ port, protocol, host }));
            this._isServe = true;
            yield this.emitter.emit('ON_START_SERVER', { server });
            this.service.cashier.cacheAppFolder();
            return server;
        });
    }
    httpHandle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            this.service.requestPayload && (yield this.service.requestPayload(req, res));
            yield App.system.listen({ event: { [events.HTTP_REQUEST]: [this, req, res] } }).catch(exception => {
                this.resolveException(exception, req, res);
            });
        });
    }
    resolveException(exception, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const resolve = this.config.get.exception.resolve || AppExceptionResolve;
            yield new resolve(this, exception).resolveOnHttp(req, res);
        });
    }
    static store(storeName) {
        return store_1.Store.get(storeName);
    }
    static state(storeName, storeStateName) {
        return App.store(storeName).get(storeStateName);
    }
    static get system() {
        var _a, _b;
        const store = store_1.Store.get(app_config_1.SYSTEM_STORE_NAME);
        const state = (_b = (_a = store_1.Store.get(app_config_1.SYSTEM_STORE_NAME)) === null || _a === void 0 ? void 0 : _a.get(app_config_1.SYSTEM_STATE_NAME)) !== null && _b !== void 0 ? _b : {};
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
class AppFactory {
    constructor(app) {
        this.app = app;
    }
    createApp() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const loader of Object.keys(this.app.config.getStrict('loaders'))) {
                yield this.createLoader(loader).generate();
            }
        });
    }
    createStore() {
        const { store, repo } = this.app.service.store.data;
        repo && store && store_1.Store.add(store, utils_1.fs.path(this.app.rootDir, repo));
    }
    createState() {
        App.system.store || store_1.Store.add(app_config_1.SYSTEM_STORE_NAME, utils_1.fs.path(__dirname, '../' + app_config_1.SYSTEM_STORE));
        App.system.state.app || App.system.setup({
            app: this.app,
            loaders: {
                static: this.createLoader('static'),
                http: this.createLoader('http'),
                httpService: this.createLoader('http_service'),
                controller: this.createLoader('controller'),
                service: this.createLoader('service'),
                model: this.createLoader('model'),
            }
        });
    }
    createEventListener() {
        App.system.on({
            event: {
                [events.HTTP_REQUEST]: app_config_1.SYSTEM_EVENTS[events.HTTP_REQUEST],
                [events.HTTP_RESPONSE]: app_config_1.SYSTEM_EVENTS[events.HTTP_RESPONSE]
            }
        });
    }
    createLoader(name) {
        return Reflect.construct(this.app.config.getStrict(`loaders.${name}`), [this.app]);
    }
}
exports.AppFactory = AppFactory;
class AppModule {
    constructor(app, config = { options: {} }) {
        this.app = app;
        this.config = config;
    }
}
exports.AppModule = AppModule;
class AppModuleFacade {
    constructor(module) {
        this.module = module;
    }
}
exports.AppModuleFacade = AppModuleFacade;
class AppServiceManager {
    constructor(app) {
        this.app = app;
    }
    get store() {
        const config = this.app.config.get;
        return {
            get data() {
                return {
                    store: config.storeName,
                    state: config.stateName,
                    repo: this.repo
                };
            },
            get repo() {
                const repo = config.store;
                return typeof repo === 'boolean' ? (repo ? app_config_1.CLIENT_STORE : '') : repo;
            }
        };
    }
    check(app) {
        app || (app = this.app);
        return {
            get throwIsServe() {
                if (app.isServe)
                    throw 'The App already is being served.';
                return;
            },
            get throwIsStart() {
                if (app.isStart)
                    throw 'The App already has been started.';
                return;
            },
            get throwIsInit() {
                if (app.isInit)
                    throw 'The App already has been initialised.';
                return;
            },
        };
    }
    get http() {
        this.httpService.subscribers.length || this.httpService.subscribe((data) => {
            data.route.callback = data.callback;
            this.app.router.addRoute(data.route, data.action);
        });
        return this.httpService.httpAcceptor;
    }
    get httpService() {
        return this._http || (this._http = new http_1.HttpService());
    }
    get requestPayload() {
        return this._requestPayload;
    }
    setRequestPayload(payload) {
        if (this._requestPayload)
            throw 'The request payload already has been set.';
        this._requestPayload = payload;
    }
    get exceptionPayload() {
        return this._exceptionPayload;
    }
    setExceptionPayload(payload) {
        if (this._exceptionPayload)
            throw 'The exception payload already has been set.';
        this._exceptionPayload = payload;
    }
    get db() {
        return this._orm || (this._orm = new orm_1.OrmService(this.app));
    }
    get module() {
        return this._module || (this._module = new module_1.ModuleService(this.app, this.app.config.get.modules));
    }
    get cashier() {
        return this._cashier || (this._cashier = new cashier_1.CashierService(this.app));
    }
}
exports.AppServiceManager = AppServiceManager;
class AppEnv {
    constructor(app) {
        this.app = app;
        this.envFilenamePattern = /^[A-z\d.-_]+(\.ts|\.js)$/;
        this.tsConfigFileName = 'tsconfig.json';
    }
    get baseDir() {
        return utils_1.fs.isFile(utils_1.fs.path(this.app.rootDir, this.tsConfigFileName)) ? this.app.rootDir : process.cwd();
    }
    get data() {
        return this.env || (this.env = utils_1.fs.include(this.envFile, {
            log: false,
            skipExt: true,
            success: (data) => utils_1.$.isPlainObject(data) ? data : {}
        }));
    }
    get envFilename() {
        const name = this.app.config.get.envFilename || app_config_1.DEFAULT_ENV_FILE_NAME;
        if (!name.match(this.envFilenamePattern))
            throw `The environment file name "${name}" does not have a permitted name or extension (.js or .ts).`;
        return name;
    }
    get envFile() {
        return utils_1.fs.path(this.app.rootDir, this.envFilename);
    }
    get tsConfig() {
        var _a;
        return (_a = utils_1.fs.json(utils_1.fs.path(this.baseDir, this.tsConfigFileName))) !== null && _a !== void 0 ? _a : {};
    }
    get tsConfigExists() {
        return utils_1.fs.isFile(utils_1.fs.path(this.baseDir, this.tsConfigFileName));
    }
    get isCommonJS() {
        return !this.tsConfigExists;
    }
    get isBuild() {
        if (this.isCommonJS)
            return true;
        const buildDir = this.app.builder.buildDir;
        return !!(buildDir && this.app.rootDir.startsWith(buildDir));
    }
}
exports.AppEnv = AppEnv;
class AppEmitter {
    constructor(app) {
        this.app = app;
    }
    emit(event, scope) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            for (const module of this.app.service.module.getModules()) {
                const facade = yield module.init(event, scope);
                if (!facade)
                    continue;
                yield ((_a = facade[event]) === null || _a === void 0 ? void 0 : _a.call(facade, scope));
            }
        });
    }
}
exports.AppEmitter = AppEmitter;
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
        if (http_client_1.HttpClient.getResponseIsSent(response))
            return;
        const data = (_a = this._httpResponseData) !== null && _a !== void 0 ? _a : {};
        const contentType = data.contentType;
        const payload = this.app.service.exceptionPayload;
        Object.assign(data, { request, response });
        payload && Object.assign(data, payload(data, this) || {});
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
        const buildDirname = this.app.config.get.buildDirname || app_config_1.DEFAULT_APP_BUILD_DIR;
        const buildDir = utils_1.fs.path(this.app.env.baseDir, buildDirname);
        const tsConfig = this.app.env.tsConfig;
        return ((_a = tsConfig === null || tsConfig === void 0 ? void 0 : tsConfig.compilerOptions) === null || _a === void 0 ? void 0 : _a.outDir) === buildDirname ? buildDir : null;
    }
    build(onError) {
        if (this.app.env.isCommonJS)
            return;
        const buildDir = this.buildDir;
        if (buildDir === null)
            throw new exception_1.RuntimeException('App Build failed. Cannot retrieve a build directory name.'
                + ' Check that configuration parameter "buildDirname" and the option "outDir"'
                + ' in tsconfig.json file are both the same values.');
        utils_1.fs.rmDir(buildDir, (err) => {
            err || require('child_process').execFileSync('tsc', ['--build'], { shell: true, encoding: "utf-8" });
            err && (onError === null || onError === void 0 ? void 0 : onError(err));
        });
    }
    substractRootDir(buildDir, rootDir) {
        const substract = utils_1.$.trimPath(rootDir.replace(this.app.env.baseDir, ''));
        return substract ? utils_1.fs.path(buildDir, substract) : buildDir;
    }
}
exports.AppBuilder = AppBuilder;
//# sourceMappingURL=app.js.map