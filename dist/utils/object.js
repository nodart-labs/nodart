"use strict";
const $ = require("./common");
module.exports = {
    getProtoConstructor(target) {
        var _a;
        return (_a = target === null || target === void 0 ? void 0 : target.prototype) === null || _a === void 0 ? void 0 : _a.constructor;
    },
    isProtoConstructor(target, protoObject) {
        if (protoObject) {
            const constructor = this.getProtoConstructor(protoObject);
            const targetConstructor = this.getProtoConstructor(target);
            return !!(constructor &&
                targetConstructor &&
                (targetConstructor === constructor ||
                    constructor.isPrototypeOf(targetConstructor)));
        }
        return !!this.getProtoConstructor(target);
    },
    get(obj, dottedPath, def) {
        return dottedPath.split(".").reduce((acc, part) => {
            return acc && typeof acc === "object" && acc[part] !== undefined
                ? acc[part]
                : def !== undefined
                    ? def
                    : undefined;
        }, obj);
    },
    has(obj, dottedPath) {
        return this.get(obj, dottedPath) !== undefined;
    },
    set(obj, dottedPath, value) {
        const arr = dottedPath.split(".");
        for (let i = 0; i < arr.length - 1; i++) {
            obj = obj[arr[i]] = obj[arr[i]] !== undefined ? obj[arr[i]] : {};
        }
        obj[arr[arr.length - 1]] = value;
    },
    /*
     * Simple Deep merge of Objects.
     * Not recommended on complicated objets. Use https://www.npmjs.com/package/deepmerge instead
     * */
    merge(target, source) {
        Object.keys(source).forEach((key) => {
            const targetValue = target[key];
            const sourceValue = source[key];
            target[key] =
                $.isPlainObject(targetValue) && $.isPlainObject(sourceValue)
                    ? this.merge(Object.assign({}, targetValue), sourceValue)
                    : sourceValue;
        });
        return target;
    },
    deepCopy(source, target = {}) {
        for (const [key, value] of Object.entries(source)) {
            if ($.isPlainObject(value)) {
                target[key] = {};
                this.deepCopy(value, target[key]);
                continue;
            }
            target[key] = value;
        }
    },
    uniqBy(arr, key) {
        return [
            ...new Map(arr.map((item) => {
                let uid = "";
                if (Array.isArray(key))
                    for (const id of key)
                        uid += item[id];
                else
                    uid = item[key];
                return [uid, item];
            })).values(),
        ];
    },
    uniq(arr) {
        return [...new Set(arr)];
    },
    copy(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    copyReplaceCircular(obj) {
        return JSON.parse(this.stringifyReplaceCircular(obj));
    },
    stringify(obj) {
        return JSON.stringify(obj, (key, val) => typeof val === "function" ? val + "" : val);
    },
    // https://bobbyhadz.com/blog/javascript-typeerror-converting-circular-structure-to-json
    stringifyReplaceCircular(obj) {
        const getCircularReplacer = () => {
            const seen = new WeakSet();
            return (key, value) => {
                if (typeof value === "object" && value !== null) {
                    if (seen.has(value)) {
                        return;
                    }
                    seen.add(value);
                }
                return typeof value === "function" ? value + "" : value;
            };
        };
        return JSON.stringify(obj, getCircularReplacer());
    },
    sortObjects(list, attrName, asc = true) {
        list.sort((a, b) => {
            const aa = $.isPlainObject(a) ? this.get(a, attrName) : a;
            const bb = $.isPlainObject(b) ? this.get(b, attrName) : b;
            return asc ? (aa < bb ? -1 : 1) : aa > bb ? -1 : 1;
        });
        return list;
    },
    range(start, end, fill) {
        const r = Array(end - start + 1);
        fill && fill(r);
        return r.map((_, idx) => start + idx);
    },
    sortByWord(arr, word, sortKey) {
        word = (word === null || word === void 0 ? void 0 : word.toString().toLowerCase()) || "";
        return arr.sort((a, b) => {
            var _a, _b;
            a = (_a = (sortKey !== undefined ? a[sortKey] : a)) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            b = (_b = (sortKey !== undefined ? b[sortKey] : b)) === null || _b === void 0 ? void 0 : _b.toLowerCase();
            const aa = a.indexOf(word);
            const bb = b.indexOf(word);
            if (aa === bb) {
                return sortKey !== undefined
                    ? a[sortKey] > b[sortKey]
                        ? 1
                        : b[sortKey] > a[sortKey]
                            ? -1
                            : 0
                    : a > b
                        ? 1
                        : b > a
                            ? -1
                            : 0;
            }
            else {
                return aa > bb ? 1 : -1;
            }
        });
    },
    parseFuncArguments(func) {
        var _a, _b, _c, _d, _e;
        return ((_e = (_d = (_c = (_b = (_a = func
            .toString()
            .replace(/[\r\n\s]+/g, " ")) === null || _a === void 0 ? void 0 : _a.match(/(?:[^(]+)?\s*(?:\((.*?)\)|([^\s]+))/)) === null || _b === void 0 ? void 0 : _b.slice(1, 3)) === null || _c === void 0 ? void 0 : _c.join("")) === null || _d === void 0 ? void 0 : _d.split(/\s*,\s*/)) !== null && _e !== void 0 ? _e : []);
    },
    arrangeFuncArguments(func) {
        const args = this.parseFuncArguments(func);
        const order = [];
        args.forEach((arg) => {
            var _a, _b;
            if (!arg.trim())
                return;
            const data = arg.split("=");
            const def = (_b = (_a = data[1]) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : "";
            const type = def
                ? def.startsWith('"') || def.startsWith("'")
                    ? "string"
                    : !isNaN(parseFloat(def))
                        ? "number"
                        : def.match(/^\[.*?]$/)
                            ? "array"
                            : def.match(/^\{.*?}$/)
                                ? "object"
                                : def.match(/^[^(]*?\([^)]*?\)\s*(\{|=>)/)
                                    ? "function"
                                    : def.match(/^(true|false)$/)
                                        ? "boolean"
                                        : undefined
                : undefined;
            order.push({
                arg: data[0].trim(),
                type,
                default: def,
                required: data.length === 1,
                src: arg,
            });
        });
        return order;
    },
};
//# sourceMappingURL=object.js.map