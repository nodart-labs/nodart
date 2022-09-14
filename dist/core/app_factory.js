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
exports.AppFactory = void 0;
const app_1 = require("./app");
const app_store_1 = require("./app_store");
const app_config_1 = require("./app_config");
const events = require('../store/system').events;
class AppFactory {
    constructor(_app) {
        this._app = _app;
    }
    get storeData() {
        return {
            store: this._app.config.get.storeName,
            state: this._app.config.get.stateName,
            repo: this.storeRepo
        };
    }
    get storeRepo() {
        const repo = this._app.config.get.store;
        return typeof repo === 'boolean' ? (repo ? app_config_1.CLIENT_STORE : '') : repo;
    }
    createApp() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const loader of Object.keys(this._app.config.getStrict('loaders'))) {
                yield this.createLoader(loader).generate();
            }
        });
    }
    createStore() {
        const { store, repo } = this.storeData;
        repo && store && app_store_1.AppStore.add(store, this._app.rootDir + '/' + repo);
    }
    createState() {
        app_1.App.system.store || app_store_1.AppStore.add(app_config_1.SYSTEM_STORE_NAME, __dirname + '/../' + app_config_1.SYSTEM_STORE);
        app_1.App.system.state.app || app_1.App.system.setup({ app: this._app });
    }
    createEventListener() {
        app_1.App.system.on({
            event: {
                [events.HTTP_REQUEST]: app_config_1.SYSTEM_LISTENERS[events.HTTP_REQUEST],
                [events.HTTP_RESPONSE]: app_config_1.SYSTEM_LISTENERS[events.HTTP_RESPONSE]
            }
        });
    }
    createLoader(name) {
        const loader = this._app.config.getStrict(`loaders.${name}`);
        return Reflect.construct(loader, [this._app]);
    }
}
exports.AppFactory = AppFactory;
//# sourceMappingURL=app_factory.js.map