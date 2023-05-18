"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationModel = void 0;
const model_1 = require("./model");
const mutable_1 = require("./mutable");
const relation_model_statement_1 = require("./relation_model_statement");
class RelationModel extends model_1.Model {
    static get table() {
        return "";
    }
    get mutate() {
        return (this._mutate || (this._mutate = new mutable_1.Mutable(this)));
    }
    get use() {
        this._statement || (this._statement = new relation_model_statement_1.RelationModelStatement(this));
        return this._statement.getUseStatements();
    }
}
exports.RelationModel = RelationModel;
//# sourceMappingURL=relation_model.js.map