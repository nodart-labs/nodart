"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrmLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const orm_1 = require("../core/orm");
const utils_1 = require("../utils");
const app_config_1 = require("../core/app_config");
class OrmLoader extends app_loader_1.AppLoader {
    constructor(app) {
        super(app);
        this.app = app;
        this._repository = app_config_1.DEFAULT_DATABASE_REPOSITORY;
        this.repository = app.config.get.database || app_config_1.DEFAULT_DATABASE_REPOSITORY;
    }
    get migrationSourceDirectory() {
        return utils_1.fs.join(this.getRepo(), app_config_1.DEFAULT_DATABASE_MIGRATION_SRC_REPOSITORY);
    }
    get seedSourceDirectory() {
        return utils_1.fs.join(this.getRepo(), app_config_1.DEFAULT_DATABASE_SEED_SRC_REPOSITORY);
    }
    onGenerate() {
        return __awaiter(this, void 0, void 0, function* () {
            const config = this.createConfig(this.app.config.get.orm || {});
            const migrationsDir = config.migrations.directory;
            const seedsDir = config.seeds.directory;
            const srcDir = this.migrationSourceDirectory;
            const srcSeedDir = this.seedSourceDirectory;
            typeof migrationsDir === "string" &&
                (utils_1.fs.isDir(migrationsDir) || utils_1.fs.mkDeepDir(migrationsDir));
            typeof seedsDir === "string" &&
                (utils_1.fs.isDir(seedsDir) || utils_1.fs.mkDeepDir(seedsDir));
            utils_1.fs.isDir(srcDir) || utils_1.fs.mkDeepDir(srcDir);
            utils_1.fs.isDir(srcSeedDir) || utils_1.fs.mkDeepDir(srcSeedDir);
            config.client &&
                config.connection &&
                (yield this.app.service.db.orm.buildSchema());
        });
    }
    call(args) {
        const config = this.defineConfig(args === null || args === void 0 ? void 0 : args[0]);
        return new orm_1.Orm(config, {
            sources: this.migrationSourceDirectory,
            seedSources: this.seedSourceDirectory,
        });
    }
    defineConfig(config) {
        return this.createConfig(utils_1.object.merge(this.app.config.get.orm || {}, config || {}));
    }
    createConfig(config) {
        config || (config = {});
        config.migrations || (config.migrations = {});
        config.seeds || (config.seeds = {});
        const migrations = config.migrations;
        const seeds = config.seeds;
        const repo = this.getRepo();
        const ext = this.app.env.isBuild ? "js" : "ts";
        const loadExt = [".js", ".ts"];
        Array.isArray(migrations.loadExtensions) ||
            (migrations.loadExtensions = []);
        Array.isArray(seeds.loadExtensions) || (seeds.loadExtensions = []);
        return utils_1.object.merge(config, {
            migrations: {
                tableName: (migrations.tableName || (migrations.tableName = app_config_1.DEFAULT_DATABASE_MIGRATION_REPOSITORY)),
                directory: (migrations.directory || (migrations.directory = utils_1.fs.path(repo, app_config_1.DEFAULT_DATABASE_MIGRATION_REPOSITORY))),
                extension: (migrations.extension || (migrations.extension = ext)),
                loadExtensions: (migrations.loadExtensions = [
                    ...migrations.loadExtensions,
                    ...loadExt,
                ]),
            },
            seeds: {
                directory: (seeds.directory || (seeds.directory = utils_1.fs.path(repo, app_config_1.DEFAULT_DATABASE_SEED_REPOSITORY))),
                extension: (seeds.extension || (seeds.extension = ext)),
                loadExtensions: (seeds.loadExtensions = [
                    ...seeds.loadExtensions,
                    ...loadExt,
                ]),
            },
        });
    }
}
exports.OrmLoader = OrmLoader;
//# sourceMappingURL=orm_loader.js.map