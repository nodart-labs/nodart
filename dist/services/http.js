"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.HttpServiceHandler = exports.HttpServiceAcceptor = exports.HTTP_SERVICE_ACCEPTOR_COMMON_ACTION = exports.HttpService = void 0;
const service_1 = require("../core/service");
const di_1 = require("../core/di");
const utils_1 = require("../utils");
let HttpService = class HttpService extends service_1.Service {
    constructor(scope) {
        super(scope);
        this.subscribers = [];
        this.setScope(scope);
    }
    setScope(scope) {
        scope.model = this.model;
        scope.service = this.service;
        super.setScope(scope);
    }
    get scope() {
        return this._scope;
    }
    sendRoute(route, action, callback) {
        this.subscribers.forEach(cb => cb({ route, action, callback }));
    }
    subscribe(subscriber) {
        this.subscribers.push(subscriber);
    }
    get httpAcceptor() {
        return new HttpServiceAcceptor(this);
    }
};
__decorate([
    (0, di_1.injects)('service')
], HttpService.prototype, "service", void 0);
__decorate([
    (0, di_1.injects)('model')
], HttpService.prototype, "model", void 0);
HttpService = __decorate([
    (0, di_1.uses)('service'),
    (0, di_1.uses)('model')
], HttpService);
exports.HttpService = HttpService;
exports.HTTP_SERVICE_ACCEPTOR_COMMON_ACTION = 'any';
class HttpServiceAcceptor {
    constructor(_httpService) {
        this._httpService = _httpService;
    }
    any(route, callback) {
        this._httpService.sendRoute(route, 'any', callback);
    }
    get(route, callback) {
        this._httpService.sendRoute(route, 'get', callback);
    }
    head(route, callback) {
        this._httpService.sendRoute(route, 'head', callback);
    }
    patch(route, callback) {
        this._httpService.sendRoute(route, 'patch', callback);
    }
    post(route, callback) {
        this._httpService.sendRoute(route, 'post', callback);
    }
    put(route, callback) {
        this._httpService.sendRoute(route, 'put', callback);
    }
    delete(route, callback) {
        this._httpService.sendRoute(route, 'delete', callback);
    }
}
exports.HttpServiceAcceptor = HttpServiceAcceptor;
class HttpServiceHandler {
    constructor(router, routes) {
        this.router = router;
        this.routes = routes;
    }
    getRouteData(filter, url) {
        const routes = this.routes.filter(route => filter(route)).map(r => r.route);
        return this.router.findRoute(routes, url);
    }
    findRouteByRouteData(data) {
        return this.routes.find(r => utils_1.$.trimPath(typeof r.route === 'string' ? r.route : r.route.path) === data.path);
    }
    runRoute(route, scope, loader) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const httpService = loader.call([scope]);
            const data = yield route.callback(httpService.scope);
            if ((_a = httpService.scope.http) === null || _a === void 0 ? void 0 : _a.responseIsSent)
                return;
            if (utils_1.$.isPlainObject(data) || typeof data === 'string')
                (_b = httpService.scope.respond) === null || _b === void 0 ? void 0 : _b.send.data(data);
            return data;
        });
    }
}
exports.HttpServiceHandler = HttpServiceHandler;
//# sourceMappingURL=http.js.map