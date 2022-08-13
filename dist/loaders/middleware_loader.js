"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiddlewareLoader = void 0;
const app_loader_1 = require("../core/app_loader");
class MiddlewareLoader extends app_loader_1.AppLoader {
    constructor() {
        super(...arguments);
        this._repository = 'middleware';
    }
    _onCall(target) {
    }
    _onGenerate(repository) {
    }
}
exports.MiddlewareLoader = MiddlewareLoader;
//# sourceMappingURL=middleware_loader.js.map