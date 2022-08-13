"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategyLoader = void 0;
const app_loader_1 = require("../core/app_loader");
class StrategyLoader extends app_loader_1.AppLoader {
    constructor() {
        super(...arguments);
        this._repository = 'strategy';
    }
    _onCall(target) {
    }
    _onGenerate(repository) {
    }
}
exports.StrategyLoader = StrategyLoader;
//# sourceMappingURL=strategy_loader.js.map