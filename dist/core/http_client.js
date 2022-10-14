"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpFormData = exports.HttpClient = exports.MULTIPART_FORM_DATA_TYPE = exports.DEFAULT_CONTENT_TYPE = exports.DEFAULT_FILE_MIME_TYPE = void 0;
const utils_1 = require("../utils");
const http_1 = require("../interfaces/http");
exports.DEFAULT_FILE_MIME_TYPE = 'application/octet-stream';
exports.DEFAULT_CONTENT_TYPE = 'application/json';
exports.MULTIPART_FORM_DATA_TYPE = 'multipart/form-data';
class HttpClient {
    constructor(request, response, config = {}) {
        var _a;
        this.request = request;
        this.response = response;
        this.config = config;
        this.corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Request-Method': '*',
            'Access-Control-Allow-Methods': 'OPTIONS, GET',
            'Access-Control-Allow-Headers': '*',
        };
        this._data = {};
        this.isDataFetched = false;
        this.config = Object.assign(Object.assign({}, config), { mimeTypes: Object.assign(Object.assign({}, http_1.HTTP_CONTENT_MIME_TYPES), (_a = config.mimeTypes) !== null && _a !== void 0 ? _a : {}), fileMimeType: config.fileMimeType || exports.DEFAULT_FILE_MIME_TYPE });
    }
    set host(data) {
        this._host = data;
    }
    get data() {
        return Object.assign({}, this._data);
    }
    get ready() {
        return !!this.isDataFetched;
    }
    get buffer() {
        return this._buffer;
    }
    get form() {
        return (this._form || (this._form = new HttpFormData(this)));
    }
    set form(formDataHandler) {
        this._form = formDataHandler;
    }
    get isFormData() {
        var _a;
        return (_a = this.request.headers['content-type']) === null || _a === void 0 ? void 0 : _a.includes(exports.MULTIPART_FORM_DATA_TYPE);
    }
    get hasError() {
        return !!(this.exceptionMessage || this.exceptionData || this.form.hasError);
    }
    get responseIsSent() {
        return this.response.headersSent || this.response.writableEnded || this.response.writableFinished;
    }
    get parseURL() {
        return this._dataURL || (this._dataURL = HttpClient.getParsedURL(this._host
            ? HttpClient.getURI(this._host) + '/' + utils_1.$.trimPath(this.request.url)
            : this.request.url));
    }
    setCorsHeaders(headers) {
        headers = Object.assign(Object.assign({}, this.corsHeaders), headers !== null && headers !== void 0 ? headers : {});
        Object.entries(headers).forEach(([header, value]) => {
            this.response.getHeader(header) || this.response.setHeader(header, value);
        });
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
                this._buffer = Buffer.concat(chunks);
                this._data = {};
                const data = this._buffer.toString();
                const readQuery = (data) => {
                    try {
                        for (const [key, value] of new URLSearchParams(data).entries())
                            this._data[key] = value;
                    }
                    catch (err) {
                        reject(err);
                        this.handleError(err, 'Failed to fetch data from request');
                    }
                };
                try {
                    data.startsWith('{') || data.startsWith('[')
                        ? this._data = JSON.parse(data)
                        : readQuery(data);
                }
                catch (e) {
                    readQuery(data);
                }
                this.isDataFetched = true;
                resolve(this._data);
            });
            this.request.on('error', (err) => {
                reject(err);
                this.handleError(err, 'Failed to fetch data from request');
                this.onError();
            });
            this.request.on('aborted', () => {
                reject({ message: 'request aborted' });
                this.handleError();
            });
        });
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
        const stat = utils_1.fs.stat(filePath);
        const parse = utils_1.fs.parseFile(filePath);
        this.responseIsSent || this.response.writeHead(http_1.HTTP_STATUS_CODES.OK, {
            'Content-Type': contentType || HttpClient.getDefaultContentType(utils_1.$.trim(parse.ext, '.'), this.config.mimeTypes, exports.DEFAULT_FILE_MIME_TYPE),
            'Content-Length': stat.size
        });
        const readStream = utils_1.fs.system.createReadStream(filePath);
        readStream.on('error', err => {
            this.handleError(err, `Could not read data from file ${filePath}.`);
            this.onError();
        });
        readStream.pipe(this.response);
    }
    onError() {
    }
    handleError(err, message) {
        this._data = {};
        this._buffer = undefined;
        if (err) {
            this.exceptionMessage = message !== null && message !== void 0 ? message : err === null || err === void 0 ? void 0 : err.message;
            this.exceptionData = err;
        }
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
class HttpFormData {
    constructor(http, config = { options: {} }) {
        var _a;
        var _b;
        this.http = http;
        this.config = config;
        this.client = require('busboy');
        this._fields = {};
        this._files = {};
        this._stat = {
            fields: {},
            files: {},
        };
        this.isDataFetched = false;
        this._errors = [];
        (_a = (_b = this.config).options) !== null && _a !== void 0 ? _a : (_b.options = {});
    }
    get uploadDir() {
        return utils_1.fs.isDir(this.config.uploadDir) ? this.config.uploadDir : require('os').tmpdir();
    }
    get form() {
        var _a;
        return this.client(Object.assign(Object.assign({}, (_a = this.config.options) !== null && _a !== void 0 ? _a : {}), { headers: this.http.request.headers }));
    }
    get ready() {
        return !!this.isDataFetched;
    }
    get fields() {
        return Object.assign({}, this._fields);
    }
    get files() {
        return Object.assign({}, this._files);
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
    fetchFormData(onFile) {
        const form = this.form;
        const uploadDir = this.uploadDir;
        return new Promise((resolve, reject) => {
            if (this.isDataFetched) {
                resolve(this);
                return;
            }
            const promises = [];
            form.on('file', (name, file, info) => {
                var _a, _b;
                let resolver = null;
                let error = null;
                promises.push(new Promise(res => resolver = res));
                const hash = utils_1.$.random.hex();
                const path = utils_1.fs.path(uploadDir, hash);
                const writeStream = utils_1.fs.system.createWriteStream(path);
                (_a = this._files)[name] || (_a[name] = []);
                (_b = this._stat.files)[name] || (_b[name] = []);
                writeStream.on('close', () => {
                    if (error) {
                        this._errors.push({ field: name, error });
                    }
                    else {
                        info.path = path;
                        this._files[name].push(path);
                        this._stat.files[name].push(info);
                    }
                    resolver();
                });
                writeStream.on('error', (err) => error = err);
                file.pipe(writeStream);
            });
            form.on('field', (name, value, info) => {
                this._fields[name] = value;
                this._stat.fields[name] = info;
            });
            form.on('close', () => {
                this.isDataFetched = true;
                Promise.all(promises).then(() => resolve(this));
            });
            form.on('error', (error) => {
                this._errors.push({ error });
                reject(error);
            });
            this.http.request.pipe(form);
        });
    }
}
exports.HttpFormData = HttpFormData;
//# sourceMappingURL=http_client.js.map