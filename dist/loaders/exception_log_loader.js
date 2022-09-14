"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionLogLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const exception_1 = require("../core/exception");
class ExceptionLogLoader extends app_loader_1.AppLoader {
    _onCall(target, args) {
    }
    _resolve(target, args) {
        var _a;
        return Reflect.construct((_a = this._app.config.get.exception.log) !== null && _a !== void 0 ? _a : exception_1.ExceptionLog, [args[0]]);
    }
    _onGenerate(repository) {
    }
}
exports.ExceptionLogLoader = ExceptionLogLoader;
//# sourceMappingURL=exception_log_loader.js.map