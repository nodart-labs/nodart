import { Model } from "./model";
import {
  RelationModelInterface,
  RelationModelStatementInterface,
  RelationModelStatements,
} from "./interfaces/relation_model";
import { DataMutable, MutableInterface } from "./interfaces/mutable";
import { Mutable } from "./mutable";
import { RelationModelStatement } from "./relation_model_statement";

export abstract class RelationModel
  extends Model
  implements
    RelationModelInterface,
    MutableInterface,
    RelationModelStatementInterface
{
  abstract table: string;

  abstract model: object;

  declare mutable: DataMutable;

  private declare _mutate: Mutable<this>;

  declare statements: RelationModelStatements;

  private declare _statement: RelationModelStatement<this>;

  static get table(): string {
    return "";
  }

  get mutate(): Mutable<this> {
    return (this._mutate ||= new Mutable(this));
  }

  get use() {
    this._statement ||= new RelationModelStatement(this);

    return this._statement.getUseStatements();
  }
}
