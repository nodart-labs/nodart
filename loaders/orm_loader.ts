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

    protected _migrationSourceDirectory: string = ''

    protected _seedSourceDirectory: string = ''

    constructor(protected _app: App) {
        super(_app)
        this._repository = _app.config.get.database ?? DEFAULT_DATABASE_REPOSITORY
    }

    protected _onCall(target: any) {
    }

    get migrationSourceDirectory() {

        return this._migrationSourceDirectory ||= require('path').resolve(this.getRepo(), DEFAULT_DATABASE_MIGRATION_SRC_REPOSITORY)
    }

    set migrationSourceDirectory(dir: string) {

        this._migrationSourceDirectory = this.securePath(dir)
    }

    get seedSourceDirectory() {

        return this._seedSourceDirectory ||= require('path').resolve(this.getRepo(), DEFAULT_DATABASE_SEED_SRC_REPOSITORY)
    }

    set seedSourceDirectory(dir: string) {

        this._seedSourceDirectory = this.securePath(dir)
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

        const orm = Orm
        const getSources = () => this.migrationSourceDirectory
        const getSeedSources = () => this.seedSourceDirectory

        orm.prototype.sources = function () {
            return this._sources || getSources()
        }
        orm.prototype.seedSources = function () {
            return this._seedSources || getSeedSources()
        }

        return new orm(args?.[0] ?? this._app.config.get.orm)
    }

    get database() {

        const config = this._app.config.get.orm ?? {}
        config.migrations ||= {}
        config.seeds ||= {}

        const migrations = object.get(config, 'migrations')
        const seeds = object.get(config, 'seeds')
        const repo = this.getRepo()

        return {
            migrations: {
                tableName: migrations.tableName ||= DEFAULT_DATABASE_MIGRATION_REPOSITORY,
                directory: migrations.directory ||= repo + '/' + DEFAULT_DATABASE_MIGRATION_REPOSITORY,
                extension: migrations.extension ||= 'ts',
                loadExtensions: migrations.loadExtensions ||= ['.ts'],
            },
            seeds: {
                directory: seeds.directory ||= repo + '/' + DEFAULT_DATABASE_SEED_REPOSITORY,
                extension: seeds.extension ||= 'ts',
                loadExtensions: seeds.loadExtensions ||= ['.ts'],
            }
        }
    }

}
