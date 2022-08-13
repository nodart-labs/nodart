"use strict";
const index_1 = require("./index");
const fs = require('fs');
const stat = (path) => fs.existsSync(path) ? fs.statSync(path) : null;
const dir = (dir) => {
    if (!isDir(dir))
        return [];
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = dir + '/' + file;
        if (isDir(file)) {
            results = results.concat(dir(file));
        }
        else if (isFile(file)) {
            results.push(file);
        }
    });
    return results;
};
const write = (path, data) => {
    var _a;
    fs.writeFileSync(path, (_a = data === null || data === void 0 ? void 0 : data.toString()) !== null && _a !== void 0 ? _a : '');
};
const isFile = (path, ext) => {
    var _a;
    const exists = (path, ext) => { var _a; return !!((_a = stat(path + '.' + index_1.$.trim(ext, '.'))) === null || _a === void 0 ? void 0 : _a.isFile()); };
    return ext ? !!ext.some(ext => exists(path, ext)) : !!((_a = stat(path)) === null || _a === void 0 ? void 0 : _a.isFile());
};
const isDir = (path) => { var _a; return !!((_a = stat(path)) === null || _a === void 0 ? void 0 : _a.isDirectory()); };
const json = (path) => isFile(path) ? JSON.parse(fs.readFileSync(path, 'utf8')) : null;
const read = (path) => isFile(path) ? fs.readFileSync(path, 'utf8') : null;
const mkdir = (path, chmod = 0o744) => fs.mkdirSync(path, chmod);
const copy = (src, dest, callback, chmod) => isFile(src) ? fs.copyFile(src, dest, chmod, callback !== null && callback !== void 0 ? callback : (() => { })) : false;
module.exports = {
    fs,
    stat,
    dir,
    write,
    json,
    read,
    isFile,
    isDir,
    mkdir,
    copy
};
//# sourceMappingURL=fs.js.map