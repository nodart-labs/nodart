"use strict";
module.exports = {
    isNil(value) {
        return value === null || value === undefined;
    },
    isPlainObject(value) {
        return value && typeof value === "object" && value.constructor === Object;
    },
    isObject(value) {
        const type = typeof value;
        return !this.isNil(value) && (type === "object" || type === "function");
    },
    isArrayOfObjects(value) {
        return Array.isArray(value) && !value.some((v) => !this.isPlainObject(v));
    },
    isEmpty(value) {
        if (this.isNil(value))
            return true;
        const type = Array.isArray(value)
            ? "array"
            : this.isPlainObject(value)
                ? "object"
                : typeof value;
        switch (type) {
            case "array": {
                return value.length === 0;
            }
            case "object": {
                return Object.keys(value).length === 0;
            }
            case "string": {
                return value.trim() === "";
            }
            case "number": {
                return value === 0;
            }
            case "boolean": {
                return value === false;
            }
        }
        return !value;
    },
    capitalize(text) {
        return this.isNil(text)
            ? ""
            : text.charAt(0).toUpperCase() + text.slice(1) || "";
    },
    trim(str, characters, flags = "g") {
        str && (str = str.toString());
        if (!str)
            return "";
        if (flags !== "g" && !/^[gi]*$/.test(flags))
            throw new TypeError("Invalid flags supplied '" + flags.match(new RegExp("[^gi]*")) + "'");
        const escapeRegex = (char) => char.replace(/[[\](){}?*+^$\\.|-]/g, "\\$&");
        const trim = function (str, char, flags) {
            char = escapeRegex(char);
            return str.replace(new RegExp("^[" + char + "]+|[" + char + "]+$", flags), "");
        };
        Array.isArray(characters)
            ? characters.forEach((char) => (str = trim(str, char, flags)))
            : (str = trim(str, characters, flags));
        return str;
    },
    trimPath(pathLike) {
        return ((pathLike === null || pathLike === void 0 ? void 0 : pathLike.trim().replace(/^[\\|/]*/g, "").replace(/[\\|/]*$/g, "")) || "");
    },
    trimPathEnd(pathLike) {
        return (pathLike === null || pathLike === void 0 ? void 0 : pathLike.trim().replace(/[\\|/]*$/g, "")) || "";
    },
    prettyNumber(x) {
        return (x === null || x === void 0 ? void 0 : x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")) || 0;
    },
    sum(arrayOfNumbers, iteratee) {
        iteratee || (iteratee = (v) => v);
        const sum = () => {
            let result, index = -1;
            while (++index < arrayOfNumbers.length) {
                const current = iteratee(arrayOfNumbers[index]);
                if (current !== undefined) {
                    result = result === undefined ? current : result + current;
                }
            }
            return result;
        };
        return arrayOfNumbers.length ? sum() : 0;
    },
    hyphen2Camel(str, delimiters) {
        if (!str)
            return "";
        const pattern = /[-_]+(.)?/g;
        function toUpper(match, group1) {
            return group1 ? group1.toUpperCase() : "";
        }
        return str.replace(delimiters ? new RegExp("[" + delimiters + "]+(.)?", "g") : pattern, toUpper);
    },
    camel2Snake(str) {
        if (!str)
            return "";
        return str
            .replace(/\.?([A-Z]+)/g, function (x, y) {
            return "_" + y.toLowerCase();
        })
            .replace(/^_/, "");
    },
    get date() {
        return {
            currentDateTime() {
                const today = new Date();
                const date = today.getFullYear() +
                    "-" +
                    (today.getMonth() + 1) +
                    "-" +
                    today.getDate();
                const time = today.getHours() +
                    ":" +
                    today.getMinutes() +
                    ":" +
                    today.getSeconds();
                return date + " " + time;
            },
        };
    },
    get random() {
        return {
            hex(num = 20) {
                return require("crypto").randomBytes(num).toString("hex");
            },
        };
    },
};
//# sourceMappingURL=common.js.map