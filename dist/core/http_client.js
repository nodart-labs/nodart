"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
const _url = require('url');
class HttpClient {
    constructor(request, response) {
        this.request = request;
        this.response = response;
    }
    get parseURL() {
        return _url.parse(this.request.url, true);
    }
    static isValidURL(url) {
        try {
            new _url.URL(url);
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
exports.HttpClient = HttpClient;
//# sourceMappingURL=http_client.js.map