"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrmService = void 0;
class OrmService {
    constructor(app) {
        this.app = app;
        this.loader = this.app.get("orm");
        this.orm = this.loader.call();
    }
    get query() {
        return this.orm.queryBuilder;
    }
}
exports.OrmService = OrmService;
//# sourceMappingURL=orm.js.map