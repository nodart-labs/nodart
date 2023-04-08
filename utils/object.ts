import { FunctionArgumentParseData } from "../core/interfaces/object";

const $ = require("./common");

export = {
  getProtoConstructor(target) {
    return target?.prototype?.constructor;
  },

  isProtoConstructor(target, protoObject?: any) {
    if (protoObject) {
      const constructor = this.getProtoConstructor(protoObject);
      const targetConstructor = this.getProtoConstructor(target);

      return !!(
        constructor &&
        targetConstructor &&
        (targetConstructor === constructor ||
          constructor.isPrototypeOf(targetConstructor))
      );
    }

    return !!this.getProtoConstructor(target);
  },

  get(obj: object, dottedPath: string, def?: any) {
    return dottedPath.split(".").reduce((acc, part) => {
      return acc && typeof acc === "object" && acc[part] !== undefined
        ? acc[part]
        : def !== undefined
        ? def
        : undefined;
    }, obj);
  },

  has(obj: object, dottedPath: string) {
    return this.get(obj, dottedPath) !== undefined;
  },

  set(obj: object, dottedPath: string, value) {
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
  merge(target: object, source: object) {
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

  deepCopy(source: object, target: object = {}) {
    for (const [key, value] of Object.entries(source)) {
      if ($.isPlainObject(value)) {
        target[key] = {};
        this.deepCopy(value, target[key]);
        continue;
      }
      target[key] = value;
    }
  },

  uniqBy(arr, key: string | string[]) {
    return [
      ...new Map(
        arr.map((item) => {
          let uid = "";

          if (Array.isArray(key)) for (const id of key) uid += item[id];
          else uid = item[key];

          return [uid, item];
        }),
      ).values(),
    ];
  },

  uniq(arr: any[]) {
    return [...new Set(arr)];
  },

  copy(obj: object) {
    return JSON.parse(JSON.stringify(obj));
  },

  copyReplaceCircular(obj: object) {
    return JSON.parse(this.stringifyReplaceCircular(obj));
  },

  stringify(obj: object) {
    return JSON.stringify(obj, (key, val) =>
      typeof val === "function" ? val + "" : val,
    );
  },

  // https://bobbyhadz.com/blog/javascript-typeerror-converting-circular-structure-to-json
  stringifyReplaceCircular(obj: object) {
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

  sortObjects(list: any[], attrName: string, asc = true) {
    list.sort((a, b) => {
      const aa = $.isPlainObject(a) ? this.get(a, attrName) : a;
      const bb = $.isPlainObject(b) ? this.get(b, attrName) : b;

      return asc ? (aa < bb ? -1 : 1) : aa > bb ? -1 : 1;
    });

    return list;
  },

  range(start: number, end: number, fill?: (...args) => any) {
    const r = Array(end - start + 1);

    fill && fill(r);

    return r.map((_, idx) => start + idx);
  },

  sortByWord(arr: any[], word: string, sortKey?: string) {
    word = word?.toString().toLowerCase() || "";

    return arr.sort((a, b) => {
      a = (sortKey !== undefined ? a[sortKey] : a)?.toLowerCase();
      b = (sortKey !== undefined ? b[sortKey] : b)?.toLowerCase();
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
      } else {
        return aa > bb ? 1 : -1;
      }
    });
  },

  parseFuncArguments(func: (...args) => any): string[] {
    return (
      func
        .toString()
        .replace(/[\r\n\s]+/g, " ")
        ?.match(/(?:[^(]+)?\s*(?:\((.*?)\)|([^\s]+))/)
        ?.slice(1, 3)
        ?.join("")
        ?.split(/\s*,\s*/) ?? []
    );
  },

  arrangeFuncArguments(func: (...args) => any) {
    const args = this.parseFuncArguments(func);
    const order: Array<FunctionArgumentParseData> = [];

    args.forEach((arg) => {
      if (!arg.trim()) return;
      const data = arg.split("=");
      const def = data[1]?.trim() ?? "";
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
