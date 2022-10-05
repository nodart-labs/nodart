"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpRespond = void 0;
class HttpRespond {
    constructor(http) {
        this.http = http;
    }
    get send() {
        return {
            data: (body, status, contentType) => {
                this.http.send(body, status, contentType);
            },
            view: (template, args, status, callback) => {
                this.http.sendHtml(this.engine.view(template, args, callback), status);
            }
        };
    }
}
exports.HttpRespond = HttpRespond;
//# sourceMappingURL=http_respond.js.map