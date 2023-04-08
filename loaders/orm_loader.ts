import { AppLoader } from "../core/app_loader";
import { Orm } from "../core/orm";
import { App } from "../core/app";
import { fs, object } from "../utils";
import {
  DEFAULT_DATABASE_MIGRATION_REPOSITORY,
  DEFAULT_DATABASE_MIGRATION_SRC_REPOSITORY,
  DEFAULT_DATABASE_REPOSITORY,
  DEFAULT_DATABASE_SEED_REPOSITORY,
  DEFAULT_DATABASE_SEED_SRC_REPOSITORY,
} from "../core/app_config";
import { OrmConfig } from "../core/interfaces/orm";

export class OrmLoader extends AppLoader {
  protected _repository = DEFAULT_DATABASE_REPOSITORY;

  constructor(readonly app: App) {
    super(app);
    this.repository = app.config.get.database || DEFAULT_DATABASE_REPOSITORY;
  }

  get migrationSourceDirectory() {
    return fs.join(this.getRepo(), DEFAULT_DATABASE_MIGRATION_SRC_REPOSITORY);
  }

  get seedSourceDirectory() {
    return fs.join(this.getRepo(), DEFAULT_DATABASE_SEED_SRC_REPOSITORY);
  }

  onGenerate() {
    const db = this.database(this.app.config.get.orm || {});
    const migrationsDir = db.migrations.directory;
    const seedsDir = db.seeds.directory;
    const srcDir = this.migrationSourceDirectory;
    const srcSeedDir = this.seedSourceDirectory;

    typeof migrationsDir === "string" &&
      (fs.isDir(migrationsDir) || fs.mkDeepDir(migrationsDir));

    typeof seedsDir === "string" &&
      (fs.isDir(seedsDir) || fs.mkDeepDir(seedsDir));

    fs.isDir(srcDir) || fs.mkDeepDir(srcDir);
    fs.isDir(srcSeedDir) || fs.mkDeepDir(srcSeedDir);
  }

  call(args?: [config: OrmConfig]): any {
    const getSources = () => this.migrationSourceDirectory;
    const getSeedSources = () => this.seedSourceDirectory;
    const config = this.database(
      object.merge(this.app.config.get.orm || {}, args?.[0] || {}),
    );

    Orm.prototype.sources = function () {
      return this._sources || getSources();
    };

    Orm.prototype.seedSources = function () {
      return this._seedSources || getSeedSources();
    };

    return new Orm(config);
  }

  database(config: OrmConfig) {
    config ||= {};
    config.migrations ||= {};
    config.seeds ||= {};

    const migrations = config.migrations;
    const seeds = config.seeds;
    const repo = this.getRepo();
    const ext = this.app.env.isBuild ? "js" : "ts";
    const loadExt = [".js", ".ts"];

    Array.isArray(migrations.loadExtensions) ||
      (migrations.loadExtensions = []);
    Array.isArray(seeds.loadExtensions) || (seeds.loadExtensions = []);

    return object.merge(config, {
      migrations: {
        tableName: (migrations.tableName ||=
          DEFAULT_DATABASE_MIGRATION_REPOSITORY),
        directory: (migrations.directory ||= fs.path(
          repo,
          DEFAULT_DATABASE_MIGRATION_REPOSITORY,
        )),
        extension: (migrations.extension ||= ext),
        loadExtensions: (migrations.loadExtensions = [
          ...migrations.loadExtensions,
          ...loadExt,
        ]),
      },
      seeds: {
        directory: (seeds.directory ||= fs.path(
          repo,
          DEFAULT_DATABASE_SEED_REPOSITORY,
        )),
        extension: (seeds.extension ||= ext),
        loadExtensions: (seeds.loadExtensions = [
          ...seeds.loadExtensions,
          ...loadExt,
        ]),
      },
    });
  }
}
