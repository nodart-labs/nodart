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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionLog = exports.RuntimeExceptionHandler = exports.HttpExceptionHandler = exports.ExceptionHandler = exports.RuntimeException = exports.HttpException = exports.Exception = void 0;
const http_1 = require("../interfaces/http");
const http_client_1 = require("./http_client");
const utils_1 = require("../utils");
class Exception {
    constructor(exception) {
        this._exception = {
            exceptionMessage: '',
            exceptionData: undefined
        };
        typeof exception === 'string'
            ? this._exception = { exceptionMessage: exception, exceptionData: undefined }
            : this.exception = exception;
    }
    get exception() {
        return this._exception;
    }
    set exception(exception) {
        this._exception = this._onSetException(exception);
    }
}
exports.Exception = Exception;
class HttpException extends Exception {
    constructor(exception) {
        super(exception);
        this.errorStatusCode = http_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;
    }
    _onSetException(http) {
        var _a;
        (_a = http.responseData).status || (_a.status = this.errorStatusCode);
        return http;
    }
}
exports.HttpException = HttpException;
class RuntimeException extends Exception {
    _onSetException(exception) {
        return exception;
    }
}
exports.RuntimeException = RuntimeException;
class ExceptionHandler {
    constructor(_exception) {
        this._exception = _exception;
    }
    get exceptionData() {
        return this._exception.exception;
    }
    get exception() {
        return this._exception;
    }
}
exports.ExceptionHandler = ExceptionHandler;
class HttpExceptionHandler extends ExceptionHandler {
    constructor(exception) {
        super(exception);
    }
    resolve() {
        return __awaiter(this, void 0, void 0, function* () {
            const http = this.exceptionData;
            const response = http_client_1.HttpClient.getHttpResponseData(http);
            const content = http_client_1.HttpClient.getHttpResponseDataContent(response);
            http.exceptionMessage || (http.exceptionMessage = http_client_1.HttpClient.getStatusCodeMessage(response.status));
            http.response.writeHead(response.status, { 'Content-Type': response.contentType });
            http.response.end(content || http.exceptionMessage);
        });
    }
}
exports.HttpExceptionHandler = HttpExceptionHandler;
class RuntimeExceptionHandler extends ExceptionHandler {
    constructor(exception) {
        super(exception);
    }
    resolve() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.RuntimeExceptionHandler = RuntimeExceptionHandler;
class ExceptionLog {
    constructor(source) {
        this.source = source;
        this.dumpData = {
            query: '',
            error: undefined
        };
    }
    get exception() {
        var _a;
        const isException = this.source instanceof Exception || this.source instanceof ExceptionHandler;
        const exception = this.source instanceof Exception
            ? this.source.exception
            : this.source instanceof ExceptionHandler ? this.source.exceptionData : {};
        const exceptionMessage = typeof this.source === 'string' ? this.source : (_a = exception.exceptionMessage) !== null && _a !== void 0 ? _a : '';
        const exceptionData = isException ? exception.exceptionData : this.source;
        return Object.assign(Object.assign({}, exception), { exceptionMessage, exceptionData });
    }
    getHttpResponseData(req, res) {
        if (this.httpResponseData)
            return this.httpResponseData;
        const exception = this.exception;
        this.http = (this.source instanceof HttpExceptionHandler || this.source instanceof HttpException
            ? exception : new http_client_1.HttpClient(req, res));
        this.http.exceptionMessage = exception.exceptionMessage;
        this.http.exceptionData = exception.exceptionData;
        return this.httpResponseData = http_client_1.HttpClient.getDataFromStatusCode(this.http, http_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
    onHttp(req, res) {
        var _a, _b;
        const responseData = this.getHttpResponseData(req, res);
        this.dumpData.query = 'HTTP ' + this.http.request.method.toUpperCase()
            + ' : ' + this.http.request.url
            + ' : ' + responseData.status
            + ' : ' + responseData.content;
        this.dumpData.error = this.http.exceptionMessage === ((_a = this.http.exceptionData) === null || _a === void 0 ? void 0 : _a.toString())
            ? this.http.exceptionMessage
            : (_b = this.http.exceptionData) !== null && _b !== void 0 ? _b : this.http.exceptionMessage;
        return this;
    }
    dump() {
        if (!this.dumpData.query && !this.dumpData.error)
            return;
        console.error(utils_1.$.date.currentDateTime() + ':', this.dumpData.query);
        this.dumpData.error && console.error(this.dumpData.error);
    }
}
exports.ExceptionLog = ExceptionLog;
//# sourceMappingURL=exception.js.map