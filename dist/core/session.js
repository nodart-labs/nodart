"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = exports.DEFAULT_SESSION_NAME = void 0;
exports.DEFAULT_SESSION_NAME = 'session';
class Session {
    constructor(_config) {
        this._config = _config;
        this._client = require("client-sessions")(_config);
        this._sessionName = _config.cookieName || exports.DEFAULT_SESSION_NAME;
    }
    load(req, res) {
        this._client(req, res, () => {
            this._session = req[this._sessionName];
        });
        return this;
    }
    get get() {
        var _a;
        return (_a = this._session) !== null && _a !== void 0 ? _a : {};
    }
    set(key, value) {
        this.get[key] = value;
    }
}
exports.Session = Session;
//# sourceMappingURL=session.js.map