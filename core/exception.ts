import {BaseExceptionHandlerInterface, BaseExceptionInterface} from "../interfaces/exception";
import {BaseHttpResponseInterface, HTTP_STATUS_CODES, HttpResponseStatusCodeData} from "../interfaces/http";
import {HttpClient} from "./http_client";
import {Http2ServerRequest, Http2ServerResponse} from "http2";
import {$} from "../utils"

export abstract class Exception {

    private _exception: BaseExceptionInterface = {
        exceptionMessage: '',
        exceptionData: undefined
    }

    constructor(exception: string | BaseExceptionInterface) {

        typeof exception === 'string'

            ? this._exception = {exceptionMessage: exception, exceptionData: undefined}

            : this.exception = exception
    }

    get exception(): BaseExceptionInterface {

        return this._exception
    }

    set exception(exception: BaseExceptionInterface) {

        this._exception = this._onSetException(exception)
    }

    protected abstract _onSetException(exception: BaseExceptionInterface): BaseExceptionInterface
}

export class HttpException extends Exception {

    private errorStatusCode = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR

    constructor(exception: BaseHttpResponseInterface) {
        super(exception)
    }

    protected _onSetException(http: BaseHttpResponseInterface) {
        http.responseData.status ||= this.errorStatusCode
        return http
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

        const http = this.exceptionData as BaseHttpResponseInterface

        const response = HttpClient.getHttpResponseData(http)

        const content = HttpClient.getHttpResponseDataContent(response)

        http.exceptionMessage ||= HttpClient.getStatusCodeMessage(response.status)

        http.response.writeHead(response.status, {'Content-Type': response.contentType})

        http.response.end(content || http.exceptionMessage)
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

    httpResponseData: HttpResponseStatusCodeData

    constructor(readonly source: ExceptionHandler | Exception | any) {
    }

    get exception(): BaseExceptionInterface {

        const isException = this.source instanceof Exception || this.source instanceof ExceptionHandler
        const exception = this.source instanceof Exception
            ? this.source.exception
            : this.source instanceof ExceptionHandler ? this.source.exceptionData : {} as BaseExceptionInterface

        const exceptionMessage = typeof this.source === 'string' ? this.source : exception.exceptionMessage ?? ''
        const exceptionData = isException ? exception.exceptionData : this.source

        return {...exception, ...{exceptionMessage, exceptionData}}
    }

    getHttpResponseData(req: Http2ServerRequest, res: Http2ServerResponse) {

        if (this.httpResponseData) return this.httpResponseData

        const exception = this.exception

        this.http = (this.source instanceof HttpExceptionHandler || this.source instanceof HttpException

            ? exception : new HttpClient(req, res)) as BaseHttpResponseInterface

        this.http.exceptionMessage = exception.exceptionMessage

        this.http.exceptionData = exception.exceptionData

        return this.httpResponseData = HttpClient.getDataFromStatusCode(this.http, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
    }

    onHttp(req: Http2ServerRequest, res: Http2ServerResponse) {

        const responseData = this.getHttpResponseData(req, res)

        this.dumpData.query = 'HTTP ' + this.http.request.method.toUpperCase()
            + ' : ' + this.http.request.url
            + ' : ' + responseData.status
            + ' : ' + responseData.content

        this.dumpData.error = this.http.exceptionMessage === this.http.exceptionData?.toString()
            ? this.http.exceptionMessage
            : this.http.exceptionData ?? this.http.exceptionMessage

        return this
    }

    dump() {

        if (!this.dumpData.query && !this.dumpData.error) return

        console.error($.date.currentDateTime() + ':', this.dumpData.query)

        this.dumpData.error && console.error(this.dumpData.error)
    }

}
