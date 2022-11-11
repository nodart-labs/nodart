import {BaseModelInterface, OrmQueryBuilder} from "./interfaces/orm";
import {Orm} from "./orm";

export abstract class Model implements BaseModelInterface {
    queryBuilder: OrmQueryBuilder
    orm: Orm
    get query(): OrmQueryBuilder {
        return this.queryBuilder
    }
}
