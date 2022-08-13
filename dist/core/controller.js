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
exports.CONTROLLER_INITIAL_ACTION = 'init';
exports.CONTROLLER_HTTP_ACTIONS = ['get', 'post', 'patch', 'put', 'delete', 'head'];
let Controller = class Controller {
    constructor(app, http, route) {
        this.app = app;
        this.http = http;
        this.route = route;
    }
};
__decorate([
    (0, di_1.injects)('entity')
], Controller.prototype, "entity", void 0);
__decorate([
    (0, di_1.injects)('middleware')
], Controller.prototype, "middleware", void 0);
__decorate([
    (0, di_1.injects)('middleware/route')
], Controller.prototype, "routes", void 0);
__decorate([
    (0, di_1.injects)('strategy')
], Controller.prototype, "strategy", void 0);
__decorate([
    (0, di_1.injects)('engine')
], Controller.prototype, "engine", void 0);
Controller = __decorate([
    (0, di_1.uses)('middleware'),
    (0, di_1.uses)('strategy'),
    (0, di_1.uses)('entity'),
    (0, di_1.uses)('engine')
], Controller);
exports.Controller = Controller;
//# sourceMappingURL=controller.js.map