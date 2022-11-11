"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpServiceLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const http_1 = require("../services/http");
const controller_1 = require("../core/controller");
const exception_1 = require("../core/exception");
const utils_1 = require("../utils");
const app_1 = require("../core/app");
class HttpServiceLoader extends app_loader_1.AppLoader {
    call(args) {
        const scope = args[0] || {};
        if (!scope.app || !scope.http || !scope.route)
            throw new exception_1.RuntimeException('HttpServiceLoader: Missing required scope properties: app | http | route');
        const http = new http_1.HttpService(scope);
        this.intercept(http, scope.app);
        http.setScope({
            model: scope.model || (scope.model = () => http.model),
            service: scope.service || (scope.service = () => http.service),
            controller: scope.controller || (scope.controller = () => this.getController(scope)),
            scope
        });
        return http;
    }
    getDependency(service, property, dependency) {
        switch (property) {
            case 'service':
                return this.resolve(dependency, [{
                        app: service.scope.app,
                        controller: () => service.scope.controller(),
                        model: () => service.scope.model(),
                        service: () => service.scope.service(),
                        http: service.scope.http,
                        route: service.scope.route,
                        scope: service.scope
                    }]);
            case 'model':
                return (0, app_1.loaders)().model.call([service.scope.app, dependency]);
        }
    }
    getController(scope, loader) {
        var _a, _b, _c;
        const controller = (_b = (_a = scope.route).controller) === null || _b === void 0 ? void 0 : _b.call(_a, scope.route);
        if (controller) {
            if (false === utils_1.object.isProtoConstructor(controller, controller_1.BaseController))
                throw `The provided type "${(_c = utils_1.object.getProtoConstructor(controller)) === null || _c === void 0 ? void 0 : _c.name}" is not a "Controller".`;
            loader || (loader = scope.app.get('controller'));
            return loader.call([scope.app, scope.http, scope.route, controller]);
        }
    }
    onCall() {
    }
    onGenerate(repository) {
    }
}
exports.HttpServiceLoader = HttpServiceLoader;
//# sourceMappingURL=http_service_loader.js.map