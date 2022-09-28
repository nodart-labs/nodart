import {AppLoader} from "../core/app_loader";
import {Orm} from "../core/orm";
import {App} from "../core/app";
import {fs, object} from "../utils";
import {
    DEFAULT_DATABASE_REPOSITORY,
    DEFAULT_DATABASE_MIGRATION_REPOSITORY,
    DEFAULT_DATABASE_MIGRATION_SRC_REPOSITORY,
    DEFAULT_DATABASE_SEED_REPOSITORY,
    DEFAULT_DATABASE_SEED_SRC_REPOSITORY
} from "../core/app_config";

export class OrmLoader extends AppLoader {

    protected _repository = DEFAULT_DATABASE_REPOSITORY

    constructor(protected _app: App) {
        super(_app)
        this._repository = _app.config.get.database ?? DEFAULT_DATABASE_REPOSITORY
    }

    protected _onCall(target: any) {
    }

    get migrationSourceDirectory() {

        return fs.path(this.getRepo(), DEFAULT_DATABASE_MIGRATION_SRC_REPOSITORY)
    }

    get seedSourceDirectory() {

        return fs.path(this.getRepo(), DEFAULT_DATABASE_SEED_SRC_REPOSITORY)
    }

    protected _onGenerate(repository: string) {

        const db = this.database
        const migrationsDir = db.migrations.directory
        const seedsDir = db.seeds.directory
        const srcDir = this.migrationSourceDirectory
        const srcSeedDir = this.seedSourceDirectory

        typeof migrationsDir === 'string' && (fs.isDir(migrationsDir) || fs.mkDeepDir(migrationsDir))
        typeof seedsDir === 'string' && (fs.isDir(seedsDir) || fs.mkDeepDir(seedsDir))

        fs.isDir(srcDir) || fs.mkDeepDir(srcDir)
        fs.isDir(srcSeedDir) || fs.mkDeepDir(srcSeedDir)
    }

    protected _resolve(target?: any, args?: any[]): any {

        const getSources = () => this.migrationSourceDirectory
        const getSeedSources = () => this.seedSourceDirectory
        const config = object.merge(this.database, (args?.[0] ?? this._app.config.get.orm) ?? {})

        Orm.prototype.sources = function () {
            return this._sources || getSources()
        }
        Orm.prototype.seedSources = function () {
            return this._seedSources || getSeedSources()
        }

        return new Orm(config)
    }

    get database() {

        const config = this._app.config.get.orm ?? {}
        config.migrations ||= {}
        config.seeds ||= {}

        const migrations = object.get(config, 'migrations')
        const seeds = object.get(config, 'seeds')
        const repo = this.getRepo()
        const ext = this._app.builder.envIsBuild ? 'js' : 'ts'
        const loadExt = ['.js', '.ts']

        Array.isArray(migrations.loadExtensions) || (migrations.loadExtensions = [])
        Array.isArray(seeds.loadExtensions) || (seeds.loadExtensions = [])

        return {
            migrations: {
                tableName: migrations.tableName ||= DEFAULT_DATABASE_MIGRATION_REPOSITORY,
                directory: migrations.directory ||= fs.path(repo, DEFAULT_DATABASE_MIGRATION_REPOSITORY),
                extension: migrations.extension ||= ext,
                loadExtensions: migrations.loadExtensions = [...migrations.loadExtensions, ...loadExt],
            },
            seeds: {
                directory: seeds.directory ||= fs.path(repo, DEFAULT_DATABASE_SEED_REPOSITORY),
                extension: seeds.extension ||= ext,
                loadExtensions: seeds.loadExtensions = [...seeds.loadExtensions, ...loadExt],
            }
        }
    }

}
