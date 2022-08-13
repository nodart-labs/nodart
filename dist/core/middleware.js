"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Middleware = void 0;
class Middleware {
    constructor(scope = {}) {
        this.scope = scope;
        this.cases = [];
        this._reference = [];
    }
    expose(rule, filter) {
    }
    setScope(scope) {
        Object.assign(this.scope, scope);
    }
    use(reference) {
        Array.isArray(reference) ? this._reference = [...this._reference, ...reference] : this._reference.push(reference);
        return this;
    }
    on(rule, descriptor, payload) {
        this.cases.push({
            uses: this._reference,
            rule,
            descriptor,
            payload,
        });
        this._reference = [];
    }
}
exports.Middleware = Middleware;
//# sourceMappingURL=middleware.js.map