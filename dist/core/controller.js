"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = exports.BaseController = exports.CONTROLLER_INITIAL_ACTION = void 0;
const di_1 = require("./di");
exports.CONTROLLER_INITIAL_ACTION = 'init';
class BaseController {
    constructor(app, http, route) {
        this.app = app;
        this.http = http;
        this.route = route;
    }
    get session() {
        return this.http.session;
    }
    get send() {
        return this.http.respond;
    }
}
exports.BaseController = BaseController;
class Controller extends BaseController {
}
__decorate([
    (0, di_1.injects)('service')
], Controller.prototype, "service", void 0);
__decorate([
    (0, di_1.injects)('model')
], Controller.prototype, "model", void 0);
exports.Controller = Controller;
//# sourceMappingURL=controller.js.map