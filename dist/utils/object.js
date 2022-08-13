"use strict";
const $ = require('./common');
module.exports = {
    get(obj, path, def) {
        return path.split('.').reduce((acc, part) => ($.isPlainObject(acc) && acc[part] !== undefined)
            ? acc[part]
            : (def !== undefined ? def : null), obj);
    },
    has(obj, path) {
        let has = path.split('.').reduce((acc, part) => ($.isPlainObject(acc) && acc[part] !== undefined)
            ? acc[part]
            : undefined, obj);
        return has !== undefined;
    },
    set(obj, path, value) {
        if (!$.isPlainObject(obj))
            return;
        const arr = path.split('.');
        for (let i = 0; i < arr.length - 1; i++) {
            obj = obj[arr[i]] = obj[arr[i]] !== undefined ? obj[arr[i]] : {};
        }
        obj[arr[arr.length - 1]] = value;
    },
    uniqBy(arr, key) {
        return [...new Map(arr.map(item => {
                let uid = '';
                if (Array.isArray(key))
                    for (let id of key)
                        uid += item[id];
                else
                    uid = item[key];
                return [uid, item];
            })).values()];
    },
    uniq(arr) {
        return [...new Set(arr)];
    },
    copy(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    copyUnset(obj) {
        return JSON.parse(this.stringifyUnset(obj));
    },
    stringify(obj) {
        return JSON.stringify(obj, (key, val) => typeof val === 'function' ? val + '' : val);
    },
    // https://bobbyhadz.com/blog/javascript-typeerror-converting-circular-structure-to-json
    stringifyUnset(obj) {
        const getCircularReplacer = () => {
            const seen = new WeakSet();
            return (key, value) => {
                if (typeof value === 'object' && value !== null) {
                    if (seen.has(value)) {
                        return;
                    }
                    seen.add(value);
                }
                return typeof value === 'function' ? value + '' : value;
            };
        };
        return JSON.stringify(obj, getCircularReplacer());
    },
    sortObjects(list, attrName, asc = true) {
        list.sort((a, b) => {
            let aa = $.isPlainObject(a) ? this.get(a, attrName) : a;
            let bb = $.isPlainObject(b) ? this.get(b, attrName) : b;
            return asc ? (aa < bb ? -1 : 1) : (aa > bb ? -1 : 1);
        });
        return list;
    },
    range(start, end, fill) {
        return Array(end - start + 1).fill(fill).map((_, idx) => start + idx);
    },
    sortByWord(arr, word, sortKey) {
        word = (word === null || word === void 0 ? void 0 : word.toString().toLowerCase()) || '';
        return arr.sort((a, b) => {
            var _a, _b;
            a = (_a = (sortKey !== undefined ? a[sortKey] : a)) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            b = (_b = (sortKey !== undefined ? b[sortKey] : b)) === null || _b === void 0 ? void 0 : _b.toLowerCase();
            const aa = a.indexOf(word);
            const bb = b.indexOf(word);
            if (aa === bb) {
                return sortKey !== undefined
                    ? (a[sortKey] > b[sortKey] ? 1 : (b[sortKey] > a[sortKey] ? -1 : 0))
                    : (a > b ? 1 : b > a ? -1 : 0);
            }
            else {
                return aa > bb ? 1 : -1;
            }
        });
    },
};
//# sourceMappingURL=object.js.map