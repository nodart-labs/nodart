"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpServiceAcceptor = exports.HttpService = void 0;
class HttpService {
    constructor() {
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
exports.HttpService = HttpService;
class HttpServiceAcceptor {
    constructor(service) {
        this.service = service;
    }
    any(route, callback) {
        this.service.sendRoute(route, 'any', callback);
    }
    get(route, callback) {
        this.service.sendRoute(route, 'get', callback);
    }
    head(route, callback) {
        this.service.sendRoute(route, 'head', callback);
    }
    patch(route, callback) {
        this.service.sendRoute(route, 'patch', callback);
    }
    post(route, callback) {
        this.service.sendRoute(route, 'post', callback);
    }
    put(route, callback) {
        this.service.sendRoute(route, 'put', callback);
    }
    delete(route, callback) {
        this.service.sendRoute(route, 'delete', callback);
    }
    connect(route, callback) {
        this.service.sendRoute(route, 'connect', callback);
    }
    copy(route, callback) {
        this.service.sendRoute(route, 'copy', callback);
    }
    lock(route, callback) {
        this.service.sendRoute(route, 'lock', callback);
    }
    mkcol(route, callback) {
        this.service.sendRoute(route, 'mkcol', callback);
    }
    move(route, callback) {
        this.service.sendRoute(route, 'move', callback);
    }
    options(route, callback) {
        this.service.sendRoute(route, 'options', callback);
    }
    propfind(route, callback) {
        this.service.sendRoute(route, 'propfind', callback);
    }
    proppatch(route, callback) {
        this.service.sendRoute(route, 'proppatch', callback);
    }
    search(route, callback) {
        this.service.sendRoute(route, 'search', callback);
    }
    trace(route, callback) {
        this.service.sendRoute(route, 'trace', callback);
    }
    unlock(route, callback) {
        this.service.sendRoute(route, 'unlock', callback);
    }
}
exports.HttpServiceAcceptor = HttpServiceAcceptor;
//# sourceMappingURL=http.js.map