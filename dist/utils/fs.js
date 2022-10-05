"use strict";
const index_1 = require("./index");
const fs = require('fs');
const _path = require("path");
const stat = (path) => fs.existsSync(path) ? fs.statSync(path) : null;
const dir = (directory, callback) => {
    if (!isDir(directory))
        return [];
    let results = [];
    const list = fs.readdirSync(directory);
    list.forEach(function (file) {
        file = path(directory, file);
        if (isDir(file)) {
            results = results.concat(dir(file, callback));
            callback === null || callback === void 0 ? void 0 : callback({ directory: file });
            return;
        }
        results.push(file);
        callback === null || callback === void 0 ? void 0 : callback({ file });
    });
    return results;
};
const rmDir = (directory, callback) => {
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
const write = (path, data = '') => {
    fs.writeFileSync(path, data);
};
const isFile = (path, ext) => {
    var _a;
    const exists = (path, ext) => { var _a; return !!((_a = stat(path + '.' + index_1.$.trim(ext, '.'))) === null || _a === void 0 ? void 0 : _a.isFile()); };
    return ext ? !!ext.some(ext => exists(path, ext)) : !!((_a = stat(path)) === null || _a === void 0 ? void 0 : _a.isFile());
};
const isDir = (path) => { var _a; return !!((_a = stat(path)) === null || _a === void 0 ? void 0 : _a.isDirectory()); };
const json = (path) => {
    try {
        if (isFile(path))
            return JSON.parse(fs.readFileSync(path, 'utf8'));
    }
    catch (e) {
        console.error(e);
    }
};
const read = (path) => isFile(path) ? fs.readFileSync(path, 'utf8') : null;
const mkdir = (path, chmod = 0o744) => fs.mkdirSync(path, chmod);
const mkDeepDir = (path, chmod = 0o744) => fs.mkdirSync(path, { recursive: true, mode: chmod });
const copy = (src, dest, callback = (() => undefined), chmod) => {
    if (isFile(src)) {
        fs.copyFile(src, dest, chmod, callback);
        return true;
    }
    return false;
};
const include = (path, params = { log: true }) => {
    try {
        params.skipExt && (path = skipExtension(path));
        const data = require(path);
        params.success && params.success(data);
        return data;
    }
    catch (e) {
        params.error && params.error(e);
        params.log && console.error(`Failed to load data from path "${path}".`, e);
        return null;
    }
};
const getSource = (path, sourceProtoObject) => {
    const source = require(path);
    if (!(source instanceof Object))
        return null;
    for (let key of Object.keys(source)) {
        if (index_1.object.isProtoConstructor(source[key], sourceProtoObject))
            return source[key];
    }
    return null;
};
const filename = (path) => isFile(path) ? _path.basename(path) : null;
const parseFile = (path) => isFile(path) ? _path.parse(path) : {};
const formatPath = (path) => index_1.$.trimPath(path !== null && path !== void 0 ? path : '').replace(/\\/g, '/').replace(/\/$/, '');
const path = (path, to = '') => _path.resolve(path, to);
const skipExtension = (path) => path.replace(/\.[a-z\d]+$/i, '');
module.exports = {
    system: fs,
    stat,
    filename,
    parseFile,
    formatPath,
    dir,
    write,
    json,
    read,
    copy,
    isFile,
    isDir,
    mkdir,
    mkDeepDir,
    getSource,
    include,
    path,
    rmDir,
    skipExtension
};
//# sourceMappingURL=fs.js.map