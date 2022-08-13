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
module.exports = (app, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const handler = new http_handler_1.HttpHandler(app, request, response);
    if (app.httpHandler)
        return yield app.httpHandler(handler);
    yield handler.runController();
});
//# sourceMappingURL=http_request.js.map