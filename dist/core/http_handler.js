"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpHandler = void 0;
const utils_1 = require("../utils");
const app_1 = require("./app");
const http_client_1 = require("./http_client");
const http_1 = require("./interfaces/http");
const controller_1 = require("./controller");
class HttpHandler {
    constructor(app, request, response) {
        this.app = app;
        this.request = request;
        this.response = response;
        this.url = "";
    }
    setCors() {
        if (this.app.config.get.http.useCors) {
            http_client_1.HttpClient.setCorsHeaders(this.response);
            if (this.request.method === "OPTIONS") {
                this.response.writeHead(http_1.HTTP_STATUS.OK, {
                    "Content-Type": http_client_1.JSON_CONTENT_TYPE,
                });
                this.response.end();
                return;
            }
        }
        else if (!HttpHandler.warnings.useCors) {
            HttpHandler.warnings.useCors = true;
            console.warn("The CORS headers are disabled in configuration.");
        }
    }
    serveStatic(callback) {
        if (this.app.config.get.static.serve) {
            const pathname = this.request.url.includes("?")
                ? this.request.url.split("?")[0]
                : this.request.url;
            const path = (0, app_1.loaders)().static.call([this.app.config.get], pathname);
            if (!path)
                return callback(path);
            (0, app_1.loaders)().static.serve(path, {
                app: this.app,
                mimeTypes: http_client_1.HttpClient.mimeTypes(this.app.config.get.http.mimeTypes),
                request: this.request,
                response: this.response,
                callback,
            });
        }
        else {
            callback();
            if (!HttpHandler.warnings.serveStatic) {
                HttpHandler.warnings.serveStatic = true;
                console.warn("Static files serve is disabled in configuration.");
            }
        }
    }
    fetchRequestData(callback, onError) {
        const { url, query, queryString } = http_client_1.HttpClient.parseURL(this.request.url);
        this.url = url;
        this.http = (0, app_1.loaders)().http.call([
            this.app,
            {
                host: this.app.host,
                uri: this.app.uri,
                query,
                queryString,
                request: this.request,
                response: this.response,
            },
        ]);
        if (this.app.config.get.http.fetchDataOnRequest) {
            ["POST", "PUT", "PATCH"].includes(this.request.method)
                ? this.http.fetchData(callback, onError)
                : callback();
        }
        else {
            callback();
            if (!HttpHandler.warnings.fetchDataOnRequest) {
                HttpHandler.warnings.fetchDataOnRequest = true;
                console.warn("Auto fetching data on request is disabled in configuration.");
            }
        }
    }
    runHttpService(route) {
        if (!route.callback)
            return false;
        const scope = this.app.factory.service.createServiceScope(this.http, route);
        this.processData(route.callback(scope));
    }
    initController(route) {
        const controller = (0, app_1.loaders)().controller.getControllerByRouteDescriptor(this.app, route, this.http) ||
            // deprecated: loaders().controller.getControllerByRoutePath(this.app, route, this.http);
            (0, app_1.loaders)().controller.getControllerByRouteEntry(this.app, route, this.http);
        if (!controller)
            return false;
        const action = this.fetchControllerAction(controller);
        if (!action)
            http_client_1.HttpClient.throwBadRequest();
        this.processData(controller[controller_1.CONTROLLER_INITIAL_ACTION]({ action }), () => this.runController(controller, route, action));
    }
    runController(controller, route, action) {
        const args = this.app.router.arrangeRouteParams(route);
        this.processData(controller[action].apply(controller, args));
    }
    fetchControllerAction(controller) {
        var _a;
        const action = (_a = controller.route.action) === null || _a === void 0 ? void 0 : _a.trim();
        if (!action) {
            return typeof controller[this.http.method] === "function"
                ? this.http.method
                : "";
        }
        const httpAction = `${this.http.method}${utils_1.$.capitalize(action)}`;
        return typeof controller[httpAction] === "function"
            ? httpAction
            : typeof controller[action] === "function"
                ? action
                : "";
    }
    processData(data, callback) {
        if (http_client_1.HttpClient.getResponseIsSent(this.response))
            return;
        if (data !== undefined) {
            return data instanceof Promise
                ? data
                    .then((data) => {
                    if (http_client_1.HttpClient.getResponseIsSent(this.response))
                        return;
                    data !== undefined
                        ? http_client_1.HttpClient.sendJSON(this.response, data)
                        : callback === null || callback === void 0 ? void 0 : callback();
                })
                    .catch((err) => this.app.resolveException(err, this.request, this.response))
                : http_client_1.HttpClient.sendJSON(this.response, data);
        }
        callback === null || callback === void 0 ? void 0 : callback();
    }
}
HttpHandler.warnings = {
    useCors: false,
    serveStatic: false,
    fetchDataOnRequest: false,
};
exports.HttpHandler = HttpHandler;
//# sourceMappingURL=http_handler.js.map