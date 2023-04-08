"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleService = void 0;
class ModuleService {
    constructor(app, modules) {
        this.app = app;
        this.modules = modules;
        this._modules = [];
        this._collection = {};
        this.use((this.modules || (this.modules = {})));
    }
    use(modules) {
        var _a;
        this.modules.types || Object.assign(this.modules, { types: [] });
        this.modules.modules || Object.assign(this.modules, { modules: {} });
        for (const module of modules.types) {
            const index = this.modules.types.findIndex((m) => Object.is(m[0], module[0]));
            index !== -1
                ? (this.modules.types[index] = module)
                : this.modules.types.push([module[0], module[1]]);
        }
        for (const [name, module] of Object.entries((_a = modules.modules) !== null && _a !== void 0 ? _a : {})) {
            this.modules.modules[name] = module;
        }
        this.setModules();
    }
    setModules() {
        this._modules = [];
        for (const module of this.modules.types) {
            if (!module[0])
                continue;
            module[0] &&
                this._modules.push(Reflect.construct(module[0], [this.app, module[1]]));
        }
        for (const [name, module] of Object.entries(this.modules.modules)) {
            if (!module[0])
                continue;
            const instance = Reflect.construct(module[0], [this.app, module[1]]);
            const index = this._modules.findIndex((m, i) => {
                return (m instanceof module[0] && Object.is(module[0], this.modules.types[i]));
            });
            this._collection[name] = instance;
            index !== -1
                ? (this._modules[index] = instance)
                : this._modules.push(instance);
        }
    }
    get get() {
        return this._collection;
    }
    getModules() {
        return this._modules;
    }
}
exports.ModuleService = ModuleService;
//# sourceMappingURL=module.js.map