"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfig = exports.APP_CONFIG = exports.DEFAULT_ENGINE_VIEWS_REPOSITORY = exports.DEFAULT_DATABASE_SEED_SRC_REPOSITORY = exports.DEFAULT_DATABASE_SEED_REPOSITORY = exports.DEFAULT_DATABASE_MIGRATION_SRC_REPOSITORY = exports.DEFAULT_DATABASE_MIGRATION_REPOSITORY = exports.DEFAULT_DATABASE_REPOSITORY = exports.DEFAULT_MIME_TYPES = exports.DEFAULT_MIME_TYPE = exports.DEFAULT_STATIC_REPOSITORY = exports.DEFAULT_STATIC_INDEX = exports.DEFAULT_CONTROLLER_NAME = exports.getSamples = exports.SYSTEM_EVENTS = exports.CLIENT_STATE_NAME = exports.CLIENT_STORE_NAME = exports.CLIENT_STORE = exports.SYSTEM_STATE_NAME = exports.SYSTEM_STORE_NAME = exports.SYSTEM_STORE = void 0;
const utils_1 = require("../utils");
const controller_loader_1 = require("../loaders/controller_loader");
const model_loader_1 = require("../loaders/model_loader");
const store_loader_1 = require("../loaders/store_loader");
const service_loader_1 = require("../loaders/service_loader");
const session_loader_1 = require("../loaders/session_loader");
const engine_loader_1 = require("../loaders/engine_loader");
const static_loader_1 = require("../loaders/static_loader");
const orm_loader_1 = require("../loaders/orm_loader");
const _path = require('path');
exports.SYSTEM_STORE = 'store'; //system store repository name
exports.SYSTEM_STORE_NAME = 'system_store';
exports.SYSTEM_STATE_NAME = 'system';
exports.CLIENT_STORE = 'store'; //client store repository name
exports.CLIENT_STORE_NAME = 'app_store';
exports.CLIENT_STATE_NAME = 'app';
exports.SYSTEM_EVENTS = {
    httpRequest: require('../events/http_request')
};
const getSamples = (path) => {
    var _a;
    return (_a = utils_1.fs.dir(_path.resolve(__dirname, `../samples/${path}`))) !== null && _a !== void 0 ? _a : [];
};
exports.getSamples = getSamples;
exports.DEFAULT_CONTROLLER_NAME = 'index';
exports.DEFAULT_STATIC_INDEX = 'index.html';
exports.DEFAULT_STATIC_REPOSITORY = 'static';
exports.DEFAULT_MIME_TYPE = 'application/octet-stream';
exports.DEFAULT_MIME_TYPES = Object.freeze({
    html: 'text/html',
    htm: 'text/html',
    js: 'text/javascript',
    css: 'text/css',
    json: 'application/json',
    png: 'image/png',
    ico: 'image/vnd.microsoft.icon',
    jpg: 'image/jpg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    wav: 'audio/wav',
    mp4: 'video/mp4',
    avi: 'video/x-msvideo',
    woff: 'application/font-woff',
    ttf: 'application/font-ttf',
    eot: 'application/vnd.ms-fontobject',
    otf: 'application/font-otf',
    wasm: 'application/wasm',
});
exports.DEFAULT_DATABASE_REPOSITORY = 'database';
exports.DEFAULT_DATABASE_MIGRATION_REPOSITORY = 'migrations';
exports.DEFAULT_DATABASE_MIGRATION_SRC_REPOSITORY = 'migration_sources';
exports.DEFAULT_DATABASE_SEED_REPOSITORY = 'seeds';
exports.DEFAULT_DATABASE_SEED_SRC_REPOSITORY = 'seed_sources';
exports.DEFAULT_ENGINE_VIEWS_REPOSITORY = 'views';
exports.APP_CONFIG = Object.freeze({
    rootDir: '',
    store: true,
    storeName: exports.CLIENT_STORE_NAME,
    stateName: exports.CLIENT_STATE_NAME,
    routes: {},
    engine: {},
    session: {
        secret: require('crypto').randomBytes(20).toString('hex')
    },
    orm: {},
    database: exports.DEFAULT_DATABASE_REPOSITORY,
    static: exports.DEFAULT_STATIC_REPOSITORY,
    staticIndex: exports.DEFAULT_STATIC_INDEX,
    loaders: {
        controller: controller_loader_1.ControllerLoader,
        model: model_loader_1.ModelLoader,
        store: store_loader_1.StoreLoader,
        service: service_loader_1.ServiceLoader,
        session: session_loader_1.SessionLoader,
        engine: engine_loader_1.EngineLoader,
        static: static_loader_1.StaticLoader,
        orm: orm_loader_1.OrmLoader
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
            throw 'The App Root directory is not defined or does not exist.';
        }
    }
}
exports.AppConfig = AppConfig;
//# sourceMappingURL=app_config.js.map