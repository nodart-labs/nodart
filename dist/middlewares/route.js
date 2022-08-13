"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
const middleware_1 = require("../core/middleware");
class Route extends middleware_1.Middleware {
    constructor() {
        super(...arguments);
        this.scope = {};
    }
    setScope(scope) {
        super.setScope(scope);
        this.scope.request = scope.http.request;
        this.scope.response = scope.http.response;
    }
    on(requestMethod, route, payload) {
        super.on(requestMethod, route, payload);
    }
}
exports.Route = Route;
//# sourceMappingURL=route.js.map