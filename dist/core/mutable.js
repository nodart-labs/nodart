"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mutable = void 0;
class Mutable {
    constructor(entity) {
        this.entity = entity;
    }
    get get() {
        if (!this._mutable) {
            this._mutable = {};
            Object.keys(this.entity.mutable).forEach((key) => {
                this._mutable[key] = (...args) => {
                    if (!args[0])
                        return;
                    return this._resolve(this.entity.mutable[key], args);
                };
            });
        }
        return this._mutable;
    }
    get list() {
        if (!this._mutableList) {
            this._mutableList = {};
            Object.keys(this.entity.mutable).forEach((key) => {
                this._mutableList[key] = (...args) => {
                    if (!args[0])
                        return;
                    const target = args[0];
                    args.shift();
                    for (let i = 0; i < target.length; i++) {
                        this._resolve(this.entity.mutable[key], [target[i], ...args]);
                    }
                    return target;
                };
            });
        }
        return this._mutableList;
    }
    _resolve(get, args) {
        const [target, exclude] = get.apply(this.entity, args);
        Object.assign(args[0], target);
        if (exclude)
            for (let i = 0; i < exclude.length; i++) {
                delete args[0][exclude[i]];
            }
        return args[0];
    }
}
exports.Mutable = Mutable;
//# sourceMappingURL=mutable.js.map