import {BaseExceptionHandlerInterface, BaseExceptionInterface} from "../interfaces/exception";
import {BaseHttpResponseInterface, HTTP_STATUS_CODES, HttpResponseDataInterface} from "../interfaces/http";
import {HttpClient} from "./http_client";
import {Http2ServerRequest, Http2ServerResponse} from "http2";
import {$} from "../utils"
import {JSONObjectInterface} from "../interfaces/object";

export abstract class Exception {

    protected _exception: BaseExceptionInterface = {
        exceptionMessage: '',
        exceptionData: undefined
    }

    constructor(exception: string | JSONObjectInterface | BaseExceptionInterface, protected _assign?: any) {

        if (exception instanceof Object && !exception.hasOwnProperty('exceptionMessage'))

            exception = JSON.stringify(exception)

        this.exception = typeof exception === 'string'

            ? {exceptionMessage: exception, exceptionData: undefined}

            : exception as BaseExceptionInterface
    }

    get exception(): BaseExceptionInterface {

        return this._exception
    }

    set exception(exception: BaseExceptionInterface) {

        Object.assign(this._exception, this._onSetException(exception))
    }

    protected abstract _onSetException(exception: BaseExceptionInterface): BaseExceptionInterface
}

export class HttpException extends Exception {

    constructor(
        exception: string | JSONObjectInterface | BaseHttpResponseInterface,
        assign?: { status?: number, contentType?: string }) {

        super(exception, assign)
    }

    protected _onSetException(exception: BaseHttpResponseInterface) {
        exception.responseData ||= {}

        this._assign?.status && (exception.responseData.status = this._assign.status)
        this._assign?.contentType && (exception.responseData.contentType = this._assign.contentType)

        exception.responseData.status ||= HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
        return exception
    }
}

export class RuntimeException extends Exception {

    protected _onSetException(exception) {
        return exception
    }
}

export abstract class ExceptionHandler implements BaseExceptionHandlerInterface {

    protected constructor(protected _exception: Exception) {
    }

    get exceptionData(): BaseExceptionInterface {

        return this._exception.exception
    }

    get exception(): Exception {

        return this._exception
    }

    abstract resolve(): PromiseLike<any>
}

export class HttpExceptionHandler extends ExceptionHandler {

    constructor(exception: HttpException) {
        super(exception)
    }

    async resolve() {
    }

}

export class RuntimeExceptionHandler extends ExceptionHandler {

    constructor(exception: RuntimeException) {
        super(exception)
    }

    async resolve() {
    }
}

export class ExceptionLog {

    private dumpData: { query: string, error: any } = {
        query: '',
        error: undefined
    }

    http: BaseHttpResponseInterface

    constructor(readonly source: any) {
    }

    get exception(): BaseExceptionInterface {

        const isException = this.source instanceof Exception || this.source instanceof ExceptionHandler
        const exception = isException ? (this.source.exceptionData ?? this.source.exception) : {} as BaseExceptionInterface
        const exceptionMessage = typeof this.source === 'string'
            ? this.source
            : this.source instanceof Object ? exception.exceptionMessage ?? '' : ''
        const exceptionData = isException ? exception.exceptionData : this.source

        return {...exception, ...{exceptionMessage, exceptionData}}
    }

    dump() {

        if (!this.dumpData.query && !this.dumpData.error) return

        console.error($.date.currentDateTime() + ':', this.dumpData.query)

        this.dumpData.error && console.error(this.dumpData.error)
    }

    onHttp(req: Http2ServerRequest, res: Http2ServerResponse) {

        const responseData = this.getHttpResponseData(req, res)

        this.dumpData.query = 'HTTP ' + this.http.request.method.toUpperCase()
            + ': ' + this.http.request.url
            + ': ' + responseData.status
            + ': ' + responseData.content

        this.dumpData.error = this.http.exceptionMessage === this.http.exceptionData?.toString()
            ? this.http.exceptionMessage
            : this.http.exceptionData

        return this
    }

    getHttpResponseData(req: Http2ServerRequest, res: Http2ServerResponse): HttpResponseDataInterface {

        const exception = this._getHttpException(req, res)

        if (this.source instanceof HttpExceptionHandler || this.source instanceof HttpException) {
            const data = HttpClient.getHttpResponseData(exception)
            const content = HttpClient.getHttpResponseDataContent(data)
            return {
                status: data.status,
                contentType: data.contentType,
                content: content || exception.exceptionMessage || HttpClient.getStatusCodeMessage(data.status)
            }
        }

        return HttpClient.getDataFromStatusCode(exception)
    }

    protected _getHttpException(req: Http2ServerRequest, res: Http2ServerResponse): BaseHttpResponseInterface {

        const exception = this.exception as BaseHttpResponseInterface

        exception.request ||= req
        exception.response ||= res

        this.http = (this.source instanceof HttpExceptionHandler || this.source instanceof HttpException
            ? exception
            : new HttpClient(req, res)) as BaseHttpResponseInterface

        this.http.exceptionMessage = exception.exceptionMessage
        this.http.exceptionData = exception.exceptionData || exception.exceptionMessage
        this.http.responseData ||= {}

        if (!this.http.responseData.status || this.http.responseData.status === HTTP_STATUS_CODES.OK) {
            this.http.responseData.status = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
        }

        return this.http
    }

}
