import {fs, $} from "../utils";
import {Http2ServerRequest, Http2ServerResponse} from "http2";
import {
    HttpResponseData,
    HttpURL,
    HttpHost,
    HttpMethod,
    HttpContentExtensions,
    HttpMimeTypes,
    HttpFormDataClientsFile,
    HttpFormDataClientsField,
    HttpFormDataClientsFieldFilter,
    HttpFormDataClientsFileFilter,
    HttpDataInterface,
    HttpContainerInterface,
    BaseHttpResponseInterface,
    HttpContainerConfigInterface,
    HttpFormDataClientConfigInterface,
    HttpResponseDataInterface,
    HttpFormDataInterface,
    HTTP_STATUS,
    HTTP_CONTENT_MIME_TYPES,
} from "./interfaces/http";
import {JSONLikeInterface, JSONObjectInterface} from "./interfaces/object";
import {Stream} from "stream";
import {HttpResponder} from "./http_responder";
import {Engine} from "./engine";
import {EngineClientConfigInterface} from "./interfaces/engine";
import {Session} from "./session";
import {SessionClientConfigInterface} from "./interfaces/session";
import {HttpException, RuntimeException} from "./exception";

export const FILE_CONTENT_TYPE = 'application/octet-stream'
export const JSON_CONTENT_TYPE = 'application/json; charset=utf-8'
export const TEXT_CONTENT_TYPE = 'text/plain; charset=utf-8'
export const HTML_CONTENT_TYPE = 'text/html'
export const FORM_CONTENT_TYPE = 'multipart/form-data'

export class HttpContainer implements HttpContainerInterface {

    private isDataFetched: boolean = false

    private _data: JSONLikeInterface = {}

    protected _form: HttpFormDataInterface

    protected _session: Session

    protected _responder: HttpResponder

    protected _method: HttpMethod

    exceptionData: any

    exceptionMessage: string = ""

    responseData: HttpResponseData

    constructor(readonly config: HttpContainerConfigInterface & HttpDataInterface) {

        this._method = config.request.method.toLowerCase() as HttpMethod
    }

    get url(): HttpURL {

        return this.config.url
    }

    get uri(): string {

        return HttpClient.getURI(this.config.host)
    }

    get method(): HttpMethod {

        return this._method
    }

    get host(): HttpHost {

        return this.config.host
    }

    get request(): Http2ServerRequest {

        return this.config.request
    }

    get response(): Http2ServerResponse {

        return this.config.response
    }

    get data(): JSONLikeInterface {

        return this._data
    }

    get ready(): boolean {

        return !!this.isDataFetched
    }

    get form(): HttpFormData {

        return (this._form ||= new HttpFormData(this, this.config.form)) as HttpFormData
    }

    set form(formDataHandler: HttpFormData) {

        this._form = formDataHandler
    }

    get isFormData(): boolean {

        return this.request.headers['content-type']?.includes(FORM_CONTENT_TYPE)
    }

    get hasError(): boolean {

        return !!(this.exceptionMessage || this.exceptionData || this.form.hasError)
    }

    get responseIsSent(): boolean {

        return HttpClient.getResponseIsSent(this.response)
    }

    get respond(): HttpResponder {

        if (this._responder) return this._responder

        const responder = this.config.responder || HttpResponder
        const engineConfig = this.config.engine?.config || {} as EngineClientConfigInterface
        const engine = this.config.engine?.client instanceof Function
            ? this.config.engine.client(engineConfig)
            : new Engine(engineConfig)

        return this._responder = Reflect.construct(responder, [this, engine])
    }

    get session(): Session {

        if (this._session) return this._session

        const sessionConfig = this.config.session?.config || {} as SessionClientConfigInterface

        return this._session = this.config.session?.client instanceof Function
            ? this.config.session.client(sessionConfig, this)
            : new Session(sessionConfig).load(this)
    }

