import { Knex } from "knex";
import { Table } from "knex-schema-inspector/lib/types/table";
import { Column } from "knex-schema-inspector/lib/types/column";

/**
 * See ORM docs: https://knexjs.org/guide/
 */
export type OrmConfig = Knex.Config;

export type OrmMigratorConfig = Knex.MigratorConfig;

export type OrmClient = Knex;

export type OrmQueryBuilder = Knex.QueryBuilder;

export type OrmMigration = Knex.Migration;

export type OrmSeed = Knex.Seed;

export type OrmSeederConfig = Knex.SeederConfig;

export interface OrmMigrationInterface {
  [name: string]: {
    up(client: OrmClient): any;
    down(client: OrmClient): any;
  };
}

export interface OrmSeedInterface {
  [name: string]: (client: OrmClient) => any;
}

export interface BaseModelInterface {
  orm?: ConnectionManagerInterface;

  get query(): unknown;
}

export interface ConnectionManagerInterface {
  client?: unknown;

  connect(connectionConfig: unknown, ...args: any): unknown;
}

export type OrmSchemaTables = {
  [name: string]: {
    info: Table;
    columns: {
      [name: string]: Column;
    };
  };
};
