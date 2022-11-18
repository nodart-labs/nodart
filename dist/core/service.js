"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceFactory = exports.Service = void 0;
const utils_1 = require("../utils");
const app_1 = require("./app");
class Service {
    constructor(_scope = {}) {
        this._scope = _scope;
    }
    setScope(scope) {
        Object.assign(this._scope, scope);
    }
    mergeScope(scope) {
        this._scope = utils_1.object.merge(this._scope, scope);
    }
    fetchScope(pathDotted, def) {
        return utils_1.object.get(this._scope, pathDotted, def);
    }
    get scope() {
        return this._scope;
    }
}
exports.Service = Service;
class ServiceFactory {
    constructor(app) {
        this.app = app;
    }
    createServiceScope(http, route) {
        const dependencies = {
            service: undefined,
            model: undefined
        };
        const status = {
            service: false,
            model: false
        };
        const scope = {
            app: this.app,
            route,
            http,
            service: () => intercept('service'),
            model: () => intercept('model'),
            controller: () => (0, app_1.loaders)().controller.getControllerByServiceScope(scope),
        };
        const intercept = (property) => {
            if (status[property] === false) {
                status[property] = true;
                this.app.di.inject(dependencies, property, property);
                this.app.di.intercepted(dependencies) || this.app.di.intercept(dependencies, this.app.factory.createDependencyInterceptor({
                    getDependency(dependencies, property, dependency) {
                        switch (property) {
                            case 'service':
                                return Reflect.construct(dependency, [scope]);
                            case 'model':
                                return (0, app_1.loaders)().model.call([scope.app, dependency]);
                        }
                    }
                }));
            }
            return dependencies[property];
        };
        return scope;
    }
}
exports.ServiceFactory = ServiceFactory;
//# sourceMappingURL=service.js.map