"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = exports.App = exports.dispatch = void 0;
const app_1 = require("./core/app");
Object.defineProperty(exports, "App", { enumerable: true, get: function () { return app_1.App; } });
const controller_1 = require("./core/controller");
Object.defineProperty(exports, "Controller", { enumerable: true, get: function () { return controller_1.Controller; } });
const route_1 = require("./middlewares/route");
var dispatch;
(function (dispatch) {
    dispatch.Route = function (call) {
        const route = new route_1.Route();
        call(Object.assign(Object.assign({}, route.scope), { route }));
        return route;
    };
})(dispatch = exports.dispatch || (exports.dispatch = {}));
//# sourceMappingURL=index.js.map