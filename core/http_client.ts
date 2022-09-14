import {fs, $} from "../utils";
import {Http2ServerRequest, Http2ServerResponse} from "http2";
import {
    HttpResponseData,
    HttpURL,
    BaseHttpResponseInterface,
    HttpClientConfigInterface,
    BaseHttpResponseHandlerInterface, HttpResponseStatusCodeData
} from "../interfaces/http";
import {JSONObjectInterface} from "../interfaces/object";
import {RuntimeException} from "./exception";
import {HTTP_STATUS_CODES, HTTP_CONTENT_MIME_TYPES} from "../interfaces/http";

export const DEFAULT_FILE_MIME_TYPE = 'application/octet-stream'

export class HttpClient implements BaseHttpResponseHandlerInterface {

    protected _dataURL: HttpURL

    responseData: HttpResponseData

    exceptionMessage: string

    exceptionData: any

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
        return this._dataURL ||= HttpClient.getParsedURL(this.request.url)
    }

    send(data: JSONObjectInterface | string, status: number = HTTP_STATUS_CODES.OK, contentType?: string) {
        this.setResponseData({
            status,
            contentType: contentType || this.config.mimeTypes.json,
            content: {json: data}
        })
    }

    sendText(data: string, status: number = HTTP_STATUS_CODES.OK, contentType?: string) {
        this.setResponseData({
            status,
            contentType: contentType || this.config.mimeTypes.text,
            content: {text: data}
        })
    }

    sendHtml(content: string, status: number = HTTP_STATUS_CODES.OK, contentType?: string) {
        this.setResponseData({
            status,
            contentType: contentType || this.config.mimeTypes.html,
            content: {html: content}
        })
    }

    sendFile(filePath: string, contentType?: string) {
        fs.system.readFile(filePath, (err, buffer) => {
            if (err) {
                this.exceptionMessage = 'Could not read data from file.'
                this.exceptionData = err
                throw new RuntimeException(this)
            }
            contentType ||= (this.config.mimeTypes[$.trim(fs.parseFile(filePath).ext ?? '', '.')] ?? DEFAULT_FILE_MIME_TYPE)

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

    static getParsedURL(url: string): HttpURL {
        return require('url').parse(url, true)
    }

    static getHttpResponseData(http: BaseHttpResponseInterface, assignData?: HttpResponseData): HttpResponseData {

        http.responseData ||= {}

        assignData?.content && (http.responseData.content = assignData?.content)

        http.responseData.status = assignData?.status ?? http.responseData.status ?? http.response.statusCode ?? HTTP_STATUS_CODES.OK
        http.responseData.contentType = assignData?.contentType ?? http.responseData.contentType ?? http.response.getHeader('content-type')

        HttpClient.getHttpResponseDataContent(http.responseData)

        return http.responseData
    }

    static getHttpResponseDataContent(data: HttpResponseData) {

        data.content ||= {json: ''}
        const contentEntry = Object.keys(data.content)[0]

        contentEntry === 'json'
        && data.content[contentEntry] instanceof Object
        && (data.content[contentEntry] = JSON.stringify(data.content[contentEntry]))

        if (!data.contentType) {
            switch (contentEntry) {
                case 'json':
                    data.contentType = 'application/json'
                    break
                case 'text':
                    data.contentType = 'text/plain'
                    break
                case 'html':
                    data.contentType = 'text/html'
                    break
                case 'buffer':
                    data.contentType = DEFAULT_FILE_MIME_TYPE
                    break
            }
        }

        return data.content[contentEntry]
    }

    static getStatusCodeMessage(status: number): string {
        for (const [key, value] of Object.entries(HTTP_STATUS_CODES)) {
            if (status === value) return key
        }
        return ''
    }

    static getDataFromStatusCode(http: BaseHttpResponseInterface, setStatusIfNone?: number): HttpResponseStatusCodeData {
        http.responseData ||= {}

        const status = http.responseData.status ?? setStatusIfNone ?? http.response.statusCode
        const contentType = http.responseData.contentType ?? http.response.getHeader('content-type') ?? 'application/json'
        const content = HttpClient.getStatusCodeMessage(status)

        return {status, contentType, content}
    }
}
