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
const exception_1 = require("./exception");
const utils_1 = require("../utils");
class HttpHandler {
    constructor(app, httpClient) {
        this.app = app;
        this.httpClient = httpClient;
    }
    get controller() {
        return this._controller instanceof controller_1.Controller ? this._controller : this._controller = null;
    }
    set controller(instance) {
        this._controller = instance;
    }
    static getControllerLoader(app, type) {
        var _a;
        const loader = app.get('controller');
        if (type && false === utils_1.object.isProtoConstructor(type, controller_1.Controller)) {
            throw new exception_1.RuntimeException(`HttpHandler: The type "${(_a = utils_1.object.getProtoConstructor(type)) === null || _a === void 0 ? void 0 : _a.name}" that was provided is an invalid Controller class.`);
        }
        type && loader.setTarget(type);
        return loader;
    }
    getRoute() {
        return this.app.router.httpRoute(this.httpClient);
    }
    getController(route, httpClient) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.controller)
                return this.controller;
            route !== null && route !== void 0 ? route : (route = this.getRoute());
            httpClient !== null && httpClient !== void 0 ? httpClient : (httpClient = this.httpClient);
            const controller = HttpHandler.getControllerByRouteDescriptor(this.app, route, httpClient);
            if (controller instanceof controller_1.Controller) {
                this.controller = controller;
                return this.controller;
            }
            const loader = HttpHandler.getControllerLoader(this.app);
            const { path, action } = HttpHandler.getControllerPathAndActionByRoute(route, loader);
            if (path) {
                this.controller = yield loader.require(path).call([httpClient, route]);
                this.controller && (this.controller.route.action = action);
                return this.controller;
            }
        });
    }
    static getControllerByRouteDescriptor(app, route, httpClient) {
        var _a;
        const controller = (_a = route.controller) === null || _a === void 0 ? void 0 : _a.call(route, route);
        if (controller)
            return HttpHandler.getControllerLoader(app, controller).call([httpClient, route]);
    }
    runController() {
        var _a;
        var _b;
        return __awaiter(this, void 0, void 0, function* () {
            const controller = (_a = this.controller) !== null && _a !== void 0 ? _a : (this.controller = (yield this.getController()));
            if (!controller)
                throw new exception_1.HttpException(this.httpClient.getHttpResponse({ status: 404 }));
            const httpMethod = this.httpClient.request.method.toLowerCase();
            const action = (_b = controller.route).action || (_b.action = httpMethod);
            yield controller[controller_1.CONTROLLER_INITIAL_ACTION]();
            if (action !== controller.route.action || controller.http.responseIsSent)
                return;
            if (controller_1.CONTROLLER_HTTP_ACTIONS.includes(action) && action !== httpMethod)
                throw new exception_1.HttpException('The current HTTP method receives no response from the request method.', { status: 400 });
            const args = this.app.router.arrangeRouteParams(controller.route);
            if (controller[action] instanceof Function) {
                const data = yield controller[action].apply(controller, args);
                if (controller.http.responseIsSent)
                    return;
                if (utils_1.$.isPlainObject(data) || typeof data === 'string')
                    controller.send.data(data);
                return data;
            }
        });
    }
    static getControllerPathAndActionByRoute(route, loader) {
        var _a;
        const data = { path: '', action: '' };
        if (route.route) {
            data.path = route.route;
            data.action = (_a = route.action) !== null && _a !== void 0 ? _a : '';
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