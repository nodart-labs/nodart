"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Middleware = void 0;
class Middleware {
    constructor(scope = {}) {
        this.scope = scope;
        this.cases = [];
        this._uses = [];
    }
    setScope(scope) {
        Object.assign(this.scope, scope);
    }
    use(reference, props = []) {
        this._uses.push({ reference, props });
        return this;
    }
    on(rule, descriptor, payload) {
        this.cases.push({
            uses: this._uses,
            rule,
            descriptor,
            payload,
        });
        this._uses = [];
    }
}
exports.Middleware = Middleware;
//# sourceMappingURL=middleware.js.map