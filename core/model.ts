import { BaseModelInterface, OrmQueryBuilder } from "./interfaces/orm";
import { Orm } from "./orm";

export abstract class Model implements BaseModelInterface {
  orm: Orm;

  get query(): OrmQueryBuilder {
    return this.orm.queryBuilder;
  }
}