    assignData(config: HttpContainerConfigInterface) {

        Object.assign(this.config, config)
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

    setResponseData(responseData: HttpResponseData) {
        this.responseData = responseData
        this.config.onSetResponseData?.(responseData)
    }

    send(content: JSONObjectInterface | string, status: number = HTTP_STATUS.OK, contentType?: string) {
        this.setResponseData({
            status,
            contentType: contentType || HttpClient.getDefaultContentType('json', this.config.mimeTypes),
            content: {json: content}
        })
    }

    sendText(content: string, status: number = HTTP_STATUS.OK, contentType?: string) {
        this.setResponseData({
            status,
            contentType: contentType || HttpClient.getDefaultContentType('text', this.config.mimeTypes, TEXT_CONTENT_TYPE),
            content: {text: content}
        })
    }

    sendHtml(content: string, status: number = HTTP_STATUS.OK, contentType?: string) {
        this.setResponseData({
            status,
            contentType: contentType || HttpClient.getDefaultContentType('html', this.config.mimeTypes, HTML_CONTENT_TYPE),
            content: {html: content}
        })
    }

    sendFile(filePath: string, contentType?: string) {

        if (this.responseIsSent) return

        this.response.writeHead(HTTP_STATUS.OK, {
            'Content-Type': contentType || HttpClient.getDefaultContentType(
                fs.getExtension(filePath),
                this.config.mimeTypes,
                FILE_CONTENT_TYPE
            )
        })

        const readStream = fs.system.createReadStream(filePath)

        readStream.on('error', err => {
            this.handleError(err, `Could not read data from file ${filePath}.`)
            this.config.onError?.(err)
        })

        readStream.pipe(this.response)
    }

    handleError(err?: Error, message?: string) {

        this._data = {}

        if (err) {
            this.exceptionMessage = message ?? err.message
            this.exceptionData = err
        }
    }

    throw(status:number, message?:string, data?: any) {

        message && (this.exceptionMessage = message)
        data && (this.exceptionData = data)

        throw new HttpException(this, {status})
    }

    exit(status:number, message?:string, data?: any) {

        message && (this.exceptionMessage = message)
        data && (this.exceptionData = data)

        this.response.statusCode = status
        throw new RuntimeException(this)
    }

    fetchData(): Promise<JSONLikeInterface> {

        return new Promise((resolve, reject) => {
            if (this.isDataFetched || this.isFormData) {
                resolve(this._data)
                return
            }

            const chunks = []

            this.request.on('data', chunk => chunks.push(chunk))
            this.request.on('end', () => {
                this._data = {}
                this.onFetchData(Buffer.concat(chunks), (err) => {
                    if (err) {
                        reject(err)
                        this.handleError(err, 'Failed to fetch data from request')
                        return
                    }
                    this.isDataFetched = true
                    resolve(this._data)
                })
            })

            this.request.on('error', (err) => {
                reject(err)
                this.handleError(err, 'Failed to fetch data from request')
                this.config.onError?.(err)
            })

            this.request.on('aborted', () => {
                reject({message: 'request aborted'})
                this.handleError()
            })
        })
    }

    onFetchData(buffer: Buffer, callback: (err?: Error) => void) {
        const data = buffer.toString().trim()
        const readQuery = () => {
            for (const [key, value] of new URLSearchParams(data).entries()) {
                if (key in this._data) {
                    Array.isArray(this._data[key]) || (this._data[key] = [this._data[key]])
                    this._data[key].push(value)
                    continue
                }
                this._data[key] = value
            }
        }

        try {
            data.startsWith('{') || data.startsWith('[') ? this._data = JSON.parse(data) : readQuery()
            callback()
        } catch (e) {
            callback(e)
        }
    }
}

export class HttpFormData implements HttpFormDataInterface {

    readonly client = require('busboy')

    protected _fields: { [field: string]: any } = {}

    protected _files: { [field: string]: string[] } = {}

    protected _stat: {
        fields: { [field: string]: HttpFormDataClientsField | Array<HttpFormDataClientsField> },
        files: { [field: string]: Array<HttpFormDataClientsFile> }
    } = {
        fields: {},
        files: {},
    }

    private isDataFetched: boolean = false

    protected _errors: { field?: string, error: Error }[] = []

    protected _filePromises: Promise<void>[] = []

    constructor(
        readonly http: HttpContainer,
        readonly config: HttpFormDataClientConfigInterface = {options: {}}) {

        this.config.options ||= {}
        this.config.uploadDir = fs.isDir(this.config.uploadDir) ? this.config.uploadDir : require('os').tmpdir()
    }

    get uploadDir() {

        return this.config.uploadDir
    }

    get form() {

        return this.client({...this.config.options || {}, headers: this.http.request.headers})
    }

    get ready(): boolean {

        return !!this.isDataFetched
    }

    get fields() {

        return {...this._fields}
    }

    get files() {

        return {...this._files}
    }

    get hasError(): boolean {

        return this._errors.length >= 1
    }

    get errors() {

        return this._errors.slice()
    }

    stat(field: string) {

        return this._stat.fields[field] || this._stat.files[field]
    }

    fetchFormData(filter: {
        field?: HttpFormDataClientsFieldFilter,
        file?: HttpFormDataClientsFileFilter
    } = {}): Promise<this> {

        const form = this.form

        this._filePromises = []

        return new Promise((resolve, reject) => {

            if (this.isDataFetched) {
                resolve(this)
                return
            }

            form.on('field', (name, value, info) => {
                this._onFieldUpload(name, value, info, filter?.field)
            })

            form.on('file', (name, file, info) => {
                this._onFileUpload(name, file, info, filter?.file)
            })

            form.on('close', () => {
                this.isDataFetched = true
                Promise.all(this._filePromises).then(() => {
                    resolve(this)
                    this._filePromises = []
                })
            })

            form.on('error', (error) => {
                this._errors.push({error})
                reject(error)
            })

            this.http.request.pipe(form)
        })
    }

