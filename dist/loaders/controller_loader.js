"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const controller_1 = require("../core/controller");
const app_config_1 = require("../core/app_config");
const app_1 = require("../core/app");
class ControllerLoader extends app_loader_1.AppLoader {
    constructor() {
        super(...arguments);
        this._repository = 'controllers';
        this._pathSuffix = '_controller';
    }
    get sourceType() {
        return controller_1.BaseController;
    }
    call(args) {
        const app = args[0] || this.app;
        const controller = this.resolve(args[3] || this._source, [app, args[1], args[2]]);
        controller && this.intercept(controller, app);
        return controller;
    }
    getDependency(controller, property, dependency) {
        switch (property) {
            case 'service':
                return this.resolve(dependency, [{
                        app: controller.app,
                        controller: () => controller,
                        model: () => controller.model,
                        service: () => controller.service,
                        http: controller.http,
                        route: controller.route
                    }]);
            case 'model':
                return (0, app_1.loaders)().model.call([controller.app, dependency]);
        }
    }
    getControllerByRoute(app, route, http) {
        const data = { path: '', action: '' };
        const rootDir = app.rootDir;
        if (route.route) {
            data.path = route.route;
            data.action = route.action || '';
        }
        else {
            data.path = route.pathname || app_config_1.DEFAULT_CONTROLLER_NAME;
            if (false === this.isSource(data.path, rootDir)) {
                const path = data.path.split('/');
                const skipAction = path.slice(0, -1).join('/');
                if (this.isSource(skipAction, rootDir)) {
                    data.path = skipAction;
                    data.action = path.at(-1);
                }
                else
                    return;
            }
        }
        const controller = this.load(data.path, controller_1.BaseController, rootDir);
        if (controller)
            return this.call([app, http, Object.assign(Object.assign({}, route), { action: data.action }), controller]);
    }
    onCall() {
    }
    onGenerate(repository) {
    }
}
exports.ControllerLoader = ControllerLoader;
//# sourceMappingURL=controller_loader.js.map