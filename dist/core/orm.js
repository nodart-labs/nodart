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
exports.OrmSeeder = exports.OrmSeedSource = exports.OrmMigrator = exports.OrmMigrationSource = exports.Orm = void 0;
const knex_1 = require("knex");
const utils_1 = require("../utils");
const exception_1 = require("./exception");
class Orm {
    constructor(config) {
        this.config = config;
        this._sources = ""; // Migration sources directory
        this._seedSources = ""; // Seed sources directory
        this.client = this.connect(config);
    }
    connect(config) {
        return (0, knex_1.knex)(config);
    }
    get queryBuilder() {
        return this.client.queryBuilder();
    }
    migrator(config) {
        return new OrmMigrator(this, config);
    }
    sources() {
        return this._sources;
    }
    seeder(config) {
        return new OrmSeeder(this, config);
    }
    seedSources() {
        return this._seedSources;
    }
}
exports.Orm = Orm;
/*
 * Custom migration source class
 * See docs: https://knexjs.org/guide/migrations.html#custom-migration-sources
 * */
class OrmMigrationSource {
    constructor(_migrationList = []) {
        this._migrationList = _migrationList;
    }
    get migrationList() {
        var _a;
        return this._migrationList.length === 0
            ? Object.keys((_a = this.migrations) !== null && _a !== void 0 ? _a : {})
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
    getMigrationName(migration) {
        return migration;
    }
    getMigration(migration) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const target = (_a = this.migrations) === null || _a === void 0 ? void 0 : _a[migration];
            return {
                up(client) {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (target === null || target === void 0 ? void 0 : target.up(client));
                    });
                },
                down(client) {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (target === null || target === void 0 ? void 0 : target.down(client));
                    });
                },
            };
        });
    }
}
exports.OrmMigrationSource = OrmMigrationSource;
/**
 * https://knexjs.org/guide/migrations.html
 */
class OrmMigrator {
    constructor(orm, config) {
        this.orm = orm;
        this._connect(config);
    }
    _connect(config) {
        var _a;
        this.config = Object.assign(Object.assign({}, ((_a = this.orm.config.migrations) !== null && _a !== void 0 ? _a : {})), (config !== null && config !== void 0 ? config : {}));
        return (this.client = this.orm.connect(utils_1.object.merge(this.orm.config, { migrations: this.config })));
    }
    /**
     * Retrieves Migration Source class by its file name/path
     * @param name
     */
    fetchSource(name) {
        try {
            return utils_1.fs.getSource(utils_1.fs.path(this.orm.sources(), name), OrmMigrationSource);
        }
        catch (e) {
            throw new exception_1.RuntimeException({
                exceptionMessage: `The migration source "${name}" does not exist. Check that the directory for sources has been defined correctly.`,
                exceptionData: e,
            });
        }
    }
    assignSource() {
        return this._source ? { migrationSource: this._source } : undefined;
    }
    /**
     * Specifies a custom migration source class.
     * @param src
     * @param args
     */
    source(src, ...args) {
        typeof src === "string" && (src = this.fetchSource(src));
        this._source =
            src instanceof OrmMigrationSource
                ? src
                : src
                    ? Reflect.construct(src, args)
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
    make(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.migrate.make(name, this.config);
        });
    }
    /**
     * Runs all migrations that have not yet been run.
     */
    latest() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.migrate.latest(this.config);
        });
    }
    /**
     * Rolls back the latest migration group. If the all parameter is truthy,
     * all applied migrations will be rolled back instead of just the last batch.
     * The default value for this parameter is false
     * @param all
     */
    rollback(all = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.migrate.rollback(this.config, all);
        });
    }
    /**
     * Runs the specified (by config.name parameter) or the next chronological migration that has not yet be run.
     */
    up() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.migrate.up((_a = this.assignSource()) !== null && _a !== void 0 ? _a : this.config);
        });
    }
    /**
     * Will undo the specified (by config.name parameter) or the last migration that was run.
     */
    down() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.migrate.down((_a = this.assignSource()) !== null && _a !== void 0 ? _a : this.config);
        });
    }
    /**
     * Retrieves and returns the current migration version, as a promise.
     * If there aren't any migrations run yet, returns "none" as the value for the currentVersion.
     */
    currentVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.migrate.currentVersion(this.config);
        });
    }
    /**
     * Will return list of completed and pending migrations
     */
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.migrate.list(this.config);
        });
    }
    /**
     * Forcibly unlocks the migrations lock table, and ensures that there is only one row in it.
     */
    unlock() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.migrate.forceFreeMigrationsLock(this.config);
        });
    }
}
exports.OrmMigrator = OrmMigrator;
/*
 * Custom seed source class
 * See docs: https://knexjs.org/guide/migrations.html#run
 * */
class OrmSeedSource {
    constructor(_seedsList = []) {
        this._seedsList = _seedsList;
    }
    get seedList() {
        var _a;
        return this._seedsList.length === 0
            ? Object.keys((_a = this.seeds) !== null && _a !== void 0 ? _a : {})
            : this._seedsList;
    }
    // Must return a Promise containing a list of seeds.
    // Seeds can be whatever you want, they will be passed as
    // arguments to getSeed
    getSeeds() {
        // In this example we are just returning seed names
        return Promise.resolve(this.seedList);
    }
    getSeed(seed) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                seed: (client) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b;
                    yield ((_b = (_a = this.seeds) === null || _a === void 0 ? void 0 : _a[seed]) === null || _b === void 0 ? void 0 : _b.call(_a, client));
                }),
            };
        });
    }
}
exports.OrmSeedSource = OrmSeedSource;
class OrmSeeder {
    constructor(orm, config) {
        this.orm = orm;
        this._connect(config);
    }
    _connect(config) {
        var _a;
        this.config = Object.assign(Object.assign({}, ((_a = this.orm.config.seeds) !== null && _a !== void 0 ? _a : {})), (config !== null && config !== void 0 ? config : {}));
        return (this.client = this.orm.connect(utils_1.object.merge(this.orm.config, { seeds: this.config })));
    }
    /**
     * Retrieves Seeder Source class by its file name/path
     * @param name
     */
    fetchSource(name) {
        try {
            return utils_1.fs.getSource(utils_1.fs.path(this.orm.seedSources(), name), OrmSeedSource);
        }
        catch (e) {
            throw new exception_1.RuntimeException({
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
    source(src, ...args) {
        typeof src === "string" && (src = this.fetchSource(src));
        this._source =
            src instanceof OrmSeedSource
                ? src
                : src
                    ? Reflect.construct(src, args)
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
    make(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.seed.make(name, this.config);
        });
    }
    /**
     * Runs all seed files for the current environment.
     */
    run() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.seed.run((_a = this.assignSource()) !== null && _a !== void 0 ? _a : this.config);
        });
    }
}
exports.OrmSeeder = OrmSeeder;
//# sourceMappingURL=orm.js.map