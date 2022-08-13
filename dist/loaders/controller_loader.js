"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const middleware_1 = require("../core/middleware");
const route_1 = require("../middlewares/route");
const http_handler_1 = require("../core/http_handler");
class ControllerLoader extends app_loader_1.AppLoader {
    constructor() {
        super(...arguments);
        this._repository = 'controllers';
        this._pathSuffix = '_controller';
        this.onGetDependency = (target) => {
            const scope = {
                app: this._app,
                http: this._http,
            };
            target instanceof middleware_1.Middleware && target.setScope(scope);
            target instanceof route_1.Route && target.setScope({ data: this._route });
        };
    }
    _onCall(controller, args) {
        if (!controller)
            return;
        const [http, route] = args !== null && args !== void 0 ? args : [];
        this._targetPath = http_handler_1.HttpHandler.getControllerPathData(route, this).path;
        this._route = route;
        this._http = http;
    }
    _resolve(controller) {
        if (!controller)
            return;
        return Reflect.construct(controller, [this._app, this._http, this._route]);
    }
    _onGenerate(repository) {
    }
}
exports.ControllerLoader = ControllerLoader;
//# sourceMappingURL=controller_loader.js.map
