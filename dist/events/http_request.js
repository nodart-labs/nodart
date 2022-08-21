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
const http_client_1 = require("../core/http_client");
module.exports = (app, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const staticLoader = app.get('static');
    const http = new http_client_1.HttpClient(request, response);
    const urlPath = http.parseURL.pathname === '/' ? app.config.get.staticIndex : http.parseURL.pathname;
    const file = staticLoader.require(urlPath).call();
    if (file)
        return staticLoader.send(file, response);
    const handler = new http_handler_1.HttpHandler(app, http);
    if (app.httpHandler)
        return yield app.httpHandler(handler);
    yield handler.runController();
});
//# sourceMappingURL=http_request.js.map