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
        this._repository = (_a = _app.config.get.database) !== null && _a !== void 0 ? _a : app_config_1.DEFAULT_DATABASE_REPOSITORY;
    }
    _onCall(target) {
    }
    get migrationSourceDirectory() {
        return utils_1.fs.path(this.getRepo(), app_config_1.DEFAULT_DATABASE_MIGRATION_SRC_REPOSITORY);
    }
    get seedSourceDirectory() {
        return utils_1.fs.path(this.getRepo(), app_config_1.DEFAULT_DATABASE_SEED_SRC_REPOSITORY);
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
        var _a, _b;
        const getSources = () => this.migrationSourceDirectory;
        const getSeedSources = () => this.seedSourceDirectory;
        const config = utils_1.object.merge(this.database, (_b = ((_a = args === null || args === void 0 ? void 0 : args[0]) !== null && _a !== void 0 ? _a : this._app.config.get.orm)) !== null && _b !== void 0 ? _b : {});
        orm_1.Orm.prototype.sources = function () {
            return this._sources || getSources();
        };
        orm_1.Orm.prototype.seedSources = function () {
            return this._seedSources || getSeedSources();
        };
        return new orm_1.Orm(config);
    }
    get database() {
        var _a;
        const config = (_a = this._app.config.get.orm) !== null && _a !== void 0 ? _a : {};
        config.migrations || (config.migrations = {});
        config.seeds || (config.seeds = {});
        const migrations = utils_1.object.get(config, 'migrations');
        const seeds = utils_1.object.get(config, 'seeds');
        const repo = this.getRepo();
        const ext = this._app.builder.envIsBuild ? 'js' : 'ts';
        const loadExt = ['.js', '.ts'];
        Array.isArray(migrations.loadExtensions) || (migrations.loadExtensions = []);
        Array.isArray(seeds.loadExtensions) || (seeds.loadExtensions = []);
        return {
            migrations: {
                tableName: migrations.tableName || (migrations.tableName = app_config_1.DEFAULT_DATABASE_MIGRATION_REPOSITORY),
                directory: migrations.directory || (migrations.directory = utils_1.fs.path(repo, app_config_1.DEFAULT_DATABASE_MIGRATION_REPOSITORY)),
                extension: migrations.extension || (migrations.extension = ext),
                loadExtensions: migrations.loadExtensions = [...migrations.loadExtensions, ...loadExt],
            },
            seeds: {
                directory: seeds.directory || (seeds.directory = utils_1.fs.path(repo, app_config_1.DEFAULT_DATABASE_SEED_REPOSITORY)),
                extension: seeds.extension || (seeds.extension = ext),
                loadExtensions: seeds.loadExtensions = [...seeds.loadExtensions, ...loadExt],
            }
        };
    }
}
exports.OrmLoader = OrmLoader;
//# sourceMappingURL=orm_loader.js.map