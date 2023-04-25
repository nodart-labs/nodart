import { knex } from "knex";
import { $, fs, object } from "../utils";
import {
  ConnectionManagerInterface,
  OrmClient,
  OrmConfig,
  OrmMigration,
  OrmMigrationInterface,
  OrmMigratorConfig,
  OrmQueryBuilder,
  OrmSeed,
  OrmSeedInterface,
  OrmSeederConfig,
} from "./interfaces/orm";
import { RuntimeException } from "./exception";

export class Orm implements ConnectionManagerInterface {
  readonly client: OrmClient;

  protected _sources = ""; // Migration sources directory

  protected _seedSources = ""; // Seed sources directory

  constructor(readonly config: OrmConfig) {
    this.client = this.connect(config);
  }

  connect(config: OrmConfig) {
    return knex(config);
  }

  get queryBuilder(): OrmQueryBuilder {
    return this.client.queryBuilder();
  }

  migrator(config?: OrmMigratorConfig) {
    return new OrmMigrator(this, config);
  }

  sources(): string {
    return this._sources;
  }

  seeder(config?: OrmSeederConfig) {
    return new OrmSeeder(this, config);
  }

  seedSources() {
    return this._seedSources;
  }
}

/*
 * Custom migration source class
 * See docs: https://knexjs.org/guide/migrations.html#custom-migration-sources
 * */
export abstract class OrmMigrationSource {
  abstract readonly migrations: OrmMigrationInterface;

  constructor(protected _migrationList: string[] = []) {}

  get migrationList() {
    return this._migrationList.length === 0
      ? Object.keys(this.migrations ?? {})
      : this._migrationList;
  }

  // Must return a Promise containing a list of migrations.
  // Migrations can be whatever you want,
  // they will be passed as arguments to getMigrationName
  // and getMigration
  getMigrations() {
    // In this example we are just returning migration names
    return Promise.resolve(this.migrationList);
  }

  getMigrationName(migration: string) {
    return migration;
  }

  async getMigration(migration: string): Promise<OrmMigration> {
    const target = this.migrations?.[migration];

    return {
      async up(client: OrmClient) {
        await target?.up(client);
      },
      async down(client: OrmClient) {
        await target?.down(client);
      },
    };
  }
}

/**
 * https://knexjs.org/guide/migrations.html
 */
export class OrmMigrator {
  client: OrmClient;

  config: OrmMigratorConfig;

  protected _source: OrmMigrationSource;

  constructor(readonly orm: Orm, config?: OrmMigratorConfig) {
    this._connect(config);
  }

  protected _connect(config?: OrmMigratorConfig) {
    this.config = { ...(this.orm.config.migrations ?? {}), ...(config ?? {}) };

    return (this.client = this.orm.connect(
      object.merge(this.orm.config, { migrations: this.config }),
    ));
  }

  /**
   * Retrieves Migration Source class by its file name/path
   * @param name
   */
  fetchSource(name: string): typeof OrmMigrationSource {
    try {
      return fs.getSource(
        fs.path(this.orm.sources(), name),
        OrmMigrationSource,
      ) as typeof OrmMigrationSource;
    } catch (e) {
      throw new RuntimeException({
        exceptionMessage: `The migration source "${name}" does not exist. Check that the directory for sources has been defined correctly.`,
        exceptionData: e,
      });
    }
  }

  /**
   * Specifies a custom migration source class.
   * @param src
   * @param args
   */
  source(
    src: OrmMigrationSource | typeof OrmMigrationSource | string,
    ...args: any
  ) {
    typeof src === "string" && (src = this.fetchSource(src));

    this._source =
      src instanceof OrmMigrationSource
        ? src
        : src
        ? (Reflect.construct(src, args) as OrmMigrationSource)
        : null;

    return this;
  }

  getSource() {
    return this._source;
  }

  /**
   * Creates a new migration, with the name of the migration being added.
   * @param name
   */
  async make(name: string) {
    return await this.client.migrate.make(name, this.config);
  }

