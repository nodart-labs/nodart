import { App } from "../core/app";
import { Orm } from "../core/orm";
import { OrmQueryBuilder } from "../core/interfaces/orm";

export class OrmService {
  readonly orm: Orm;

  readonly query: OrmQueryBuilder;

  constructor(readonly app: App) {
    this.orm = app.get("orm").call();

    this.query = this.orm.queryBuilder;
  }
}
