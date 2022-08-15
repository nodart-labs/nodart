"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerLoader = exports.CONTROLLER_ROUTE_MIDDLEWARE_REPO = void 0;
const app_loader_1 = require("../core/app_loader");
const controller_1 = require("../core/controller");
const middleware_1 = require("../core/middleware");
const route_1 = require("../middlewares/route");
const http_handler_1 = require("../core/http_handler");
const utils_1 = require("../utils");
exports.CONTROLLER_ROUTE_MIDDLEWARE_REPO = 'route';
class ControllerLoader extends app_loader_1.AppLoader {
    constructor() {
        super(...arguments);
        this._repository = 'controllers';
        this._pathSuffix = '_controller';
        this.onGetDependency = (target) => {
            target instanceof middleware_1.Middleware && target.setScope(this.scope);
        };
    }
    get scope() {
        return {
            app: this._app,
            http: this._http,
            controller: this._controller,
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
        this._controller = (Reflect.construct(controller, [this._app, this._http]));
        if (!(this._controller instanceof controller_1.Controller))
            return;
        this._controller.route instanceof route_1.Route || this.assignRouteMiddleware(this.getRouteMiddleware());
        return this._controller;
    }
    assignRouteMiddleware(route) {
        this._controller instanceof controller_1.Controller && Object.assign(this._controller, { route });
    }
    getRouteMiddleware() {
        const loader = this.intersectLoader('middleware', exports.CONTROLLER_ROUTE_MIDDLEWARE_REPO);
        let routeMiddleware = loader === null || loader === void 0 ? void 0 : loader.call([this._route, this.scope]);
        routeMiddleware instanceof route_1.Route || (routeMiddleware = new route_1.Route(this._route, this.scope));
        if (!routeMiddleware.data) {
            routeMiddleware.data = this._route;
            routeMiddleware.setScope(this.scope);
        }
        return routeMiddleware;
    }
    _onGenerate(repository) {
        const middlewareLoader = this._app.get('middleware');
        const middlewareRepo = middlewareLoader.getRepo();
        const routeMiddlewareRepo = middlewareRepo + '/' + exports.CONTROLLER_ROUTE_MIDDLEWARE_REPO;
        middlewareRepo && !utils_1.fs.isDir(routeMiddlewareRepo) && utils_1.fs.mkdir(routeMiddlewareRepo);
    }
}
exports.ControllerLoader = ControllerLoader;
//# sourceMappingURL=controller_loader.js.map