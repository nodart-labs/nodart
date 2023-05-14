import { App } from "../core/app";
import { Orm } from "../core/orm";
import { OrmQueryBuilder } from "../core/interfaces/orm";
import { OrmLoader } from "../loaders/orm_loader";

export class OrmService {
  readonly orm: Orm;

  readonly query: OrmQueryBuilder;

  readonly loader: OrmLoader;

  constructor(readonly app: App) {
    this.loader = this.app.get("orm");
    this.orm = this.loader.call();
    this.query = this.orm.queryBuilder;
  }
}
