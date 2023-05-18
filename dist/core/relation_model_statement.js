"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationModelStatement = void 0;
class RelationModelStatement {
    constructor(entity) {
        this.entity = entity;
        this.statements = (query) => ({
            list: (...args) => query.select.apply(query, args),
            get: (arg) => {
                arg &&
                    Object.keys(arg).forEach((k) => {
                        if (arg[k] === undefined)
                            return;
                        Array.isArray(arg[k])
                            ? query.whereIn(k, arg[k])
                            : query.where(k, arg[k]);
                    });
                return query.first();
            },
            set: (arg) => query.update.apply(query, [arg]),
            add: (arg) => query.insert.apply(query, [arg]),
            delete: (arg) => {
                let del = false;
                Object.keys(arg).forEach((k) => {
                    if (arg[k] === undefined)
                        return;
                    del = true;
                    Array.isArray(arg[k])
                        ? query.whereIn(k, arg[k])
                        : query.where(k, arg[k]);
                });
                del && query.delete();
                return query;
            },
            at: (arg) => {
                Object.keys(arg).forEach((k) => {
                    if (arg[k] === undefined)
                        return;
                    Array.isArray(arg[k])
                        ? query.whereIn(k, arg[k])
                        : query.where(k, arg[k]);
                });
                return query;
            },
            use: (callback) => callback(query),
            exclude: (props) => {
                Object.keys(props).forEach((key) => {
                    if (props[key] === undefined)
                        return;
                    Array.isArray(props[key])
                        ? query.whereNotIn(key, props[key])
                        : query.whereNot(key, props[key]);
                });
                return query;
            },
        });
    }
    get getUseStatements() {
        return (this._statements || (this._statements = () => this._createStatementsChain(this.entity)));
    }
    _createStatementsChain(entity) {
        const query = entity.query.table(entity.table);
        const chain = {};
        const statements = this.statements(query);
        Object.keys(statements).forEach((key) => {
            chain[key] = (...args) => {
                statements[key].apply(statements, args);
                return chain;
            };
        });
        Object.assign(chain, {
            get on() {
                return typeof entity.statements === "function"
                    ? entity.statements(query)
                    : {};
            },
            get result() {
                return query;
            },
        });
        return chain;
    }
}
exports.RelationModelStatement = RelationModelStatement;
//# sourceMappingURL=relation_model_statement.js.map