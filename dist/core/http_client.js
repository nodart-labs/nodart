"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = exports.DEFAULT_FILE_MIME_TYPE = void 0;
const utils_1 = require("../utils");
const exception_1 = require("./exception");
const http_1 = require("../interfaces/http");
exports.DEFAULT_FILE_MIME_TYPE = 'application/octet-stream';
class HttpClient {
    constructor(request, response, config = {}) {
        var _a;
        this.request = request;
        this.response = response;
        this.config = config;
        this.config = Object.assign(Object.assign({}, config), { mimeTypes: Object.assign(Object.assign({}, http_1.HTTP_CONTENT_MIME_TYPES), (_a = config.mimeTypes) !== null && _a !== void 0 ? _a : {}), fileMimeType: config.fileMimeType || exports.DEFAULT_FILE_MIME_TYPE });
    }
    get parseURL() {
        return this._dataURL || (this._dataURL = HttpClient.getParsedURL(this.request.url));
    }
    send(data, status = http_1.HTTP_STATUS_CODES.OK, contentType) {
        this.setResponseData({
            status,
            contentType: contentType || this.config.mimeTypes.json,
            content: { json: data }
        });
    }
    sendText(data, status = http_1.HTTP_STATUS_CODES.OK, contentType) {
        this.setResponseData({
            status,
            contentType: contentType || this.config.mimeTypes.text,
            content: { text: data }
        });
    }
    sendHtml(content, status = http_1.HTTP_STATUS_CODES.OK, contentType) {
        this.setResponseData({
            status,
            contentType: contentType || this.config.mimeTypes.html,
            content: { html: content }
        });
    }
    sendFile(filePath, contentType) {
        utils_1.fs.system.readFile(filePath, (err, buffer) => {
            var _a, _b;
            if (err) {
                this.exceptionMessage = 'Could not read data from file.';
                this.exceptionData = err;
                throw new exception_1.RuntimeException(this);
            }
            contentType || (contentType = (_b = this.config.mimeTypes[utils_1.$.trim((_a = utils_1.fs.parseFile(filePath).ext) !== null && _a !== void 0 ? _a : '', '.')]) !== null && _b !== void 0 ? _b : exports.DEFAULT_FILE_MIME_TYPE);
            this.setResponseData({ content: { buffer }, contentType });
        });
    }
    setResponseData(data) {
        this.responseData = data;
    }
    getHttpResponse(assignResponseData) {
        return {
            response: this.response,
            request: this.request,
            responseData: HttpClient.getHttpResponseData(this, assignResponseData),
            exceptionData: this.exceptionData,
            exceptionMessage: this.exceptionMessage,
        };
    }
    static getParsedURL(url) {
        return require('url').parse(url, true);
    }
    static getHttpResponseData(http, assignData) {
        var _a, _b, _c, _d, _e;
        http.responseData || (http.responseData = {});
        (assignData === null || assignData === void 0 ? void 0 : assignData.content) && (http.responseData.content = assignData === null || assignData === void 0 ? void 0 : assignData.content);
        http.responseData.status = (_c = (_b = (_a = assignData === null || assignData === void 0 ? void 0 : assignData.status) !== null && _a !== void 0 ? _a : http.responseData.status) !== null && _b !== void 0 ? _b : http.response.statusCode) !== null && _c !== void 0 ? _c : http_1.HTTP_STATUS_CODES.OK;
        http.responseData.contentType = (_e = (_d = assignData === null || assignData === void 0 ? void 0 : assignData.contentType) !== null && _d !== void 0 ? _d : http.responseData.contentType) !== null && _e !== void 0 ? _e : http.response.getHeader('content-type');
        HttpClient.getHttpResponseDataContent(http.responseData);
        return http.responseData;
    }
    static getHttpResponseDataContent(data) {
        data.content || (data.content = { json: '' });
        const contentEntry = Object.keys(data.content)[0];
        contentEntry === 'json'
            && data.content[contentEntry] instanceof Object
            && (data.content[contentEntry] = JSON.stringify(data.content[contentEntry]));
        if (!data.contentType) {
            switch (contentEntry) {
                case 'json':
                    data.contentType = 'application/json';
                    break;
                case 'text':
                    data.contentType = 'text/plain';
                    break;
                case 'html':
                    data.contentType = 'text/html';
                    break;
                case 'buffer':
                    data.contentType = exports.DEFAULT_FILE_MIME_TYPE;
                    break;
            }
        }
        return data.content[contentEntry];
    }
    static getStatusCodeMessage(status) {
        for (const [key, value] of Object.entries(http_1.HTTP_STATUS_CODES)) {
            if (status === value)
                return key;
        }
        return '';
    }
    static getDataFromStatusCode(http, setStatusIfNone) {
        var _a, _b, _c, _d;
        http.responseData || (http.responseData = {});
        const status = (_b = (_a = http.responseData.status) !== null && _a !== void 0 ? _a : setStatusIfNone) !== null && _b !== void 0 ? _b : http.response.statusCode;
        const contentType = (_d = (_c = http.responseData.contentType) !== null && _c !== void 0 ? _c : http.response.getHeader('content-type')) !== null && _d !== void 0 ? _d : 'application/json';
        const content = HttpClient.getStatusCodeMessage(status);
        return { status, contentType, content };
    }
}
exports.HttpClient = HttpClient;
//# sourceMappingURL=http_client.js.map