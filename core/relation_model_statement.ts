import {
  EmbedRelationModelStatements,
  RelationModelInterface,
  RelationModelStatementChain,
  RelationModelStatementInterface,
} from "./interfaces/relation_model";

export class RelationModelStatement<
  T extends RelationModelStatementInterface & RelationModelInterface,
> implements RelationModelStatementInterface
{
  private declare _statements;

  readonly statements: EmbedRelationModelStatements<T> = (query) => ({
    list: (...args: any) => query.select.apply(query, args),
    get: (arg?: object) => {
      arg &&
        Object.keys(arg).forEach((k) => {
          if (arg[k] === undefined) return;

          Array.isArray(arg[k])
            ? query.whereIn(k, arg[k])
            : query.where(k, arg[k]);
        });

      return query.first();
    },
    set: (arg: object) => query.update.apply(query, [arg]),
    add: (arg: object | object[]) => query.insert.apply(query, [arg]),
    delete: (arg: object) => {
      let del = false;

      Object.keys(arg).forEach((k) => {
        if (arg[k] === undefined) return;
        del = true;

        Array.isArray(arg[k])
          ? query.whereIn(k, arg[k])
          : query.where(k, arg[k]);
      });

      del && query.delete();

      return query;
    },
    at: (arg: object) => {
      Object.keys(arg).forEach((k) => {
        if (arg[k] === undefined) return;

        Array.isArray(arg[k])
          ? query.whereIn(k, arg[k])
          : query.where(k, arg[k]);
      });

      return query;
    },
    use: (callback: (query: T["query"]) => T["query"]) => callback(query),
    exclude: (arg: object) => {
      Object.keys(arg).forEach((k) => {
        if (arg[k] === undefined) return;

        Array.isArray(arg[k])
          ? query.whereNotIn(k, arg[k])
          : query.whereNot(k, arg[k]);
      });

      return query;
    },
  });

  constructor(readonly entity: T) {}

  get getUseStatements(): () => RelationModelStatementChain<T, this> {
    return (this._statements ||= () =>
      this._createStatementsChain(this.entity));
  }

  private _createStatementsChain(
    entity: RelationModelStatementInterface & RelationModelInterface,
  ) {
    const query = entity.query.table(entity.table);
    const chain = {};
    const statements = this.statements(query);

    Object.keys(statements).forEach((key) => {
      chain[key] = (...args: any) => {
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
