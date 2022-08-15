"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
const middleware_1 = require("../core/middleware");
class Route extends middleware_1.Middleware {
    constructor(_data, scope = {}) {
        super(scope);
        this._data = _data;
        this.scope = scope;
    }
    get data() {
        return this._data;
    }
    set data(data) {
        this._data = data;
    }
    on(action, route, payload) {
        super.on(action, route, payload);
    }
    expose(rule, filter) {
    }
    delete(...args) {
    }
    get(...args) {
    }
    head(...args) {
    }
    patch(...args) {
    }
    post(...args) {
    }
    put(...args) {
    }
}
exports.Route = Route;
//# sourceMappingURL=route.js.map