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
exports.App = void 0;
const app_store_1 = require("./app_store");
const app_config_1 = require("./app_config");
const app_factory_1 = require("./app_factory");
const di_1 = require("./di");
const router_1 = require("./router");
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
    serve(port = 3000, protocol = 'http') {
        require(protocol).createServer((req, res) => __awaiter(this, void 0, void 0, function* () {
            yield App.system.set({ event: { [events.HTTP_REQUEST]: [this, req, res] } });
        })).listen(port, function () {
            console.log(`server start at port ${port}`);
            console.log(`http://localhost:${port}`);
        });
    }
    setHttpHandler(handler) {
        this._httpHandler = handler;
        return this;
    }
    get httpHandler() {
        return this._httpHandler;
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
            store,
            state,
            setup: (data) => store.setup(app_config_1.SYSTEM_STATE_NAME, data),
            set: (data) => __awaiter(this, void 0, void 0, function* () { return yield store.set(app_config_1.SYSTEM_STATE_NAME, data); }),
            on: (data) => store.on(app_config_1.SYSTEM_STATE_NAME, data),
        };
    }
}
exports.App = App;
//# sourceMappingURL=app.js.map