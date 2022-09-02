import {BaseModelInterface} from "./interfaces/base_orm_interface";
import {typeOrmQueryBuilder} from "./orm";
import {Orm} from "./orm";

export abstract class Model implements BaseModelInterface {

    queryBuilder: typeOrmQueryBuilder

    orm: Orm

    get query(): typeOrmQueryBuilder {
        return this.queryBuilder
    }
}
