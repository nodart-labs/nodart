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
const http_client_1 = require("../core/http_client");
module.exports = ((app, http) => __awaiter(void 0, void 0, void 0, function* () {
    if (http_client_1.HttpClient.getResponseIsSent(http.response))
        return;
    const response = http.responseData;
    const content = http_client_1.HttpClient.getHttpResponseDataContent(response);
    http.response.writeHead(response.status, { 'Content-Type': response.contentType });
    http.response.end(content);
}));
//# sourceMappingURL=http_response.js.map