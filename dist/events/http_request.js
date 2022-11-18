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
    serveStatic: false,
    fetchDataOnRequest: false
};
module.exports = ((app, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
        console.log('The CORS headers are disabled in configuration.');
    }
    /**************************************
     SERVE STATIC
     ***************************************/
    if ((_a = config.static) === null || _a === void 0 ? void 0 : _a.serve) {
        const pathname = request.url.includes('?') ? request.url.split('?')[0] : request.url;
        const path = (0, app_1.loaders)().static.call([config], pathname);
        const sent = path && (yield (0, app_1.loaders)().static.serve(path, {
            app,
            mimeTypes: http_client_1.HttpClient.mimeTypes(configHttp.mimeTypes),
            request,
            response
        }));
        if (false === sent) {
            response.writeHead(http_1.HTTP_STATUS.NO_CONTENT, { 'Content-Type': http_1.HTTP_CONTENT_MIME_TYPES.icon });
            response.end();
            return;
        }
        if (sent)
            return;
    }
    else if (!warnings.serveStatic) {
        warnings.serveStatic = true;
        console.log('Static files serve is disabled in configuration.');
    }
    /**************************************
     FETCHING REQUEST DATA
     ***************************************/
    const { url, query, queryString } = http_client_1.HttpClient.parseURL(request.url);
    const http = (0, app_1.loaders)().http.call([app, { host: app.host, uri: app.uri, query, queryString, request, response }]);
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
    const route = app.router.getRouteByURLPathname(url, http.method);
    if (route.callback) {
        const scope = app.factory.service.createServiceScope(http, route);
        const data = yield route.callback(scope);
        if (http_client_1.HttpClient.getResponseIsSent(response))
            return;
        data && http_client_1.HttpClient.sendJSON(response, data);
        return;
    }
    const controller = (0, app_1.loaders)().controller.getControllerByServiceScope({ app, route, http })
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
    if (typeof controller[action] === 'function') {
        const args = app.router.arrangeRouteParams(route);
        const data = yield controller[action].apply(controller, args);
        if (http_client_1.HttpClient.getResponseIsSent(response))
            return;
        data && http_client_1.HttpClient.sendJSON(response, data);
        return;
    }
    http_client_1.HttpClient.throwNoContent();
}));
//# sourceMappingURL=http_request.js.map