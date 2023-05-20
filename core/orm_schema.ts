import schemaInspector from "knex-schema-inspector";
import { SchemaInspector } from "knex-schema-inspector/lib/types/schema-inspector";
import { Table } from "knex-schema-inspector/lib/types/table";
import { Column } from "knex-schema-inspector/lib/types/column";
import { OrmClient, OrmSchemaTables } from "./interfaces/orm";

const warnMessage = "!!! WARNING: Unable to retrieve database schema info.";

export class OrmSchema {
  readonly client: SchemaInspector;

  private declare _tables: OrmSchemaTables;

  constructor(readonly ormClient: OrmClient) {
    try {
      this.client = schemaInspector(ormClient);
    } catch (err) {
      console.warn(warnMessage, err.message);
    }
  }

  get tables(): void | OrmSchemaTables {
    return this._tables;
  }

  createSchema(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      (async () => {
        const tables = await this.client?.tables();

        if (!tables) return reject();

        this._tables = {};

        for (const table of tables) {
          const info = await this.client.tableInfo(table);
          const columns = {};

          for (const data of await this.client.columns(table)) {
            columns[data.column] = await this.client.columnInfo(
              table,
              data.column,
            );
          }

          this._tables[table] = {
            info,
            columns,
          };
        }

        resolve(null);
      })();
    }).catch((err) => {
      err?.message && console.warn(warnMessage, err.message);
    });
  }

  getTable(table: string): void | Table {
    return this._tables?.[table]?.info;
  }

  getColumn(table: string, column: string): void | Column {
    return this._tables?.[table]?.columns[column];
  }
}
