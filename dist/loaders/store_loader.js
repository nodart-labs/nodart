"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreLoader = void 0;
const utils_1 = require("../utils");
const app_loader_1 = require("../core/app_loader");
const app_config_1 = require("../core/app_config");
class StoreLoader extends app_loader_1.AppLoader {
    constructor(app) {
        super(app);
        const repository = app.factory.storeRepo;
        repository && (this._repository = repository);
    }
    _onCall(target) {
    }
    _onGenerate(repository) {
        if (!repository)
            return;
        const state = utils_1.$.trimPath(this._app.config.get.stateName) || app_config_1.CLIENT_STATE_NAME;
        const dest = repository + '/' + state + '.ts';
        (0, app_config_1.getSamples)('store').forEach(samp => utils_1.fs.isFile(samp) && !utils_1.fs.isFile(dest) && utils_1.fs.copy(samp, dest));
    }
}
exports.StoreLoader = StoreLoader;
//# sourceMappingURL=store_loader.js.map