"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resource = void 0;
const utils_1 = require("../utils");
const app_config_1 = require("./app_config");
const fs = require('fs');
const path = require('path');
class Resource {
    constructor(response) {
        this.response = response;
    }
    send(data, status = 200, contentType = 'application/json') {
        this.response.writeHead(status, { 'Content-Type': contentType });
        data ? this.response.end(utils_1.$.isPlainObject(data) ? JSON.stringify(data) : data.toString(), 'utf-8')
            : this.response.end();
    }
    sendHtml(content) {
        this.response.writeHead(200, { 'Content-Type': 'text/html' });
        this.response.end(content, 'utf-8');
    }
    sendFile(filePath, mimeTypes, defaultMimeType) {
        const ext = utils_1.$.trim(path.extname(filePath), '.');
        mimeTypes = Object.assign(Object.assign({}, app_config_1.DEFAULT_MIME_TYPES), mimeTypes !== null && mimeTypes !== void 0 ? mimeTypes : {});
        const contentType = mimeTypes[ext] || defaultMimeType || app_config_1.DEFAULT_MIME_TYPE;
        fs.readFile(filePath, (err, content) => {
            // todo: exception handler
            if (err) {
                this.response.writeHead(500);
                this.response.end();
            }
            else {
                this.response.writeHead(200, { 'Content-Type': contentType });
                this.response.end(content, 'utf-8');
            }
        });
    }
}
exports.Resource = Resource;
//# sourceMappingURL=resource.js.map