    protected _onFieldUpload(
        field: string,
        value: any,
        info: HttpFormDataClientsField,
        filter?: HttpFormDataClientsFieldFilter) {

        if (false === filter?.(field, value, info)) return

        if (field in this._fields) {
            Array.isArray(this._fields[field]) || (this._fields[field] = [this._fields[field]])
            Array.isArray(this._stat[field]) || (this._stat[field] = [this._stat[field]])
            this._fields[field].push(value)
            this._stat[field].push(info)
            return
        }

        this._fields[field] = value
        this._stat.fields[field] = info
    }

    protected _onFileUpload(
        field: string,
        file: Stream,
        info: HttpFormDataClientsFile,
        filter?: HttpFormDataClientsFileFilter) {

        if (info.filename === undefined) return

        this._files[field] ||= []
        this._stat.files[field] ||= []

        if (false === filter?.(field, info)) return

        let resolver = null
        let error = null

        this._filePromises.push(new Promise(res => resolver = res))

        const path = fs.join(this.uploadDir, $.random.hex())
        const writeStream = fs.system.createWriteStream(path)

        writeStream.on('close', () => {
            if (error) {
                this._errors.push({field, error})
                resolver()
                return
            }

            info.path = path
            this._files[field].push(path)
            this._stat.files[field].push(info)
            resolver()
        })

        writeStream.on('error', (err) => error = err)

        file.pipe(writeStream)
    }
}

export class HttpClient {

    private static corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Request-Method': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, GET',
        'Access-Control-Allow-Headers': '*',
    }

    static getResponseIsSent(response: Http2ServerResponse) {

        return response.headersSent || response.writableEnded || response.writableFinished
    }

    static setCorsHeaders(response: Http2ServerResponse, headers?: { [header: string]: string }) {

        headers = Object.assign({...HttpClient.corsHeaders}, headers || {})

        Object.entries(headers).forEach(([header, value]) => {

            response.getHeader(header) || response.setHeader(header, value)
        })
    }

    static mimeTypes(assign?: HttpMimeTypes) {

        return assign ? {...HTTP_CONTENT_MIME_TYPES, ...assign} : HTTP_CONTENT_MIME_TYPES
    }

    static getHttpResponseData(http: BaseHttpResponseInterface, assignData?: HttpResponseData): HttpResponseData {

        http.responseData ||= {}

        assignData?.content && (http.responseData.content = assignData?.content)

        http.responseData.status = assignData?.status

            || http.responseData.status || http.response.statusCode || HTTP_STATUS.OK

        http.responseData.contentType = assignData?.contentType

            || http.responseData.contentType || http.response.getHeader('content-type')

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
        entry: HttpContentExtensions,
        mimeTypes: HttpMimeTypes = {},
        defaultMimeType: string = JSON_CONTENT_TYPE) {

        return mimeTypes[entry] || HTTP_CONTENT_MIME_TYPES[entry] || defaultMimeType
    }

    static getStatusCodeMessage(status: number): string {
        for (const [key, value] of Object.entries(HTTP_STATUS)) {
            if (status === value) return key
        }
        return ''
    }

    static getDataFromStatusCode(http: BaseHttpResponseInterface, setStatusIfNone?: number): HttpResponseDataInterface {

        http.responseData ||= {}

        const status = http.responseData.status ?? setStatusIfNone ?? http.response.statusCode
        const contentType = http.responseData.contentType ?? http.response.getHeader('content-type') ?? JSON_CONTENT_TYPE
        const content = HttpClient.getStatusCodeMessage(status)

        return {status, contentType, content}
    }

    static getParsedURL(url: string): HttpURL {

        const data = require('url').parse(url, true)

        data.pathname = $.trimPath(data.pathname)

        return data
    }

    static fetchHostData(data: HttpHost): HttpHost {

        const {port, protocol, host, hostname} = HttpClient.getParsedURL(HttpClient.getURI(data))

        return {port, protocol, host, hostname}
    }

    static getURI(data: HttpHost) {

        return `${data.protocol.replace(':', '')}://${data.host.replace(':' + data.port, '')}` + (data.port ? ':' + data.port : '')
    }

    static sendJSON(response: Http2ServerResponse, body: JSONObjectInterface | string, status: number = HTTP_STATUS.OK) {

        response.writeHead(status, {'Content-Type': JSON_CONTENT_TYPE})

        response.end(body instanceof Object ? JSON.stringify(body) : body)
    }

    static throwBadRequest() {

        throw new HttpException('The current HTTP method receives no response from the request method.', {

            status: HTTP_STATUS.BAD_REQUEST
        })
    }

    static throwNoContent() {

        throw new HttpException('The current HTTP method receives no content from the request method.', {

            status: HTTP_STATUS.NO_CONTENT
        })
    }
}
