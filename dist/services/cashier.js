"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashierService = void 0;
const utils_1 = require("../utils");
const app_config_1 = require("../core/app_config");
const fs_cashier_1 = require("../utils/fs_cashier");
const model_1 = require("../core/model");
const service_1 = require("../core/service");
class CashierService {
    constructor(app) {
        this.app = app;
        this.model = {};
        this.service = {};
        const staticLoader = app.get("static");
        const engineLoader = app.get("engine");
        const storeLoader = app.get("store");
        const ormLoader = app.get("orm");
        const excludeFolders = [
            utils_1.fs.join(app.rootDir, "node_modules"),
            utils_1.fs.join(app.rootDir, app_config_1.DEFAULT_CMD_DIR),
            staticLoader.getRepo(),
            engineLoader.getRepo(),
            storeLoader.getRepo(),
            ormLoader.getRepo(),
            app.builder.buildDir,
        ];
        this.fs = new fs_cashier_1.FSCashier({ excludeFolders, extensions: ["ts", "js"] });
    }
    cacheAppFolder() {
        this.fs.cacheFolder(this.app.rootDir);
        this._fetchSources("model");
        this._fetchSources("service");
    }
    watchAppFolder() {
        this.fs.watchFolder(this.app.rootDir);
    }
    getFile(path) {
        return this.fs.getFile(path);
    }
    isFile(path) {
        return fs_cashier_1.FSCashier.isFile(path);
    }
    _fetchSources(name) {
        this[name] = {};
        const loader = this.app.get(name);
        const repo = loader.getRepo();
        const types = {
            model: model_1.Model,
            service: service_1.Service,
        };
        utils_1.fs.dir(repo, ({ file }) => {
            if (!file)
                return;
            const path = utils_1.fs.skipExtension(utils_1.$.trimPath(utils_1.fs.formatPath(file.replace(repo, ""))));
            const source = loader.load(path, types[name]);
            source && utils_1.object.set(this[name], path.replace(/\//g, "."), source);
        });
        this[name] = Object.freeze(this[name]);
    }
    get(name) {
        return Object.assign({}, this[name]);
    }
}
exports.CashierService = CashierService;
//# sourceMappingURL=cashier.js.map