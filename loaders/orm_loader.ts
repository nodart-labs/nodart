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

  async onGenerate() {
    const config: OrmConfig = this.createConfig(this.app.config.get.orm || {});
    const migrationsDir = config.migrations.directory;
    const seedsDir = config.seeds.directory;
    const srcDir = this.migrationSourceDirectory;
    const srcSeedDir = this.seedSourceDirectory;

    typeof migrationsDir === "string" &&
      (fs.isDir(migrationsDir) || fs.mkDeepDir(migrationsDir));

    typeof seedsDir === "string" &&
      (fs.isDir(seedsDir) || fs.mkDeepDir(seedsDir));

    fs.isDir(srcDir) || fs.mkDeepDir(srcDir);
    fs.isDir(srcSeedDir) || fs.mkDeepDir(srcSeedDir);

    config.client &&
      config.connection &&
      (await this.app.service.db.orm.buildSchema());
  }

  call(args?: [config: OrmConfig]): any {
    const config = this.defineConfig(args?.[0]);

    return new Orm(config, {
      sources: this.migrationSourceDirectory,
      seedSources: this.seedSourceDirectory,
    });
  }

  defineConfig(config?: OrmConfig) {
    return this.createConfig(
      object.merge(this.app.config.get.orm || {}, config || {}),
    );
  }

  createConfig(config: OrmConfig) {
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
