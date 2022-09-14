"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = exports.DEFAULT_SESSION_NAME = void 0;
exports.DEFAULT_SESSION_NAME = 'session';
class Session {
    constructor(config) {
        this.config = config;
        this.client = require("client-sessions");
        this.client = this.client(config);
        this._sessionName = config.cookieName || exports.DEFAULT_SESSION_NAME;
    }
    load(http) {
        this.client(http.request, http.response, () => this._session = http.request[this._sessionName]);
        return this;
    }
    get get() {
        var _a;
        return (_a = this._session) !== null && _a !== void 0 ? _a : {};
    }
    set(data) {
        Object.assign(this.get, data);
    }
}
exports.Session = Session;
//# sourceMappingURL=session.js.map