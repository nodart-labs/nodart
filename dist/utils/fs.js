"use strict";
const index_1 = require("./index");
const fs = require('fs');
const _path = require("path");
const stat = (path) => fs.existsSync(path) ? fs.statSync(path) : null;
const dir = (directory) => {
    if (!isDir(directory))
        return [];
    let results = [];
    const list = fs.readdirSync(directory);
    list.forEach(function (file) {
        file = directory + '/' + file;
        isDir(file) ? results = results.concat(dir(file)) : (isFile(file) && results.push(file));
    });
    return results;
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
        return false;
    }
    catch (e) {
        console.error(e);
        return false;
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
const include = (path, silent = false) => {
    try {
        return require(path);
    }
    catch (e) {
        silent || console.error(`Failed to load data from path "${path}".`);
        silent || console.error(e);
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
const formatPath = (path) => index_1.$.trimPath(path).replace('\\', '/');
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
    include
};
//# sourceMappingURL=fs.js.map