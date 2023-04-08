"use strict";
const http_client_1 = require("../core/http_client");
const http_1 = require("../core/interfaces/http");
const http_handler_1 = require("../core/http_handler");
const exception_1 = require("../core/exception");
module.exports = ((app, request, response) => {
    if (http_client_1.HttpClient.getResponseIsSent(response))
        return;
    const handler = new http_handler_1.HttpHandler(app, request, response);
    handler.setCors();
    handler.serveStatic((result) => {
        if (result)
            return;
        if (result === false) {
            response.writeHead(http_1.HTTP_STATUS.NO_CONTENT, {
                "Content-Type": http_1.HTTP_CONTENT_MIME_TYPES.icon,
            });
            response.end();
            return;
        }
        handler.fetchRequestData(() => {
            const route = app.router.getRouteByURLPathname(handler.url, handler.http.method);
            new Promise((resolve) => {
                if (false === handler.runHttpService(route) &&
                    false === handler.initController(route))
                    throw new exception_1.HttpException(handler.http, {
                        status: http_1.HTTP_STATUS.NOT_FOUND,
                    });
                resolve(null);
            }).catch((err) => {
                app.resolveException(err, request, response);
            });
        });
    });
});
//# sourceMappingURL=http_request.js.map