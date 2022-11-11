"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrmService = void 0;
class OrmService {
    constructor(app) {
        this.app = app;
        this.orm = app.get('orm').call();
        this.query = this.orm.queryBuilder;
    }
}
exports.OrmService = OrmService;
//# sourceMappingURL=orm.js.map