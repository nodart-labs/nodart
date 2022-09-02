"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrmLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const orm_1 = require("../core/orm");
const utils_1 = require("../utils");
const app_config_1 = require("../core/app_config");
class OrmLoader extends app_loader_1.AppLoader {
    constructor(_app) {
        var _a;
        super(_app);
        this._app = _app;
        this._repository = app_config_1.DEFAULT_DATABASE_REPOSITORY;
        this._migrationSourceDirectory = '';
        this._seedSourceDirectory = '';
        this._repository = (_a = _app.config.get.database) !== null && _a !== void 0 ? _a : app_config_1.DEFAULT_DATABASE_REPOSITORY;
    }
    _onCall(target) {
    }
    get migrationSourceDirectory() {
        return this._migrationSourceDirectory || (this._migrationSourceDirectory = require('path').resolve(this.getRepo(), app_config_1.DEFAULT_DATABASE_MIGRATION_SRC_REPOSITORY));
    }
    set migrationSourceDirectory(dir) {
        this._migrationSourceDirectory = this.securePath(dir);
    }
    get seedSourceDirectory() {
        return this._seedSourceDirectory || (this._seedSourceDirectory = require('path').resolve(this.getRepo(), app_config_1.DEFAULT_DATABASE_SEED_SRC_REPOSITORY));
    }
    set seedSourceDirectory(dir) {
        this._seedSourceDirectory = this.securePath(dir);
    }
    _onGenerate(repository) {
        const db = this.database;
        const migrationsDir = db.migrations.directory;
        const seedsDir = db.seeds.directory;
        const srcDir = this.migrationSourceDirectory;
        const srcSeedDir = this.seedSourceDirectory;
        typeof migrationsDir === 'string' && (utils_1.fs.isDir(migrationsDir) || utils_1.fs.mkDeepDir(migrationsDir));
        typeof seedsDir === 'string' && (utils_1.fs.isDir(seedsDir) || utils_1.fs.mkDeepDir(seedsDir));
        utils_1.fs.isDir(srcDir) || utils_1.fs.mkDeepDir(srcDir);
        utils_1.fs.isDir(srcSeedDir) || utils_1.fs.mkDeepDir(srcSeedDir);
    }
    _resolve(target, args) {
        var _a;
        const orm = orm_1.Orm;
        const getSources = () => this.migrationSourceDirectory;
        const getSeedSources = () => this.seedSourceDirectory;
        orm.prototype.sources = function () {
            return this._sources || getSources();
        };
        orm.prototype.seedSources = function () {
            return this._seedSources || getSeedSources();
        };
        return new orm((_a = args === null || args === void 0 ? void 0 : args[0]) !== null && _a !== void 0 ? _a : this._app.config.get.orm);
    }
    get database() {
        var _a;
        const config = (_a = this._app.config.get.orm) !== null && _a !== void 0 ? _a : {};
        config.migrations || (config.migrations = {});
        config.seeds || (config.seeds = {});
        const migrations = utils_1.object.get(config, 'migrations');
        const seeds = utils_1.object.get(config, 'seeds');
        const repo = this.getRepo();
        return {
            migrations: {
                tableName: migrations.tableName || (migrations.tableName = app_config_1.DEFAULT_DATABASE_MIGRATION_REPOSITORY),
                directory: migrations.directory || (migrations.directory = repo + '/' + app_config_1.DEFAULT_DATABASE_MIGRATION_REPOSITORY),
                extension: migrations.extension || (migrations.extension = 'ts'),
                loadExtensions: migrations.loadExtensions || (migrations.loadExtensions = ['.ts']),
            },
            seeds: {
                directory: seeds.directory || (seeds.directory = repo + '/' + app_config_1.DEFAULT_DATABASE_SEED_REPOSITORY),
                extension: seeds.extension || (seeds.extension = 'ts'),
                loadExtensions: seeds.loadExtensions || (seeds.loadExtensions = ['.ts']),
            }
        };
    }
}
exports.OrmLoader = OrmLoader;
//# sourceMappingURL=orm_loader.js.map