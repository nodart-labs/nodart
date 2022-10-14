import {Http2ServerRequest, Http2ServerResponse} from "http2";
import {BaseExceptionInterface} from "./exception";
import {JSONObjectInterface} from "./object";

export type HttpResponseDataContent =
    | { json: JSONObjectInterface | string }
    | { html: string }
    | { text: string }
    | { buffer: Buffer }

export type HttpResponseData = {
    status?: number,
    contentType?: string,
    content?: HttpResponseDataContent
}

export type HttpURL = {
    pathname: string
    protocol?: string
    slashes?: string
    auth?: string
    host?: string
    port?: number
    hostname?: string
    hash?: string
    search?: string
    query?: object
    path?: string
    href?: string
    [addon: string]: any
}

export type HttpHost = {
    protocol: string
    host: string
    port: number
    hostname?: string
}

export const HTTP_CONTENT_MIME_TYPES = Object.freeze({
    html: 'text/html',
    htm: 'text/html',
    text: 'text/plain; charset=utf-8',
    txt: 'text/plain; charset=utf-8',
    js: 'text/javascript',
    css: 'text/css',
    json: 'application/json',
    png: 'image/png',
    ico: 'image/vnd.microsoft.icon',
    jpg: 'image/jpg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    wav: 'audio/wav',
    mp3: 'audio/mpeg',
    aac: 'audio/aac',
    mp4: 'video/mp4',
    mpeg: 'video/mpeg',
    avi: 'video/x-msvideo',
    woff: 'application/font-woff',
    woff2: 'application/font-woff2',
    ttf: 'application/font-ttf',
    eot: 'application/vnd.ms-fontobject',
    otf: 'application/font-otf',
    wasm: 'application/wasm',
})

export type HttpContentExtensions =
    | 'html'
    | 'htm'
    | 'text'
    | 'txt'
    | 'js'
    | 'css'
    | 'json'
    | 'png'
    | 'ico'
    | 'jpg'
    | 'gif'
    | 'svg'
    | 'wav'
    | 'mp3'
    | 'aac'
    | 'mp4'
    | 'mpeg'
    | 'avi'
    | 'woff'
    | 'woff2'
    | 'ttf'
    | 'eot'
    | 'otf'
    | 'wasm'
    | string

export type HttpFileMimeType = 'application/octet-stream' | string

export type HttpMimeTypes = { [K in HttpContentExtensions]?: string }

export interface HttpClientConfigInterface {
    mimeTypes?: HttpMimeTypes
    fileMimeType?: HttpFileMimeType
}

export interface BaseHttpResponseInterface extends BaseExceptionInterface {
    request: Http2ServerRequest
    response: Http2ServerResponse
    responseData: HttpResponseData
}

export interface BaseHttpResponseHandlerInterface extends BaseHttpResponseInterface {
    setResponseData(data: HttpResponseData)

    getHttpResponse(assignData?: HttpResponseData): BaseHttpResponseInterface

    responseIsSent: boolean
}

export interface HttpResponseDataInterface {
    status: number
    contentType: string
    content: string
    request?: Http2ServerRequest
    response?: Http2ServerResponse
}

export interface HttpFormDataInterface {
    config: HttpFormDataConfigInterface
    fields: { [field: string]: any }
    files: { [field: string]: any }

    fetchFormData(...args: any): Promise<this>
}

export interface HttpFormDataConfigInterface {
    uploadDir?: string // OS system temp folder by default
    options?: unknown

    [addon: string]: any
}

export type HttpFormDataConfigExtended = HttpFormDataConfigInterface & { options: HttpFormDataOptions }

