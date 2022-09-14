"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionHandlerLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const exception_1 = require("../core/exception");
const exception_2 = require("../core/exception");
class ExceptionHandlerLoader extends app_loader_1.AppLoader {
    _onCall(target, args) {
    }
    _resolve(target, args) {
        var _a, _b;
        const exception = args[0] instanceof exception_1.Exception ? args[0] : new exception_2.RuntimeException({
            exceptionMessage: typeof args[0] === 'string' ? args[0] : (_b = (_a = args[0]) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : '',
            exceptionData: args[0]
        });
        const handler = this._getExceptionHandler(exception);
        return this._target = handler ? Reflect.construct(handler, [exception]) : undefined;
    }
    _onGenerate(repository) {
    }
    _getExceptionHandler(exception) {
        var _a, _b;
        const exceptions = (_a = this._app.config.get.exception.types) !== null && _a !== void 0 ? _a : {};
        const handlers = (_b = this._app.config.get.exception.handlers) !== null && _b !== void 0 ? _b : {};
        for (const [key, value] of Object.entries(exceptions)) {
            if (exception instanceof value) {
                return handlers[key];
            }
        }
    }
}
exports.ExceptionHandlerLoader = ExceptionHandlerLoader;
//# sourceMappingURL=exception_handler_loader.js.map