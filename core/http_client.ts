import {fs, $} from "../utils";
import {Http2ServerRequest, Http2ServerResponse} from "http2";
import {
    HttpResponseData,
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

const querystring = require('node:querystring')

export class HttpContainer implements HttpContainerInterface {

    private isDataFetched: boolean = false

    private _data: JSONLikeInterface = {}

    protected _form: HttpFormDataInterface

    protected _session: Session

    protected _responder: HttpResponder

    exceptionData: any

    exceptionMessage: string = ""

    responseData: HttpResponseData

    constructor(readonly config: HttpContainerConfigInterface & HttpDataInterface) {
    }

    get host(): HttpHost {

        return this.config.host
    }

    get uri(): string {

        return this.config.uri
    }

    get method(): HttpMethod {

        return this.config.method ||= this.request.method.toLowerCase() as HttpMethod
    }

    get query(): JSONLikeInterface {

        return this.config.query
    }

    get queryString(): string {

        return this.config.queryString || ''
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

    get responseSent(): boolean {

        return HttpClient.getResponseIsSent(this.response)
    }

    get respond(): HttpResponder {

        if (this._responder) return this._responder

        const responder = this.config.responder || HttpResponder
        const engineConfig = this.config.engine?.config || {} as EngineClientConfigInterface
        const engine = typeof this.config.engine?.client === 'function'
            ? this.config.engine.client(engineConfig)
            : new Engine(engineConfig)

        return this._responder = Reflect.construct(responder, [this, engine])
    }

    get session(): Session {

        if (this._session) return this._session

        const sessionConfig = this.config.session?.config || {} as SessionClientConfigInterface

        return this._session = typeof this.config.session?.client === 'function'
            ? this.config.session.client(sessionConfig, this)
            : new Session(sessionConfig).load(this)
    }

    assignData(config: HttpContainerConfigInterface) {

        Object.assign(this.config, config)
    }

    getHttpResponse(assignResponseData?: HttpResponseData): BaseHttpResponseInterface {

        const form = this.isFormData ? this.form : {fields: {}, files: {}}

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

        if (this.responseSent) return

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

        try {
            this._data = data.startsWith('{') || data.startsWith('[')
                ? JSON.parse(data)
                : HttpClient.parseURLQuery(data)
            callback()
        } catch (e) {
            callback(e)
        }
    }
}

export class HttpFormData implements HttpFormDataInterface {

    readonly client = require('busboy')

    readonly fields: { [field: string]: any } = {}

    readonly files: { [field: string]: string[] } = {}

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

        if (field in this.fields) {
            Array.isArray(this.fields[field]) || (this.fields[field] = [this.fields[field]])
            Array.isArray(this._stat[field]) || (this._stat[field] = [this._stat[field]])
            this.fields[field].push(value)
            this._stat[field].push(info)
            return
        }

        this.fields[field] = value
        this._stat.fields[field] = info
    }

    protected _onFileUpload(
        field: string,
        file: Stream,
        info: HttpFormDataClientsFile,
        filter?: HttpFormDataClientsFileFilter) {

        if (info.filename === undefined) return

        this.files[field] ||= []
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
            this.files[field].push(path)
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
        && data.content[contentEntry]
        && typeof data.content[contentEntry] === 'object'
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

    static getDataFromStatusCode(http: BaseHttpResponseInterface, statusOnNone?: number): HttpResponseDataInterface {

        http.responseData ||= {}

        const status = http.responseData.status ?? statusOnNone ?? http.response.statusCode
        const contentType = http.responseData.contentType ?? http.response.getHeader('content-type') ?? JSON_CONTENT_TYPE
        const content = HttpClient.getStatusCodeMessage(status)

        return {status, contentType, content}
    }

    static parseURL(url: string) {

        const entries = url.split('?')

        url = entries[0]

        entries.shift()

        const queryString = entries.length ? entries.join('?') : ''

        return {
            url,
            queryString,
            query: queryString ? HttpClient.parseURLQuery(queryString) : {},
        }
    }

    static parseURLQuery(query: string): JSONLikeInterface {

        return querystring.parse(query)
    }

    static fetchHostData(httpHost: HttpHost): HttpHost {

        const {port, protocol, host, hostname} = require('url').parse(HttpClient.getURI(httpHost))

        return {...httpHost, port, protocol, host, hostname}
    }

    static getURI(data: HttpHost) {

        return `${data.protocol.replace(':', '')}://${data.host.replace(':' + data.port, '')}` + (data.port ? ':' + data.port : '')
    }

    static sendJSON(response: Http2ServerResponse, body: JSONObjectInterface | string, status: number = HTTP_STATUS.OK) {

        response.writeHead(status, {'Content-Type': JSON_CONTENT_TYPE})

        response.end(JSON.stringify(body))
    }

    static throwBadRequest(message: string = '') {

        throw new HttpException(message || 'The current HTTP method receives no response from the request method.', {

            status: HTTP_STATUS.BAD_REQUEST
        })
    }

    static throwNoContent(message: string = '') {

        throw new HttpException(message || 'The current HTTP request receives no content from the response.', {

            status: HTTP_STATUS.NO_CONTENT
        })
    }
}
