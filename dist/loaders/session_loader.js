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
        return new session_1.Session(this._app.config.get.session);
    }
}
exports.SessionLoader = SessionLoader;
//# sourceMappingURL=session_loader.js.map