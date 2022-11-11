"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpServiceAcceptor = exports.HttpService = void 0;
const service_1 = require("../core/service");
const di_1 = require("../core/di");
class HttpService extends service_1.Service {
    constructor(scope = {}) {
        super(scope);
        this.subscribers = [];
    }
    sendRoute(route, action, callback) {
        route = typeof route === 'string' ? { path: route } : route;
        this.subscribers.forEach(listen => listen({ route, action, callback }));
    }
    subscribe(subscriber) {
        this.subscribers.push(subscriber);
    }
    get httpAcceptor() {
        return new HttpServiceAcceptor(this);
    }
}
__decorate([
    (0, di_1.injects)('service')
], HttpService.prototype, "service", void 0);
__decorate([
    (0, di_1.injects)('model')
], HttpService.prototype, "model", void 0);
exports.HttpService = HttpService;
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
//# sourceMappingURL=http.js.map