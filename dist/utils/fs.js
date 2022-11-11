"use strict";
const index_1 = require("./index");
const fs_cashier_1 = require("./fs_cashier");
const fs = require('fs');
const _path = require('path');
const separator = _path.sep;
const cashier = fs_cashier_1.FSCashier;
const stat = function (path) {
    try {
        return fs.statSync(path);
    }
    catch (_a) {
        return null;
    }
};
const dir = function (directory, callback, excludeFolders) {
    if (!isDir(directory))
        return [];
    let results = [];
    const list = fs.readdirSync(directory);
    list.forEach(function (file) {
        file = path(directory, file);
        if (isDir(file)) {
            if ((callback === null || callback === void 0 ? void 0 : callback({ directory: file })) === false)
                return;
            if (excludeFolders && excludeFolders.some(v => file.endsWith(path(index_1.$.trimPath(v)))))
                return;
            results = results.concat(dir(file, callback, excludeFolders));
            return;
        }
        if ((callback === null || callback === void 0 ? void 0 : callback({ file })) === false)
            return;
        results.push(file);
    });
    return results;
};
const rmDir = function (directory, callback) {
    if (!isDir(directory))
        return callback === null || callback === void 0 ? void 0 : callback();
    try {
        if ("rmdirSync" in fs) {
            fs.rmdirSync(directory, { recursive: true });
            isDir(directory) ? callback === null || callback === void 0 ? void 0 : callback(`Could not delete directory "${directory}"`) : callback === null || callback === void 0 ? void 0 : callback();
        }
        else {
            fs.rm(directory, { recursive: true }, (err) => callback === null || callback === void 0 ? void 0 : callback(err));
        }
    }
    catch (e) {
        callback === null || callback === void 0 ? void 0 : callback(e);
    }
};
const write = function (path, data = '') {
    try {
        fs.writeFileSync(path, data);
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }
};
const unlink = function (path, cb = () => { }) {
    try {
        fs.unlink(path, cb);
        return true;
    }
    catch (_a) {
        return false;
    }
};
const isFile = function (path, ext) {
    var _a;
    const exists = (path, ext) => {
        var _a;
        path = path + '.' + trimExtension(ext);
        return cashier.isFile(path) || !!((_a = stat(path)) === null || _a === void 0 ? void 0 : _a.isFile());
    };
    return ext ? !!ext.some(ext => exists(path, ext)) : cashier.isFile(path) || !!((_a = stat(path)) === null || _a === void 0 ? void 0 : _a.isFile());
};
const isDir = function (path) {
    var _a;
    return !!((_a = stat(path)) === null || _a === void 0 ? void 0 : _a.isDirectory());
};
const json = function (path) {
    try {
        return fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, 'utf8')) : undefined;
    }
    catch (e) {
        console.error(e);
    }
};
const read = function (path) {
    try {
        if (fs.existsSync(path))
            return fs.readFileSync(path, 'utf8');
    }
    catch (_a) {
    }
};
const mkdir = function (path, chmod = 0o744) {
    path && fs.mkdirSync(path, chmod);
};
const mkDeepDir = function (path, chmod = 0o744) {
    path && fs.mkdirSync(path, { recursive: true, mode: chmod });
};
const copy = function (src, dest, callback = (() => undefined)) {
    try {
        fs.copyFile(src, dest, callback);
        return true;
    }
    catch (_a) {
        return false;
    }
};
const include = function (path, params = { log: true }) {
    try {
        params.skipExt && (path = skipExtension(path));
        const data = cashier.isFile(path) ? cashier.files[path].data : require(path);
        const resolve = params.success && params.success(data);
        return resolve || data;
    }
    catch (e) {
        params.error && params.error(e);
        params.log && console.error(`Failed to load data from path "${path}".`, e);
        return null;
    }
};
const getSource = function (path, sourceProtoObject) {
    try {
        const data = cashier.isFile(path) ? cashier.files[path].data : require(path);
        if (!(data instanceof Object))
            return null;
        for (const key of Object.keys(data)) {
            if (index_1.object.isProtoConstructor(data[key], sourceProtoObject))
                return data[key];
        }
    }
    catch (_a) {
    }
};
const filename = function (path) {
    return isFile(path) ? _path.basename(path) : null;
};
const parseFile = function (path) {
    return isFile(path) ? _path.parse(path) : {};
};
const formatPath = function (path) {
    return path ? index_1.$.trimPathEnd(path).replace(/\\/g, '/').replace(/\/$/, '') : '';
};
const path = function (path, to = '') {
    return to
        ? _path.resolve(path, index_1.$.trimPath(to))
        : _path.join(path[0] === separator ? path : separator === '/' ? '/' + path : path, '');
};
const join = function (path, to) {
    return _path.join(path, index_1.$.trimPath(to));
};
const skipExtension = function (path) {
    return path.replace(/\.[a-z\d]+$/i, '');
};
const getExtension = function (path, withDot = false) {
    const matches = path === null || path === void 0 ? void 0 : path.match(/(\.)([^.]+?)$/g);
    return matches ? (withDot ? matches[0] : matches[0].replace('.', '')) : '';
};
const trimExtension = function (ext) {
    return ext.replace(/^(\.)*/g, '');
};
module.exports = {
    system: fs,
    sep: separator,
    stat,
    filename,
    parseFile,
    formatPath,
    dir,
    write,
    json,
    read,
    unlink,
    copy,
    isFile,
    isDir,
    mkdir,
    mkDeepDir,
    getSource,
    include,
    path,
    join,
    rmDir,
    skipExtension,
    getExtension,
    trimExtension
};
//# sourceMappingURL=fs.js.map