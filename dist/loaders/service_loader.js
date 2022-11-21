"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const service_1 = require("../core/service");
class ServiceLoader extends app_loader_1.AppLoader {
    constructor() {
        super(...arguments);
        this._repository = 'services';
    }
    get sourceType() {
        return service_1.Service;
    }
    call(args, path, rootDir) {
        return this.resolve(path ? this.load(path, service_1.Service, rootDir) : this._source, args);
    }
    onGenerate(repository) {
    }
}
exports.ServiceLoader = ServiceLoader;
//# sourceMappingURL=service_loader.js.map