  /**
   * Runs all migrations that have not yet been run.
   */
  async latest() {
    return await this.client.migrate.latest(this.config);
  }

  /**
   * Rolls back the latest migration group. If the all parameter is truthy,
   * all applied migrations will be rolled back instead of just the last batch.
   * The default value for this parameter is false
   * @param all
   */
  async rollback(all = false) {
    return await this.client.migrate.rollback(this.config, all);
  }

  /**
   * Runs the specified (by config.name parameter) or the next chronological migration that has not yet be run.
   */
  async up() {
    return await this.client.migrate.up(this.config);
  }

  /**
   * Will undo the specified (by config.name parameter) or the last migration that was run.
   */
  async down() {
    return await this.client.migrate.down(this.config);
  }

  /**
   * Retrieves and returns the current migration version, as a promise.
   * If there aren't any migrations run yet, returns "none" as the value for the currentVersion.
   */
  async currentVersion() {
    return await this.client.migrate.currentVersion(this.config);
  }

  /**
   * Will return list of completed and pending migrations
   */
  async list() {
    return await this.client.migrate.list(this.config);
  }

  /**
   * Forcibly unlocks the migrations lock table, and ensures that there is only one row in it.
   */
  async unlock() {
    return await this.client.migrate.forceFreeMigrationsLock(this.config);
  }
}

/*
 * Custom seed source class
 * See docs: https://knexjs.org/guide/migrations.html#run
 * */
export abstract class OrmSeedSource {
  abstract readonly seeds: OrmSeedInterface;

  protected constructor(protected _seedsList: string[] = []) {}

  get seedList() {
    return this._seedsList.length === 0
      ? Object.keys(this.seeds ?? {})
      : this._seedsList;
  }

  // Must return a Promise containing a list of seeds.
  // Seeds can be whatever you want, they will be passed as
  // arguments to getSeed
  getSeeds() {
    // In this example we are just returning seed names
    return Promise.resolve(this.seedList);
  }

  async getSeed(seed: string): Promise<OrmSeed> {
    return {
      seed: async (client: OrmClient) => {
        await this.seeds?.[seed]?.(client);
      },
    };
  }
}

export class OrmSeeder {
  client: OrmClient;

  config: OrmSeederConfig;

  protected _source: OrmSeedSource;

  constructor(readonly orm: Orm, config?: OrmSeederConfig) {
    this._connect(config);
  }

  protected _connect(config?: OrmSeederConfig) {
    this.config = { ...(this.orm.config.seeds ?? {}), ...(config ?? {}) };

    return (this.client = this.orm.connect(
      object.merge(this.orm.config, { seeds: this.config }),
    ));
  }

  /**
   * Retrieves Seeder Source class by its file name/path
   * @param name
   */
  fetchSource(name: string): typeof OrmSeedSource {
    try {
      return fs.getSource(
        fs.path(this.orm.seedSources(), name),
        OrmSeedSource,
      ) as typeof OrmSeedSource;
    } catch (e) {
      throw new RuntimeException({
        exceptionMessage: `The seed source "${name}" does not exist. Check that the directory for sources has been defined correctly.`,
        exceptionData: e,
      });
    }
  }

  assignSource() {
    return this._source ? { seedSource: this._source } : undefined;
  }

  /**
   * Specifies a custom seed source class.
   * @param src
   * @param args
   */
  source(src: OrmSeedSource | typeof OrmSeedSource | string, ...args: any) {
    typeof src === "string" && (src = this.fetchSource(src));

    this._source =
      src instanceof OrmSeedSource
        ? src
        : src
        ? (Reflect.construct(src, args) as OrmSeedSource)
        : null;

    return this;
  }

  getSource() {
    return this._source;
  }

  /**
   * Creates a new seed file, with the name of the seed file being added.
   * If the seed directory config is an array of paths, the seed file will be generated in the latest specified.
   * @param name
   */
  async make(name: string) {
    return await this.client.seed.make(name, this.config);
  }

  /**
   * Runs all seed files for the current environment.
   */
  async run() {
    return await this.client.seed.run(this.assignSource() ?? this.config);
  }
}
