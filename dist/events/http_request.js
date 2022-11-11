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
const app_1 = require("../core/app");
const http_client_1 = require("../core/http_client");
const http_1 = require("../core/interfaces/http");
const exception_1 = require("../core/exception");
const controller_1 = require("../core/controller");
const warnings = {
    useCors: false,
    fetchDataOnRequest: false
};
module.exports = (app, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    if (http_client_1.HttpClient.getResponseIsSent(response))
        return;
    const config = app.config.get;
    const configHttp = config.http || {};
    /**************************************
     CORS LOADER
     ***************************************/
    if (configHttp.useCors) {
        http_client_1.HttpClient.setCorsHeaders(response);
        if (request.method === 'OPTIONS') {
            response.writeHead(http_1.HTTP_STATUS.OK, { 'Content-Type': http_client_1.JSON_CONTENT_TYPE });
            response.end();
            return;
        }
    }
    else if (!warnings.useCors) {
        warnings.useCors = true;
        console.log('The CORS headers are disabled in configuration. Set "useCors" to enable if needed.');
    }
    /**************************************
     SERVE STATIC
     ***************************************/
    const path = (0, app_1.loaders)().static.call([app, config, response], request.url);
    if (false === path)
        return;
    const sent = path && (yield (0, app_1.loaders)().static.send(path, {
        app,
        mimeTypes: http_client_1.HttpClient.mimeTypes(configHttp.mimeTypes),
        request,
        response
    }));
    if (sent)
        return;
    /**************************************
     FETCHING REQUEST DATA
     ***************************************/
    const url = http_client_1.HttpClient.getParsedURL(http_client_1.HttpClient.getURI(app.host) + request.url);
    const http = (0, app_1.loaders)().http.call([app, { request, response, url, host: app.host }]);
    if (configHttp.fetchDataOnRequest) {
        ['POST', 'PUT', 'PATCH'].includes(request.method) && (yield http.fetchData());
    }
    else if (!warnings.fetchDataOnRequest) {
        warnings.fetchDataOnRequest = true;
        console.log('Auto fetching data on request is disabled in configuration. Use "fetchData" method manually instead.');
    }
    /**************************************
     HTTP HANDLER
     ***************************************/
    const route = app.router.getRouteByURL(url, http.method);
    if (route.callback instanceof Function) {
        const service = (0, app_1.loaders)().httpService.call([{ http, route, app }]);
        const data = yield route.callback(service.scope);
        if (http_client_1.HttpClient.getResponseIsSent(response))
            return;
        data && http_client_1.HttpClient.sendJSON(response, data);
        return;
    }
    const controller = (0, app_1.loaders)().httpService.getController({ app, route, http }, (0, app_1.loaders)().controller)
        || (0, app_1.loaders)().controller.getControllerByRoute(app, route, http);
    if (!controller)
        throw new exception_1.HttpException(http, { status: http_1.HTTP_STATUS.NOT_FOUND });
    const data = yield controller[controller_1.CONTROLLER_INITIAL_ACTION]();
    if (http_client_1.HttpClient.getResponseIsSent(response))
        return;
    if (data)
        return http_client_1.HttpClient.sendJSON(response, data);
    const action = controller.route.action || http.method;
    if (http_1.HTTP_METHODS.includes(action) && action !== http.method)
        http_client_1.HttpClient.throwBadRequest();
    if (controller[action] instanceof Function) {
        const args = app.router.arrangeRouteParams(route);
        const data = yield controller[action].apply(controller, args);
        if (http_client_1.HttpClient.getResponseIsSent(response))
            return;
        data && http_client_1.HttpClient.sendJSON(response, data);
        return;
    }
    http_client_1.HttpClient.throwNoContent();
});
//# sourceMappingURL=http_request.js.map