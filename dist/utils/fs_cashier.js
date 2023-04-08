"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FSCashier = void 0;
const index_1 = require("./index");
class FSCashier {
    constructor(config = {}) {
        this.config = config;
    }
    static get files() {
        return FSCashier._files;
    }
    static isFile(path) {
        return path in FSCashier._files;
    }
    createFileEntry(file, data) {
        const pathSkipExt = index_1.fs.skipExtension(file);
        return {
            [file]: data,
            [pathSkipExt]: data,
            [index_1.fs.formatPath(file)]: data,
            [index_1.fs.formatPath(pathSkipExt)]: data,
        };
    }
    addFile(file, data) {
        if (!index_1.fs.system.existsSync(file) || !index_1.fs.isFile(file))
            return;
        const extension = index_1.fs.getExtension(file);
        data || (data = { ext: extension, data: this.requireFileData(file, extension) });
        Object.assign(FSCashier._files, this.createFileEntry(file, data));
    }
    getFile(path) {
        return FSCashier._files[path];
    }
    requireFileData(file, extension) {
        extension || (extension = index_1.fs.getExtension(file));
        return ["js", "ts", "mjs"].includes(extension) ? require(file) : {};
    }
    cacheFolder(folder) {
        FSCashier._files = {};
        index_1.fs.dir(folder, ({ file, directory }) => {
            var _a;
            if (directory === null || directory === void 0 ? void 0 : directory.includes("."))
                return false;
            if (!file)
                return;
            const extension = index_1.fs.getExtension(file);
            if (!((_a = this.config.extensions) === null || _a === void 0 ? void 0 : _a.includes(extension)))
                return;
            const data = {
                ext: extension,
                data: this.requireFileData(file, extension),
            };
            this.addFile(file, data);
        }, this.config.excludeFolders);
    }
    watchFolder(folder, callback) {
        index_1.fs.system.readdirSync(folder).forEach((path) => {
            var _a;
            path = index_1.fs.path(folder, path);
            if (!index_1.fs.isDir(path) || path.includes("."))
                return;
            if ((_a = this.config.excludeFolders) === null || _a === void 0 ? void 0 : _a.some((v) => path.endsWith(index_1.fs.path(folder, v))))
                return;
            index_1.fs.system.watch(path, { recursive: true }, (mode, file) => {
                if (false === (callback === null || callback === void 0 ? void 0 : callback(mode, file)))
                    return;
                setTimeout(() => index_1.fs.system.existsSync(index_1.fs.join(path, file)) &&
                    this.cacheFolder(folder), 1);
            });
        });
    }
    watchFile(path, callback) {
        if (!index_1.fs.system.existsSync(path) || !index_1.fs.isFile(path))
            return;
        const folder = require("path").dirname(path);
        index_1.fs.system.watch(path, (mode, file) => {
            if (false === (callback === null || callback === void 0 ? void 0 : callback(mode, file, folder)))
                return;
            this.removeFile(path);
            file = index_1.fs.path(folder, index_1.$.trimPath(file));
            if (!index_1.fs.system.existsSync(file))
                return;
            const extension = index_1.fs.getExtension(file);
            const data = {
                ext: extension,
                data: this.requireFileData(file, extension),
            };
            this.addFile(file, data);
        });
    }
    removeFile(path) {
        const paths = this.createFileEntry(path);
        Object.keys(paths).forEach((key) => FSCashier._files[key] && delete FSCashier._files[key]);
    }
}
FSCashier._files = {};
exports.FSCashier = FSCashier;
//# sourceMappingURL=fs_cashier.js.map