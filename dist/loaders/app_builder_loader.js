"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppBuilderLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const app_1 = require("../core/app");
class AppBuilderLoader extends app_loader_1.AppLoader {
    onCall(target, args) {
    }
    onGenerate(repository) {
    }
    call(args) {
        var _a;
        return new app_1.AppBuilder((_a = args === null || args === void 0 ? void 0 : args[0]) !== null && _a !== void 0 ? _a : this.app);
    }
}
exports.AppBuilderLoader = AppBuilderLoader;
//# sourceMappingURL=app_builder_loader.js.map