"use strict";
const http_client_1 = require("../core/http_client");
module.exports = ((app, http) => {
    if (http_client_1.HttpClient.getResponseIsSent(http.response))
        return;
    const response = http.responseData;
    const content = http_client_1.HttpClient.getHttpResponseDataContent(response);
    http.response.writeHead(response.status, {
        "Content-Type": response.contentType,
    });
    http.response.end(content);
});
//# sourceMappingURL=http_response.js.map