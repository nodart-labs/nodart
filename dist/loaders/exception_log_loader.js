"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionLogLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const exception_1 = require("../core/exception");
class ExceptionLogLoader extends app_loader_1.AppLoader {
    call(args) {
        var _a;
        return Reflect.construct(((_a = this.app.config.get.exception) === null || _a === void 0 ? void 0 : _a.log) || exception_1.ExceptionLog, [args[0]]);
    }
    onGenerate() { }
}
exports.ExceptionLogLoader = ExceptionLogLoader;
//# sourceMappingURL=exception_log_loader.js.map