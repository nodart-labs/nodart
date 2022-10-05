"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpServiceLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const http_1 = require("../services/http");
const utils_1 = require("../utils");
const http_client_1 = require("../core/http_client");
const exception_1 = require("../core/exception");
const service_1 = require("../core/service");
const http_handler_1 = require("../core/http_handler");
class HttpServiceLoader extends app_loader_1.AppLoader {
    _onCall(target) {
        this._target = http_1.HttpService;
        this._target.prototype.model || this.constructProperty('model');
        this._target.prototype.service || this.constructProperty('service');
    }
    _resolve(target, args) {
        var _a, _b, _c, _d;
        const scope = (_a = args === null || args === void 0 ? void 0 : args[0]) !== null && _a !== void 0 ? _a : {};
        if (scope.http && !(scope.http instanceof http_client_1.HttpClient))
            throw new exception_1.RuntimeException('HttpServiceLoader: missing required scope argument "HttpClient".');
        if (scope.route && !(scope.route.path && scope.route.pathname))
            throw new exception_1.RuntimeException('HttpServiceLoader: invalid scope argument "route".');
        (_b = scope.app) !== null && _b !== void 0 ? _b : (scope.app = this._app);
        if (scope.http) {
            (_c = scope.respond) !== null && _c !== void 0 ? _c : (scope.respond = this._app.get('http_respond').call([scope.http]));
            (_d = scope.session) !== null && _d !== void 0 ? _d : (scope.session = this._app.get('session').call([scope.http]));
        }
        if (scope.http && scope.route) {
            const controller = http_handler_1.HttpHandler.getControllerByRouteDescriptor(this._app, scope.route, scope.http);
            controller && (scope.controller = controller);
        }
        return this._target = new this._target(scope);
    }
    onGetDependency(target) {
        if (target instanceof service_1.Service && this._pushDependency(target) && this._target instanceof http_1.HttpService) {
            const scope = this._target.scope;
            this.serviceScope = {
                model: scope.model,
                service: scope.service,
                http: scope.http,
                route: scope.route,
                session: scope.session,
                respond: scope.respond,
                controller: scope.controller
            };
        }
        super.onGetDependency(target);
    }
    constructProperty(name) {
        this._target.prototype[name] = {};
        const repo = this._app.get(name).getRepo();
        utils_1.fs.dir(repo, ({ file }) => {
            if (!file)
                return;
            const path = utils_1.fs.skipExtension(utils_1.fs.formatPath(file.replace(repo, ''))).replace('/', '.');
            path && utils_1.object.set(this._target.prototype[name], path, {});
        });
    }
    _onGenerate(repository) {
    }
}
exports.HttpServiceLoader = HttpServiceLoader;
//# sourceMappingURL=http_service_loader.js.map