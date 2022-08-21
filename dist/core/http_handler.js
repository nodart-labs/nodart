"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpHandler = void 0;
const controller_1 = require("./controller");
const app_config_1 = require("./app_config");
class HttpHandler {
    constructor(app, httpClient) {
        this.app = app;
        this.httpClient = httpClient;
        this.controllerLoader = app.get('controller');
    }
    getRoute() {
        return this.app.router.httpRoute(this.httpClient);
    }
    getController(route, httpClient) {
        return __awaiter(this, void 0, void 0, function* () {
            route || (route = this.getRoute());
            httpClient || (httpClient = this.httpClient);
            const { path, action } = HttpHandler.getControllerPathData(route, this.controllerLoader);
            if (path) {
                this.action = action;
                return yield this.controllerLoader.require(path).call([httpClient, route]);
            }
        });
    }
    runController(controller, action, args) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const target = controller !== null && controller !== void 0 ? controller : yield this.getController();
            if (!(target instanceof controller_1.Controller))
                return;
            action = this.getValidatedControllerAction(target, action || ((_a = target.route) === null || _a === void 0 ? void 0 : _a.data.action));
            args || (args = ((_b = target.route) === null || _b === void 0 ? void 0 : _b.data) ? this.app.router.arrangeRouteParams(target.route.data) : []);
            yield target[controller_1.CONTROLLER_INITIAL_ACTION]();
            target.route && (target.route.data.action = action);
            if (target[action] instanceof Function)
                return yield target[action].apply(target, args);
        });
    }
    getValidatedControllerAction(controller, action) {
        const httpMethod = controller.http.request.method.toLowerCase();
        action || (action = this.action || httpMethod);
        if (controller_1.CONTROLLER_HTTP_ACTIONS.includes(action) && action !== httpMethod)
            throw `The action "${action}" not responds to the HTTP method "${httpMethod.toUpperCase()}" in the "${controller.constructor.name}".`;
        return action;
    }
    static getControllerPathData(route, loader) {
        const data = { path: '', action: '' };
        if (route.route) {
            data.path = route.route;
            return data;
        }
        const pathname = route.pathname;
        let path = pathname === '/' ? app_config_1.DEFAULT_CONTROLLER_NAME : pathname;
        if (loader.isSource(path)) {
            data.path = path;
            return data;
        }
        const splitPath = pathname.split('/');
        path = splitPath.slice(0, -1).join('/');
        if (loader.isSource(path)) {
            data.path = path;
            data.action = splitPath.at(-1);
            return data;
        }
        return data;
    }
}
exports.HttpHandler = HttpHandler;
//# sourceMappingURL=http_handler.js.map