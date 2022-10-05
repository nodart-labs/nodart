"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const http_handler_1 = require("../core/http_handler");
const http_1 = require("../services/http");
module.exports = (app, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const http = app.get('http').call([request, response]);
    /**************************************
     STATIC LOADER
    ***************************************/
    const staticLoader = app.get('static');
    const filePath = http.parseURL.pathname === '/' ? app.config.get.staticIndex : http.parseURL.pathname;
    const file = staticLoader.require(filePath).call();
    if (file)
        return staticLoader.send(file, http);
    /**************************************
     HTTP SERVICE LOADER
    ***************************************/
    if (app.httpServiceRoutes.length) {
        const httpServiceHandler = new http_1.HttpServiceHandler(app.router, app.httpServiceRoutes);
        const runHttpService = (filterRoute) => __awaiter(void 0, void 0, void 0, function* () {
            const routeData = httpServiceHandler.getRouteData(filterRoute, http.parseURL);
            const routeObject = routeData ? httpServiceHandler.findRouteByRouteData(routeData) : null;
            if (routeObject && routeData) {
                const scope = { http, route: routeData, app };
                yield httpServiceHandler.runRoute(routeObject, scope, app.get('http_service'));
                return true;
            }
        });
        yield runHttpService((route) => route.action === http_1.HTTP_SERVICE_ACCEPTOR_COMMON_ACTION);
        if (http.responseIsSent)
            return;
        const httpMethod = request.method.toLowerCase();
        if (yield runHttpService((route) => route.action === httpMethod))
            return;
    }
    /**************************************
     CONTROLLER LOADER
    ***************************************/
    const handler = new http_handler_1.HttpHandler(app, http);
    if (app.httpHandlerPayload)
        yield app.httpHandlerPayload(handler);
    yield handler.runController();
});
//# sourceMappingURL=http_request.js.map