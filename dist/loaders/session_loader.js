"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const session_1 = require("../core/session");
class SessionLoader extends app_loader_1.AppLoader {
    _onCall(target) {
    }
    _onGenerate(repository) {
    }
    _resolve(target, args) {
        var _a;
        return new session_1.Session((_a = args === null || args === void 0 ? void 0 : args[0]) !== null && _a !== void 0 ? _a : this._app.config.get.session);
    }
}
exports.SessionLoader = SessionLoader;
//# sourceMappingURL=session_loader.js.map