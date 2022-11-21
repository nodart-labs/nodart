"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const session_1 = require("../core/session");
class SessionLoader extends app_loader_1.AppLoader {
    call(args) {
        return this.getSession(args[0], args[1]);
    }
    getSessionConfig(config) {
        var _a, _b, _c, _d;
        return config
            ? Object.assign(Object.assign({}, ((_b = (_a = this.app.config.get.http) === null || _a === void 0 ? void 0 : _a.session) === null || _b === void 0 ? void 0 : _b.config) || {}), config)
            : ((_d = (_c = this.app.config.get.http) === null || _c === void 0 ? void 0 : _c.session) === null || _d === void 0 ? void 0 : _d.config) || {};
    }
    getSession(http, config) {
        var _a, _b;
        config = this.getSessionConfig(config);
        return typeof ((_b = (_a = this.app.config.get.http) === null || _a === void 0 ? void 0 : _a.session) === null || _b === void 0 ? void 0 : _b.client) === 'function'
            ? this.app.config.get.http.session.client(config, http)
            : new session_1.Session(config).load(http);
    }
    onGenerate(repository) {
    }
}
exports.SessionLoader = SessionLoader;
//# sourceMappingURL=session_loader.js.map