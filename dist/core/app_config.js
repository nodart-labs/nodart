"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSources = exports.getSourcesDir = exports.AppConfig = exports.APP_CONFIG = exports.DEFAULT_ENGINE_VIEWS_REPOSITORY = exports.DEFAULT_CMD_COMMANDS_DIR = exports.DEFAULT_CMD_DIR = exports.DEFAULT_DATABASE_SEED_SRC_REPOSITORY = exports.DEFAULT_DATABASE_SEED_REPOSITORY = exports.DEFAULT_DATABASE_MIGRATION_SRC_REPOSITORY = exports.DEFAULT_DATABASE_MIGRATION_REPOSITORY = exports.DEFAULT_DATABASE_REPOSITORY = exports.DEFAULT_STATIC_REPOSITORY = exports.DEFAULT_STATIC_INDEX = exports.DEFAULT_CONTROLLER_NAME = exports.SYSTEM_LISTENERS = exports.CLIENT_STATE_NAME = exports.CLIENT_STORE_NAME = exports.CLIENT_STORE = exports.SYSTEM_STATE_NAME = exports.SYSTEM_STORE_NAME = exports.SYSTEM_STORE = void 0;
const utils_1 = require("../utils");
const app_1 = require("./app");
const controller_loader_1 = require("../loaders/controller_loader");
const model_loader_1 = require("../loaders/model_loader");
const store_loader_1 = require("../loaders/store_loader");
const service_loader_1 = require("../loaders/service_loader");
const session_loader_1 = require("../loaders/session_loader");
const engine_loader_1 = require("../loaders/engine_loader");
const static_loader_1 = require("../loaders/static_loader");
const orm_loader_1 = require("../loaders/orm_loader");
const cmd_loader_1 = require("../loaders/cmd_loader");
const http_client_loader_1 = require("../loaders/http_client_loader");
const exception_1 = require("./exception");
const exception_2 = require("./exception");
const exception_handler_loader_1 = require("../loaders/exception_handler_loader");
const exception_3 = require("./exception");
const exception_log_loader_1 = require("../loaders/exception_log_loader");
const exception_template_loader_1 = require("../loaders/exception_template_loader");
const STORE = require('../store/system');
exports.SYSTEM_STORE = 'store'; //system store repository name
exports.SYSTEM_STORE_NAME = 'system_store';
exports.SYSTEM_STATE_NAME = 'system';
exports.CLIENT_STORE = 'store'; //client store repository name
exports.CLIENT_STORE_NAME = 'app_store';
exports.CLIENT_STATE_NAME = 'app';
exports.SYSTEM_LISTENERS = {
    [STORE.events.HTTP_REQUEST]: require('../events/http_request'),
    [STORE.events.HTTP_RESPONSE]: require('../events/http_response'),
};
exports.DEFAULT_CONTROLLER_NAME = 'index';
exports.DEFAULT_STATIC_INDEX = 'index.html';
exports.DEFAULT_STATIC_REPOSITORY = 'static';
exports.DEFAULT_DATABASE_REPOSITORY = 'database';
exports.DEFAULT_DATABASE_MIGRATION_REPOSITORY = 'migrations';
exports.DEFAULT_DATABASE_MIGRATION_SRC_REPOSITORY = 'migration_sources';
exports.DEFAULT_DATABASE_SEED_REPOSITORY = 'seeds';
exports.DEFAULT_DATABASE_SEED_SRC_REPOSITORY = 'seed_sources';
exports.DEFAULT_CMD_DIR = 'cmd';
exports.DEFAULT_CMD_COMMANDS_DIR = 'commands';
exports.DEFAULT_ENGINE_VIEWS_REPOSITORY = 'views';
exports.APP_CONFIG = Object.freeze({
    rootDir: '',
    cli: {},
    store: true,
    storeName: exports.CLIENT_STORE_NAME,
    stateName: exports.CLIENT_STATE_NAME,
    httpClient: {},
    routes: {},
    engine: {},
    session: {
        secret: require('crypto').randomBytes(20).toString('hex')
    },
    orm: {},
    database: exports.DEFAULT_DATABASE_REPOSITORY,
    static: exports.DEFAULT_STATIC_REPOSITORY,
    staticIndex: exports.DEFAULT_STATIC_INDEX,
    exception: {
        resolve: app_1.AppExceptionResolve,
        types: {
            http: exception_2.HttpException,
            runtime: exception_2.RuntimeException,
        },
        handlers: {
            http: exception_1.HttpExceptionHandler,
            runtime: exception_1.RuntimeExceptionHandler,
        },
        log: exception_3.ExceptionLog,
    },
    loaders: {
        http: http_client_loader_1.HttpClientLoader,
        controller: controller_loader_1.ControllerLoader,
        model: model_loader_1.ModelLoader,
        store: store_loader_1.StoreLoader,
        service: service_loader_1.ServiceLoader,
        session: session_loader_1.SessionLoader,
        engine: engine_loader_1.EngineLoader,
        static: static_loader_1.StaticLoader,
        orm: orm_loader_1.OrmLoader,
        cmd: cmd_loader_1.CommandLineLoader,
        exception_handler: exception_handler_loader_1.ExceptionHandlerLoader,
        exception_log: exception_log_loader_1.ExceptionLogLoader,
        exception_template: exception_template_loader_1.ExceptionTemplateLoader
    },
    reference: {
        service: (app, target, props) => app.get('service').require(target).call(props),
        model: (app, target, props) => app.get('model').require(target).call(props),
    }
});
class AppConfig {
    constructor() {
        this._config = Object.assign({}, exports.APP_CONFIG);
    }
    get get() {
        return Object.assign({}, this._config);
    }
    getStrict(keyPathDotted) {
        var _a;
        return (_a = utils_1.object.get(this._config, keyPathDotted)) !== null && _a !== void 0 ? _a : utils_1.object.get(Object.assign({}, exports.APP_CONFIG), keyPathDotted);
    }
    set(config) {
        this._config = utils_1.object.merge(this._config, config);
        this.validate();
        return this;
    }
    validate() {
        this._config.rootDir = utils_1.$.trimPath(this._config.rootDir);
        if (!this._config.rootDir || !utils_1.fs.isDir(this._config.rootDir)) {
            throw new exception_2.RuntimeException('AppConfig: The App Root directory is not defined or does not exist.');
        }
    }
}
exports.AppConfig = AppConfig;
const getSourcesDir = (path) => {
    const _path = require('path');
    const dir = _path.resolve(__dirname, '../../sources');
    const localDir = _path.resolve(__dirname, '../sources');
    const resolve = utils_1.fs.isDir(dir) ? dir : utils_1.fs.isDir(localDir) ? localDir : null;
    return resolve ? (path ? _path.resolve(resolve, path) : resolve) : null;
};
exports.getSourcesDir = getSourcesDir;
const getSources = (path, callback) => {
    const dir = (0, exports.getSourcesDir)(path);
    dir && utils_1.fs.dir(dir).forEach(file => utils_1.fs.isFile(file) && callback(file));
};
exports.getSources = getSources;
//# sourceMappingURL=app_config.js.map