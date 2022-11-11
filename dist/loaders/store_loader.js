"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreLoader = void 0;
const utils_1 = require("../utils");
const app_loader_1 = require("../core/app_loader");
const app_config_1 = require("../core/app_config");
class StoreLoader extends app_loader_1.AppLoader {
    constructor(app) {
        super(app);
        const repository = app.service.store.repo;
        repository && (this.repository = repository);
    }
    onCall(target) {
    }
    onGenerate(repository) {
        if (!repository)
            return;
        const ext = this.app.env.isCommonJS ? '.js' : '.ts';
        const state = utils_1.$.trimPath(this.app.config.get.stateName) || app_config_1.CLIENT_STATE_NAME;
        const dest = repository + '/' + state + ext;
        utils_1.fs.isFile(dest) || utils_1.fs.copy((0, app_config_1.getSourcesDir)('store/app' + ext), dest);
    }
}
exports.StoreLoader = StoreLoader;
//# sourceMappingURL=store_loader.js.map