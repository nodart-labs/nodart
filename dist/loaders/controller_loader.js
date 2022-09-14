"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const controller_1 = require("../core/controller");
class ControllerLoader extends app_loader_1.AppLoader {
    constructor() {
        super(...arguments);
        this._repository = 'controllers';
        this._pathSuffix = '_controller';
    }
    get targetType() {
        return controller_1.Controller;
    }
    _onCall(target, args) {
        if (!target)
            return;
        const [http, route] = args !== null && args !== void 0 ? args : [];
        this._route = route;
        this._http = http;
    }
    _resolve(target) {
        if (!target)
            return;
        return this._target = Reflect.construct(target, [this._app, this._http, this._route]);
    }
    onGetDependency(target) {
        this.serviceScope = { controller: this._target };
        super.onGetDependency(target);
    }
    _onGenerate(repository) {
    }
}
exports.ControllerLoader = ControllerLoader;
//# sourceMappingURL=controller_loader.js.map