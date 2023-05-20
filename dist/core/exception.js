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
const http_1 = require("./interfaces/http");
const http_client_1 = require("./http_client");
class Exception {
    constructor(exception, _assign) {
        this._assign = _assign;
        this._exception = {
            exceptionMessage: "",
            exceptionData: undefined,
        };
        if (typeof exception === "object" &&
            !exception.hasOwnProperty("exceptionMessage"))
            exception = JSON.stringify(exception);
        this.exception =
            typeof exception === "string"
                ? { exceptionMessage: exception, exceptionData: undefined }
                : exception;
    }
    get exception() {
        return this._exception;
    }
    set exception(exception) {
        Object.assign(this._exception, this._onSetException(exception));
    }
}
exports.Exception = Exception;
class HttpException extends Exception {
    constructor(exception, assign) {
        super(exception, assign);
    }
    _onSetException(exception) {
        var _a, _b;
        var _c;
        exception.responseData || (exception.responseData = {});
        ((_a = this._assign) === null || _a === void 0 ? void 0 : _a.status) &&
            (exception.responseData.status = this._assign.status);
        ((_b = this._assign) === null || _b === void 0 ? void 0 : _b.contentType) &&
            (exception.responseData.contentType = this._assign.contentType);
        (_c = exception.responseData).status || (_c.status = http_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        return exception;
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
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.HttpExceptionHandler = HttpExceptionHandler;
class RuntimeExceptionHandler extends ExceptionHandler {
    constructor(exception) {
        super(exception);
    }
    resolve() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.RuntimeExceptionHandler = RuntimeExceptionHandler;
class ExceptionLog {
    constructor(source) {
        this.source = source;
        this._dumpData = {
            query: "",
            error: undefined,
        };
    }
    get exception() {
        var _a, _b;
        const isException = this.source instanceof Exception ||
            this.source instanceof ExceptionHandler;
        const exception = isException
            ? (_a = this.source.exceptionData) !== null && _a !== void 0 ? _a : this.source.exception
            : {};
        const exceptionMessage = typeof this.source === "string"
            ? this.source
            : typeof this.source === "object"
                ? (_b = exception.exceptionMessage) !== null && _b !== void 0 ? _b : ""
                : "";
        const exceptionData = isException ? exception.exceptionData : this.source;
        return Object.assign(Object.assign({}, exception), { exceptionMessage, exceptionData });
    }
    get dump() {
        if (!this.dumpData.query && !this.dumpData.error)
            return "";
        const error = this.dumpData.error
            ? require("node:util").format(this.dumpData.error)
            : "";
        return `${this.dumpData.query}\n${error}`;
    }
    get dumpData() {
        return this._dumpData;
    }
    onHttp(request, response) {
        var _a;
        const responseData = this.getHttpResponseData(request, response);
        this.dumpData.httpStatusCode = responseData.status;
        this.dumpData.query =
            "HTTP " +
                this.http.request.method.toUpperCase() +
                ": " +
                responseData.status +
                ": " +
                this.http.request.url +
                ": " +
                responseData.content;
        this.dumpData.error =
            this.http.exceptionMessage === ((_a = this.http.exceptionData) === null || _a === void 0 ? void 0 : _a.toString())
                ? this.http.exceptionMessage
                : this.http.exceptionData;
        return responseData;
    }
    getHttpResponseData(request, response) {
        const exception = this._getHttpException(request, response);
        if (this.source instanceof HttpExceptionHandler ||
            this.source instanceof HttpException) {
            const data = http_client_1.HttpClient.getHttpResponseData(exception);
            const content = http_client_1.HttpClient.getHttpResponseDataContent(data);
            return {
                status: data.status,
                contentType: data.contentType,
                content: content ||
                    exception.exceptionMessage ||
                    http_client_1.HttpClient.getStatusCodeMessage(data.status),
            };
        }
        return http_client_1.HttpClient.getDataFromStatusCode(exception);
    }
    _getHttpException(request, response) {
        var _a;
        const exception = this.exception;
        exception.request || (exception.request = request);
        exception.response || (exception.response = response);
        this.http =
            this.source instanceof HttpExceptionHandler ||
                this.source instanceof HttpException
                ? exception
                : { request, response };
        this.http.exceptionMessage = exception.exceptionMessage;
        this.http.exceptionData =
            exception.exceptionData || exception.exceptionMessage;
        (_a = this.http).responseData || (_a.responseData = {});
        if (!this.http.responseData.status ||
            this.http.responseData.status === http_1.HTTP_STATUS.OK) {
            this.http.responseData.status = http_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
        }
        return this.http;
    }
}
exports.ExceptionLog = ExceptionLog;
//# sourceMappingURL=exception.js.map