import {fs, $} from "../utils";
import {Http2ServerRequest, Http2ServerResponse} from "http2";
import {
    HttpResponseData,
    HttpURL,
    HttpHost,
    HttpContentExtensions,
    HttpMimeTypes,
    BaseHttpResponseInterface,
    HttpClientConfigInterface,
    BaseHttpResponseHandlerInterface,
    HttpResponseDataInterface,
    HTTP_STATUS_CODES,
    HTTP_CONTENT_MIME_TYPES
} from "../interfaces/http";
import {JSONObjectInterface} from "../interfaces/object";
import {RuntimeException} from "./exception";

export const DEFAULT_FILE_MIME_TYPE = 'application/octet-stream'
export const DEFAULT_CONTENT_TYPE = 'application/json'

export class HttpClient implements BaseHttpResponseHandlerInterface {

    protected _dataURL: HttpURL

    protected _host: HttpHost

    responseData: HttpResponseData

    exceptionMessage: string

    exceptionData: any

    get responseIsSent(): boolean {

        return this.response.writableEnded || this.response.writableFinished
    }

    constructor(
        readonly request: Http2ServerRequest,
        readonly response: Http2ServerResponse,
        readonly config: HttpClientConfigInterface = {}) {

        this.config = {
            ...config,
            mimeTypes: {...HTTP_CONTENT_MIME_TYPES, ...config.mimeTypes ?? {}},
            fileMimeType: config.fileMimeType || DEFAULT_FILE_MIME_TYPE
        }
    }

    get parseURL(): HttpURL {
        return this._dataURL ||= HttpClient.getParsedURL(
            this._host
                ? HttpClient.getURI(this._host) + '/' + $.trimPath(this.request.url)
                : this.request.url
        )
    }

    set host(data: HttpHost) {
        this._host = data
    }

    send(data: JSONObjectInterface | string, status: number = HTTP_STATUS_CODES.OK, contentType?: string) {
        this.setResponseData({
            status,
            contentType: contentType || HttpClient.getDefaultContentType('json', this.config.mimeTypes),
            content: {json: data}
        })
    }

    sendText(data: string, status: number = HTTP_STATUS_CODES.OK, contentType?: string) {
        this.setResponseData({
            status,
            contentType: contentType || HttpClient.getDefaultContentType('text', this.config.mimeTypes, 'text/plain'),
            content: {text: data}
        })
    }

    sendHtml(content: string, status: number = HTTP_STATUS_CODES.OK, contentType?: string) {
        this.setResponseData({
            status,
            contentType: contentType || HttpClient.getDefaultContentType('html', this.config.mimeTypes, 'text/html'),
            content: {html: content}
        })
    }

    sendFile(filePath: string, contentType?: string) {

        fs.system.readFile(filePath, (err, buffer) => {

            if (err) {
                this.exceptionMessage = `Could not read data from file ${filePath}.`
                this.exceptionData = err
                throw new RuntimeException(this)
            }

            const ext = $.trim(fs.parseFile(filePath).ext ?? '', '.')

            contentType ||= HttpClient.getDefaultContentType(ext, this.config.mimeTypes, DEFAULT_FILE_MIME_TYPE)

            this.setResponseData({content: {buffer}, contentType})
        })
    }

    setResponseData(data: HttpResponseData) {
        this.responseData = data
    }

    getHttpResponse(assignResponseData?: HttpResponseData): BaseHttpResponseInterface {
        return {
            response: this.response,
            request: this.request,
            responseData: HttpClient.getHttpResponseData(this, assignResponseData),
            exceptionData: this.exceptionData,
            exceptionMessage: this.exceptionMessage,
        }
    }

    static getHttpResponseData(http: BaseHttpResponseInterface, assignData?: HttpResponseData): HttpResponseData {

        http.responseData ||= {}

        assignData?.content && (http.responseData.content = assignData?.content)

        http.responseData.status = assignData?.status
            ?? http.responseData.status ?? http.response.statusCode ?? HTTP_STATUS_CODES.OK

        http.responseData.contentType = assignData?.contentType
            ?? http.responseData.contentType ?? http.response.getHeader('content-type')

        HttpClient.getHttpResponseDataContent(http.responseData)

        return http.responseData
    }

    static getHttpResponseDataContent(data: HttpResponseData) {

        data.content ||= {json: ''}

        const contentEntry = Object.keys(data.content)[0]

        contentEntry === 'json'
        && data.content[contentEntry] instanceof Object
        && (data.content[contentEntry] = JSON.stringify(data.content[contentEntry]))

        data.contentType ||= HttpClient.getDefaultContentType(contentEntry)

        return data.content[contentEntry]
    }

    static getDefaultContentType(
        entry: HttpContentExtensions | 'buffer',
        mimeTypes: HttpMimeTypes = {},
        defaultMimeType: string = DEFAULT_CONTENT_TYPE) {

        const contentTypes = {buffer: DEFAULT_FILE_MIME_TYPE, ...HTTP_CONTENT_MIME_TYPES, ...mimeTypes}
        return contentTypes[entry] ?? defaultMimeType
    }

    static getStatusCodeMessage(status: number): string {
        for (const [key, value] of Object.entries(HTTP_STATUS_CODES)) {
            if (status === value) return key
        }
        return ''
    }

    static getDataFromStatusCode(http: BaseHttpResponseInterface, setStatusIfNone?: number): HttpResponseDataInterface {

        http.responseData ||= {}

        const status = http.responseData.status ?? setStatusIfNone ?? http.response.statusCode
        const contentType = http.responseData.contentType ?? http.response.getHeader('content-type') ?? DEFAULT_CONTENT_TYPE
        const content = HttpClient.getStatusCodeMessage(status)

        return {status, contentType, content}
    }

    static getParsedURL(url: string): HttpURL {

        return require('url').parse(url, true)
    }

    static fetchHostData(data: HttpHost): HttpHost {

        const {port, protocol, host, hostname} = HttpClient.getParsedURL(HttpClient.getURI(data))

        return {port, protocol, host, hostname}
    }

    static getURI(data: HttpHost) {

        return `${$.trim(data.protocol, ':')}://${$.trim(data.host, ':' + data.port)}` + (data.port ? ':' + data.port : '')
    }
}
