"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = exports.CONTROLLER_HTTP_ACTIONS = exports.CONTROLLER_INITIAL_ACTION = void 0;
const di_1 = require("./di");
const http_respond_1 = require("./http_respond");
exports.CONTROLLER_INITIAL_ACTION = 'init';
exports.CONTROLLER_HTTP_ACTIONS = ['get', 'post', 'patch', 'put', 'delete', 'head'];
let Controller = class Controller extends http_respond_1.HttpRespond {
    constructor(app, http, route) {
        super(http);
        this.app = app;
        this.http = http;
        this.route = route;
    }
    get session() {
        return this._session || (this._session = this.app.get('session').call([this.http]));
    }
    get engine() {
        return this._engine || (this._engine = this.app.get('engine').call());
    }
    get httpResponder() {
        return this._httpResponder || (this._httpResponder = new (this.app.config.get.httpResponder || http_respond_1.HttpResponder)(this));
    }
};
__decorate([
    (0, di_1.injects)('service')
], Controller.prototype, "service", void 0);
__decorate([
    (0, di_1.injects)('model')
], Controller.prototype, "model", void 0);
Controller = __decorate([
    (0, di_1.uses)('service'),
    (0, di_1.uses)('model')
], Controller);
exports.Controller = Controller;
//# sourceMappingURL=controller.js.map