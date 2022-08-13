"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreLoader = void 0;
const utils_1 = require("../utils");
const app_loader_1 = require("../core/app_loader");
const app_config_1 = require("../core/app_config");
class StoreLoader extends app_loader_1.AppLoader {
    _onCall(target) {
    }
    _onGenerate(repository) {
        repository = this._app.factory.storeRepo;
        repository && (this._repository = repository);
    }
    _resolve() {
        const repo = this.getRepo();
        if (!repo)
            return;
        const state = utils_1.$.trimPath(this._app.config.get.stateName) || app_config_1.CLIENT_STATE_NAME;
        const dest = repo + '/' + utils_1.$.trim(state, ['.js', '.ts']);
        (0, app_config_1.getSamples)('store').forEach(samp => {
            utils_1.fs.isFile(samp) && !utils_1.fs.isFile(dest, ['js', 'ts']) && utils_1.fs.copy(samp, dest + '.ts');
        });
    }
}
exports.StoreLoader = StoreLoader;
//# sourceMappingURL=store_loader.js.map