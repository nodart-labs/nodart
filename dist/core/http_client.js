"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = exports.DEFAULT_CONTENT_TYPE = exports.DEFAULT_FILE_MIME_TYPE = void 0;
const utils_1 = require("../utils");
const http_1 = require("../interfaces/http");
const exception_1 = require("./exception");
exports.DEFAULT_FILE_MIME_TYPE = 'application/octet-stream';
exports.DEFAULT_CONTENT_TYPE = 'application/json';
class HttpClient {
    constructor(request, response, config = {}) {
        var _a;
        this.request = request;
        this.response = response;
        this.config = config;
        this.config = Object.assign(Object.assign({}, config), { mimeTypes: Object.assign(Object.assign({}, http_1.HTTP_CONTENT_MIME_TYPES), (_a = config.mimeTypes) !== null && _a !== void 0 ? _a : {}), fileMimeType: config.fileMimeType || exports.DEFAULT_FILE_MIME_TYPE });
    }
    get responseIsSent() {
        return this.response.writableEnded || this.response.writableFinished;
    }
    get parseURL() {
        return this._dataURL || (this._dataURL = HttpClient.getParsedURL(this._host
            ? HttpClient.getURI(this._host) + '/' + utils_1.$.trimPath(this.request.url)
            : this.request.url));
    }
    set host(data) {
        this._host = data;
    }
    send(data, status = http_1.HTTP_STATUS_CODES.OK, contentType) {
        this.setResponseData({
            status,
            contentType: contentType || HttpClient.getDefaultContentType('json', this.config.mimeTypes),
            content: { json: data }
        });
    }
    sendText(data, status = http_1.HTTP_STATUS_CODES.OK, contentType) {
        this.setResponseData({
            status,
            contentType: contentType || HttpClient.getDefaultContentType('text', this.config.mimeTypes, 'text/plain'),
            content: { text: data }
        });
    }
    sendHtml(content, status = http_1.HTTP_STATUS_CODES.OK, contentType) {
        this.setResponseData({
            status,
            contentType: contentType || HttpClient.getDefaultContentType('html', this.config.mimeTypes, 'text/html'),
            content: { html: content }
        });
    }
    sendFile(filePath, contentType) {
        utils_1.fs.system.readFile(filePath, (err, buffer) => {
            var _a;
            if (err) {
                this.exceptionMessage = `Could not read data from file ${filePath}.`;
                this.exceptionData = err;
                throw new exception_1.RuntimeException(this);
            }
            const ext = utils_1.$.trim((_a = utils_1.fs.parseFile(filePath).ext) !== null && _a !== void 0 ? _a : '', '.');
            contentType || (contentType = HttpClient.getDefaultContentType(ext, this.config.mimeTypes, exports.DEFAULT_FILE_MIME_TYPE));
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
        data.contentType || (data.contentType = HttpClient.getDefaultContentType(contentEntry));
        return data.content[contentEntry];
    }
    static getDefaultContentType(entry, mimeTypes = {}, defaultMimeType = exports.DEFAULT_CONTENT_TYPE) {
        var _a;
        const contentTypes = Object.assign(Object.assign({ buffer: exports.DEFAULT_FILE_MIME_TYPE }, http_1.HTTP_CONTENT_MIME_TYPES), mimeTypes);
        return (_a = contentTypes[entry]) !== null && _a !== void 0 ? _a : defaultMimeType;
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
        const contentType = (_d = (_c = http.responseData.contentType) !== null && _c !== void 0 ? _c : http.response.getHeader('content-type')) !== null && _d !== void 0 ? _d : exports.DEFAULT_CONTENT_TYPE;
        const content = HttpClient.getStatusCodeMessage(status);
        return { status, contentType, content };
    }
    static getParsedURL(url) {
        return require('url').parse(url, true);
    }
    static fetchHostData(data) {
        const { port, protocol, host, hostname } = HttpClient.getParsedURL(HttpClient.getURI(data));
        return { port, protocol, host, hostname };
    }
    static getURI(data) {
        return `${utils_1.$.trim(data.protocol, ':')}://${utils_1.$.trim(data.host, ':' + data.port)}` + (data.port ? ':' + data.port : '');
    }
}
exports.HttpClient = HttpClient;
//# sourceMappingURL=http_client.js.map