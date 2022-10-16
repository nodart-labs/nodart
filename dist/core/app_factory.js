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
const utils_1 = require("../utils");
const exception_1 = require("./exception");
const events = require('../store/system').events;
class AppFactory {
    constructor(_app) {
        this._app = _app;
        this.envFileNamePattern = /^[A-z\d.-_]+(\.ts|\.js)$/;
        this.tsConfigFileName = 'tsconfig.json';
    }
    get baseDir() {
        return utils_1.fs.isFile(utils_1.fs.path(this._app.rootDir, this.tsConfigFileName)) ? this._app.rootDir : process.cwd();
    }
    get env() {
        return this._env || (this._env = {
            data: this.envData,
            tsConfig: this.tsConfig
        });
    }
    get envData() {
        const data = utils_1.fs.include(this.envFile, {
            log: false,
            skipExt: true,
            error: () => {
                throw new exception_1.RuntimeException(`No environment data found on the path "${this.envFile}"`);
            }
        });
        return utils_1.$.isPlainObject(data) ? data : {};
    }
    get envFileName() {
        const name = this._app.config.get.envFileName || app_config_1.DEFAULT_ENV_FILE_NAME;
        if (!name.match(this.envFileNamePattern))
            throw new exception_1.RuntimeException(`The environment file name "${name}" does not have a permitted name or extension (.js or .ts).`
                + ' Check the configuration parameter "envFileName".');
        return name;
    }
    get envFile() {
        return utils_1.fs.path(this._app.rootDir, this.envFileName);
    }
    get tsConfig() {
        var _a;
        return (_a = utils_1.fs.json(utils_1.fs.path(this.baseDir, this.tsConfigFileName))) !== null && _a !== void 0 ? _a : {};
    }
    get tsConfigExists() {
        return utils_1.fs.isFile(utils_1.fs.path(this.baseDir, this.tsConfigFileName));
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
        repo && store && app_store_1.AppStore.add(store, utils_1.fs.path(this._app.rootDir, repo));
    }
    createState() {
        app_1.App.system.store || app_store_1.AppStore.add(app_config_1.SYSTEM_STORE_NAME, utils_1.fs.path(__dirname, '../' + app_config_1.SYSTEM_STORE));
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
        return Reflect.construct(this._app.config.getStrict(`loaders.${name}`), [this._app]);
    }
}
exports.AppFactory = AppFactory;
//# sourceMappingURL=app_factory.js.map