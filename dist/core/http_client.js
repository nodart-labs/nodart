"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = exports.HttpFormData = exports.HttpContainer = exports.FORM_CONTENT_TYPE = exports.HTML_CONTENT_TYPE = exports.TEXT_CONTENT_TYPE = exports.JSON_CONTENT_TYPE = exports.FILE_CONTENT_TYPE = void 0;
const utils_1 = require("../utils");
const http_1 = require("./interfaces/http");
const http_responder_1 = require("./http_responder");
const engine_1 = require("./engine");
const session_1 = require("./session");
const exception_1 = require("./exception");
exports.FILE_CONTENT_TYPE = 'application/octet-stream';
exports.JSON_CONTENT_TYPE = 'application/json; charset=utf-8';
exports.TEXT_CONTENT_TYPE = 'text/plain; charset=utf-8';
exports.HTML_CONTENT_TYPE = 'text/html';
exports.FORM_CONTENT_TYPE = 'multipart/form-data';
const querystring = require('node:querystring');
class HttpContainer {
    constructor(config) {
        this.config = config;
        this.isDataFetched = false;
        this._data = {};
        this.exceptionMessage = "";
    }
    get host() {
        return this.config.host;
    }
    get uri() {
        return this.config.uri;
    }
    get method() {
        var _a;
        return (_a = this.config).method || (_a.method = this.request.method.toLowerCase());
    }
    get query() {
        return this.config.query;
    }
    get queryString() {
        return this.config.queryString || '';
    }
    get request() {
        return this.config.request;
    }
    get response() {
        return this.config.response;
    }
    get data() {
        return this._data;
    }
    get ready() {
        return !!this.isDataFetched;
    }
    get form() {
        return (this._form || (this._form = new HttpFormData(this, this.config.form)));
    }
    set form(formDataHandler) {
        this._form = formDataHandler;
    }
    get isFormData() {
        var _a;
        return (_a = this.request.headers['content-type']) === null || _a === void 0 ? void 0 : _a.includes(exports.FORM_CONTENT_TYPE);
    }
    get hasError() {
        return !!(this.exceptionMessage || this.exceptionData || this.form.hasError);
    }
    get responseSent() {
        return HttpClient.getResponseIsSent(this.response);
    }
    get respond() {
        var _a, _b;
        if (this._responder)
            return this._responder;
        const responder = this.config.responder || http_responder_1.HttpResponder;
        const engineConfig = ((_a = this.config.engine) === null || _a === void 0 ? void 0 : _a.config) || {};
        const engine = typeof ((_b = this.config.engine) === null || _b === void 0 ? void 0 : _b.client) === 'function'
            ? this.config.engine.client(engineConfig)
            : new engine_1.Engine(engineConfig);
        return this._responder = Reflect.construct(responder, [this, engine]);
    }
    get session() {
        var _a, _b;
        if (this._session)
            return this._session;
        const sessionConfig = ((_a = this.config.session) === null || _a === void 0 ? void 0 : _a.config) || {};
        return this._session = typeof ((_b = this.config.session) === null || _b === void 0 ? void 0 : _b.client) === 'function'
            ? this.config.session.client(sessionConfig, this)
            : new session_1.Session(sessionConfig).load(this);
    }
    assignData(config) {
        Object.assign(this.config, config);
    }
    getHttpResponse(assignResponseData) {
        const form = this.isFormData ? this.form : { fields: {}, files: {} };
        return {
            uri: this.uri,
            host: this.host,
            query: this.query,
            queryString: this.queryString,
            method: this.method,
            data: this.data,
            form,
            request: this.request,
            response: this.response,
            exceptionData: this.exceptionData,
            exceptionMessage: this.exceptionMessage,
            responseData: HttpClient.getHttpResponseData(this, assignResponseData),
        };
    }
    setResponseData(responseData) {
        var _a, _b;
        this.responseData = responseData;
        (_b = (_a = this.config).onSetResponseData) === null || _b === void 0 ? void 0 : _b.call(_a, responseData);
    }
    send(content, status = http_1.HTTP_STATUS.OK, contentType) {
        this.setResponseData({
            status,
            contentType: contentType || HttpClient.getDefaultContentType('json', this.config.mimeTypes),
            content: { json: content }
        });
    }
    sendText(content, status = http_1.HTTP_STATUS.OK, contentType) {
        this.setResponseData({
            status,
            contentType: contentType || HttpClient.getDefaultContentType('text', this.config.mimeTypes, exports.TEXT_CONTENT_TYPE),
            content: { text: content }
        });
    }
    sendHtml(content, status = http_1.HTTP_STATUS.OK, contentType) {
        this.setResponseData({
            status,
            contentType: contentType || HttpClient.getDefaultContentType('html', this.config.mimeTypes, exports.HTML_CONTENT_TYPE),
            content: { html: content }
        });
    }
    sendFile(filePath, contentType) {
        if (this.responseSent)
            return;
        this.response.writeHead(http_1.HTTP_STATUS.OK, {
            'Content-Type': contentType || HttpClient.getDefaultContentType(utils_1.fs.getExtension(filePath), this.config.mimeTypes, exports.FILE_CONTENT_TYPE)
        });
        const readStream = utils_1.fs.system.createReadStream(filePath);
        readStream.on('error', err => {
            var _a, _b;
            this.handleError(err, `Could not read data from file ${filePath}.`);
            (_b = (_a = this.config).onError) === null || _b === void 0 ? void 0 : _b.call(_a, err);
        });
        readStream.pipe(this.response);
    }
    handleError(err, message) {
        this._data = {};
        if (err) {
            this.exceptionMessage = message !== null && message !== void 0 ? message : err.message;
            this.exceptionData = err;
        }
    }
    throw(status, message, data) {
        message && (this.exceptionMessage = message);
        data && (this.exceptionData = data);
        throw new exception_1.HttpException(this, { status });
    }
    exit(status, message, data) {
        message && (this.exceptionMessage = message);
        data && (this.exceptionData = data);
        this.response.statusCode = status;
        throw new exception_1.RuntimeException(this);
    }
    fetchData() {
        return new Promise((resolve, reject) => {
            if (this.isDataFetched || this.isFormData) {
                resolve(this._data);
                return;
            }
            const chunks = [];
            this.request.on('data', chunk => chunks.push(chunk));
            this.request.on('end', () => {
                this._data = {};
                this.onFetchData(Buffer.concat(chunks), (err) => {
                    if (err) {
                        reject(err);
                        this.handleError(err, 'Failed to fetch data from request');
                        return;
                    }
                    this.isDataFetched = true;
                    resolve(this._data);
                });
            });
            this.request.on('error', (err) => {
                var _a, _b;
                reject(err);
                this.handleError(err, 'Failed to fetch data from request');
                (_b = (_a = this.config).onError) === null || _b === void 0 ? void 0 : _b.call(_a, err);
            });
            this.request.on('aborted', () => {
                reject({ message: 'request aborted' });
                this.handleError();
            });
        });
    }
    onFetchData(buffer, callback) {
        const data = buffer.toString().trim();
        try {
            this._data = data.startsWith('{') || data.startsWith('[')
                ? JSON.parse(data)
                : HttpClient.parseURLQuery(data);
            callback();
        }
        catch (e) {
            callback(e);
        }
    }
}
exports.HttpContainer = HttpContainer;
class HttpFormData {
    constructor(http, config = { options: {} }) {
        var _a;
        this.http = http;
        this.config = config;
        this.client = require('busboy');
        this.fields = {};
        this.files = {};
        this._stat = {
            fields: {},
            files: {},
        };
        this.isDataFetched = false;
        this._errors = [];
        this._filePromises = [];
        (_a = this.config).options || (_a.options = {});
        this.config.uploadDir = utils_1.fs.isDir(this.config.uploadDir) ? this.config.uploadDir : require('os').tmpdir();
    }
    get uploadDir() {
        return this.config.uploadDir;
    }
    get form() {
        return this.client(Object.assign(Object.assign({}, this.config.options || {}), { headers: this.http.request.headers }));
    }
    get ready() {
        return !!this.isDataFetched;
    }
    get hasError() {
        return this._errors.length >= 1;
    }
    get errors() {
        return this._errors.slice();
    }
    stat(field) {
        return this._stat.fields[field] || this._stat.files[field];
    }
    fetchFormData(filter = {}) {
        const form = this.form;
        this._filePromises = [];
        return new Promise((resolve, reject) => {
            if (this.isDataFetched) {
                resolve(this);
                return;
            }
            form.on('field', (name, value, info) => {
                this._onFieldUpload(name, value, info, filter === null || filter === void 0 ? void 0 : filter.field);
            });
            form.on('file', (name, file, info) => {
                this._onFileUpload(name, file, info, filter === null || filter === void 0 ? void 0 : filter.file);
            });
            form.on('close', () => {
                this.isDataFetched = true;
                Promise.all(this._filePromises).then(() => {
                    resolve(this);
                    this._filePromises = [];
                });
            });
            form.on('error', (error) => {
                this._errors.push({ error });
                reject(error);
            });
            this.http.request.pipe(form);
        });
    }
    _onFieldUpload(field, value, info, filter) {
        if (false === (filter === null || filter === void 0 ? void 0 : filter(field, value, info)))
            return;
        if (field in this.fields) {
            Array.isArray(this.fields[field]) || (this.fields[field] = [this.fields[field]]);
            Array.isArray(this._stat[field]) || (this._stat[field] = [this._stat[field]]);
            this.fields[field].push(value);
            this._stat[field].push(info);
            return;
        }
        this.fields[field] = value;
        this._stat.fields[field] = info;
    }
    _onFileUpload(field, file, info, filter) {
        var _a, _b;
        if (info.filename === undefined)
            return;
        (_a = this.files)[field] || (_a[field] = []);
        (_b = this._stat.files)[field] || (_b[field] = []);
        if (false === (filter === null || filter === void 0 ? void 0 : filter(field, info)))
            return;
        let resolver = null;
        let error = null;
        this._filePromises.push(new Promise(res => resolver = res));
        const path = utils_1.fs.join(this.uploadDir, utils_1.$.random.hex());
        const writeStream = utils_1.fs.system.createWriteStream(path);
        writeStream.on('close', () => {
            if (error) {
                this._errors.push({ field, error });
                resolver();
                return;
            }
            info.path = path;
            this.files[field].push(path);
            this._stat.files[field].push(info);
            resolver();
        });
        writeStream.on('error', (err) => error = err);
        file.pipe(writeStream);
    }
}
exports.HttpFormData = HttpFormData;
class HttpClient {
    static getResponseIsSent(response) {
        return response.headersSent || response.writableEnded || response.writableFinished;
    }
    static setCorsHeaders(response, headers) {
        headers = Object.assign(Object.assign({}, HttpClient.corsHeaders), headers || {});
        Object.entries(headers).forEach(([header, value]) => {
            response.getHeader(header) || response.setHeader(header, value);
        });
    }
    static mimeTypes(assign) {
        return assign ? Object.assign(Object.assign({}, http_1.HTTP_CONTENT_MIME_TYPES), assign) : http_1.HTTP_CONTENT_MIME_TYPES;
    }
    static getHttpResponseData(http, assignData) {
        http.responseData || (http.responseData = {});
        (assignData === null || assignData === void 0 ? void 0 : assignData.content) && (http.responseData.content = assignData === null || assignData === void 0 ? void 0 : assignData.content);
        http.responseData.status = (assignData === null || assignData === void 0 ? void 0 : assignData.status)
            || http.responseData.status || http.response.statusCode || http_1.HTTP_STATUS.OK;
        http.responseData.contentType = (assignData === null || assignData === void 0 ? void 0 : assignData.contentType)
            || http.responseData.contentType || http.response.getHeader('content-type');
        HttpClient.getHttpResponseDataContent(http.responseData);
        return http.responseData;
    }
    static getHttpResponseDataContent(data) {
        data.content || (data.content = { json: '' });
        const contentEntry = Object.keys(data.content)[0];
        contentEntry === 'json'
            && data.content[contentEntry]
            && typeof data.content[contentEntry] === 'object'
            && (data.content[contentEntry] = JSON.stringify(data.content[contentEntry]));
        data.contentType || (data.contentType = HttpClient.getDefaultContentType(contentEntry));
        return data.content[contentEntry];
    }
    static getDefaultContentType(entry, mimeTypes = {}, defaultMimeType = exports.JSON_CONTENT_TYPE) {
        return mimeTypes[entry] || http_1.HTTP_CONTENT_MIME_TYPES[entry] || defaultMimeType;
    }
    static getStatusCodeMessage(status) {
        for (const [key, value] of Object.entries(http_1.HTTP_STATUS)) {
            if (status === value)
                return key;
        }
        return '';
    }
    static getDataFromStatusCode(http, statusOnNone) {
        var _a, _b, _c, _d;
        http.responseData || (http.responseData = {});
        const status = (_b = (_a = http.responseData.status) !== null && _a !== void 0 ? _a : statusOnNone) !== null && _b !== void 0 ? _b : http.response.statusCode;
        const contentType = (_d = (_c = http.responseData.contentType) !== null && _c !== void 0 ? _c : http.response.getHeader('content-type')) !== null && _d !== void 0 ? _d : exports.JSON_CONTENT_TYPE;
        const content = HttpClient.getStatusCodeMessage(status);
        return { status, contentType, content };
    }
    static parseURL(url) {
        const entries = url.split('?');
        url = entries[0];
        entries.shift();
        const queryString = entries.length ? entries.join('?') : '';
        return {
            url,
            queryString,
            query: queryString ? HttpClient.parseURLQuery(queryString) : {},
        };
    }
    static parseURLQuery(query) {
        return querystring.parse(query);
    }
    static fetchHostData(httpHost) {
        const { port, protocol, host, hostname } = require('url').parse(HttpClient.getURI(httpHost));
        return Object.assign(Object.assign({}, httpHost), { port, protocol, host, hostname });
    }
    static getURI(data) {
        return `${data.protocol.replace(':', '')}://${data.host.replace(':' + data.port, '')}` + (data.port ? ':' + data.port : '');
    }
    static sendJSON(response, body, status = http_1.HTTP_STATUS.OK) {
        response.writeHead(status, { 'Content-Type': exports.JSON_CONTENT_TYPE });
        response.end(JSON.stringify(body));
    }
    static throwBadRequest(message = '') {
        throw new exception_1.HttpException(message || 'The current HTTP method receives no response from the request method.', {
            status: http_1.HTTP_STATUS.BAD_REQUEST
        });
    }
    static throwNoContent(message = '') {
        throw new exception_1.HttpException(message || 'The current HTTP request receives no content from the response.', {
            status: http_1.HTTP_STATUS.NO_CONTENT
        });
    }
}
exports.HttpClient = HttpClient;
HttpClient.corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Request-Method': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, GET',
    'Access-Control-Allow-Headers': '*',
};
//# sourceMappingURL=http_client.js.map