"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = exports.DEFAULT_SESSION_NAME = void 0;
exports.DEFAULT_SESSION_NAME = "session";
class Session {
    constructor(config) {
        this.config = config;
        this.client = require("client-sessions");
        this.client = this.client(config);
        this._sessionName = config.cookieName || exports.DEFAULT_SESSION_NAME;
    }
    load(http) {
        this.client(http.request, http.response, () => (this._session = http.request[this._sessionName]));
        return this;
    }
    get get() {
        return this._session || {};
    }
    set(data) {
        Object.assign(this.get, data);
    }
    unset(key) {
        Array.isArray(key) || (key = [key]);
        key.forEach((k) => k in this.get && delete this.get[k]);
    }
}
exports.Session = Session;
//# sourceMappingURL=session.js.map