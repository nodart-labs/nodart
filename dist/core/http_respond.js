"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpResponder = exports.HttpRespond = void 0;
class HttpRespond {
    constructor(http) {
        this.http = http;
    }
    get send() {
        return this.httpResponder;
    }
}
exports.HttpRespond = HttpRespond;
class HttpResponder {
    constructor(respond) {
        this.respond = respond;
    }
    data(body, status, contentType) {
        this.respond.http.send(body, status, contentType);
    }
    view(template, assign, status, callback) {
        this.respond.http.sendHtml(this.respond.engine.getTemplate(template, assign, callback), status);
    }
}
exports.HttpResponder = HttpResponder;
//# sourceMappingURL=http_respond.js.map