export type HttpFormDataOptions = {
    headers?: { [name: string]: string } // These are the HTTP headers of the incoming request, which are used by individual parsers.
    highWaterMark?: number // highWaterMark to use for the parser stream. Default: node's stream.Writable default.
    fileHwm?: number // highWaterMark to use for individual file streams. Default: node's stream.Readable default.
    defCharset?: string // Default character set to use when one isn't defined. Default: 'utf8'.
    defParamCharset?: string // For multipart forms, the default character set to use for values
    // of part header parameters (e.g. filename) that are not extended parameters
    // (that contain an explicit charset). Default: 'latin1'.
    preservePath?: boolean // If paths in filenames from file parts in a 'multipart/form-data' request shall be preserved. Default: false.
    limits?: {
        fieldNameSize?: number // Max field name size = 100 bytes
        fieldSize?: number // Max field value size (in bytes) = 1048576 (1MB)
        fields?: number // Max number of non-file fields = Infinity
        fileSize?: number // For multipart forms, the max file size (in bytes) = Infinity
        files?: number // For multipart forms, the max number of file fields = Infinity
        parts?: number // For multipart forms, the max number of parts (fields + files) = Infinity
        headerPairs?: number // For multipart forms, the max number of header key=>value pairs to parse = 2000
    }

    [addon: string]: any
}

export interface HttpAcceptorInterface {

    get(...args): any

    post(...args): any

    patch(...args): any

    put(...args): any

    delete(...args): any

    head(...args): any

    connect?: (...args) => any

    trace?: (...args) => any
}

export interface HttpResponderInterface {
    data(body: JSONObjectInterface | string, ...args: any): void

    view(template: string, assign?: object, ...args: any): void

    [addon: string]: any
}

export const HTTP_STATUS_CODES = Object.freeze({
    'CONTINUE': 100,
    'SWITCHING_PROTOCOLS': 101,
    'PROCESSING': 102,
    'EARLY_HINTS': 103,
    'OK': 200,
    'CREATED': 201,
    'ACCEPTED': 202,
    'NON-AUTHORITATIVE_INFORMATION': 203,
    'NO_CONTENT': 204,
    'RESET_CONTENT': 205,
    'PARTIAL_CONTENT': 206,
    'MULTI-STATUS': 207,
    'ALREADY_REPORTED': 208,
    'IM_USED': 226,
    'MULTIPLE_CHOICES': 300,
    'MOVED_PERMANENTLY': 301,
    'FOUND': 302, // Previously "Moved Temporarily"
    'SEE_OTHER': 303,
    'NOT_MODIFIED': 304,
    'USE_PROXY': 305,
    'SWITCH_PROXY': 306,
    'TEMPORARY_REDIRECT': 307,
    'PERMANENT_REDIRECT': 308,
    'BAD_REQUEST': 400,
    'UNAUTHORIZED': 401,
    'PAYMENT_REQUIRED': 402,
    'FORBIDDEN': 403,
    'NOT_FOUND': 404,
    'METHOD_NOT_ALLOWED': 405,
    'NOT_ACCEPTABLE': 406,
    'PROXY_AUTHENTICATION_REQUIRED': 407,
    'REQUEST_TIMEOUT': 408,
    'CONFLICT': 409,
    'GONE': 410,
    'LENGTH_REQUIRED': 411,
    'PRECONDITION_FAILED': 412,
    'PAYLOAD_TOO_LARGE': 413,
    'URI_TOO_LONG': 414,
    'UNSUPPORTED_MEDIA_TYPE': 415,
    'RANGE_NOT_SATISFIABLE': 416,
    'EXPECTATION_FAILED': 417,
    'MISDIRECTED_REQUEST': 421,
    'UNPROCESSABLE_ENTITY': 422,
    'LOCKED': 423,
    'FAILED_DEPENDENCY': 424,
    'TOO_EARLY': 425,
    'UPGRADE_REQUIRED': 426,
    'PRECONDITION_REQUIRED': 428,
    'TOO_MANY_REQUESTS': 429,
    'REQUEST_HEADER_FIELDS_TOO_LARGE': 431,
    'UNAVAILABLE_FOR_LEGAL_REASONS': 451,
    'INTERNAL_SERVER_ERROR': 500,
    'NOT_IMPLEMENTED': 501,
    'BAD_GATEWAY': 502,
    'SERVICE_UNAVAILABLE': 503,
    'GATEWAY_TIMEOUT': 504,
    'HTTP_VERSION_NOT_SUPPORTED': 505,
    'VARIANT_ALSO_NEGOTIATES': 506,
    'INSUFFICIENT_STORAGE': 507,
    'LOOP_DETECTED': 508,
    'NOT_EXTENDED': 510,
    'NETWORK_AUTHENTICATION_REQUIRED': 511,
})

