"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrmSchema = void 0;
const knex_schema_inspector_1 = require("knex-schema-inspector");
const warnMessage = "!!! WARNING: Unable to retrieve database schema info.";
class OrmSchema {
    constructor(ormClient) {
        this.ormClient = ormClient;
        try {
            this.client = (0, knex_schema_inspector_1.default)(ormClient);
        }
        catch (err) {
            console.warn(warnMessage, err.message);
        }
    }
    get tables() {
        return this._tables;
    }
    createSchema() {
        return new Promise((resolve, reject) => {
            (() => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const tables = yield ((_a = this.client) === null || _a === void 0 ? void 0 : _a.tables());
                if (!tables)
                    return reject();
                this._tables = {};
                for (const table of tables) {
                    const info = yield this.client.tableInfo(table);
                    const columns = {};
                    for (const data of yield this.client.columns(table)) {
                        columns[data.column] = yield this.client.columnInfo(table, data.column);
                    }
                    this._tables[table] = {
                        info,
                        columns,
                    };
                }
                resolve(null);
            }))();
        }).catch((err) => {
            (err === null || err === void 0 ? void 0 : err.message) && console.warn(warnMessage, err.message);
        });
    }
    getTable(table) {
        var _a, _b;
        return (_b = (_a = this._tables) === null || _a === void 0 ? void 0 : _a[table]) === null || _b === void 0 ? void 0 : _b.info;
    }
    getColumn(table, column) {
        var _a, _b;
        return (_b = (_a = this._tables) === null || _a === void 0 ? void 0 : _a[table]) === null || _b === void 0 ? void 0 : _b.columns[column];
    }
}
exports.OrmSchema = OrmSchema;
//# sourceMappingURL=orm_schema.js.map