import {fs, $} from "../utils";
import {Http2ServerRequest, Http2ServerResponse} from "http2";
import {
    HttpResponseData,
    HttpURL,
    HttpHost,
    HttpContentExtensions,
    HttpMimeTypes,
    HttpFormDataConfigExtended,
    HttpFormDataClientsFile,
    HttpFormDataClientsField,
    HttpFormDataClientsFieldFilter,
    HttpFormDataClientsFileFilter,
    BaseHttpResponseInterface,
    HttpClientConfigInterface,
    BaseHttpResponseHandlerInterface,
    HttpResponseDataInterface,
    HttpFormDataInterface,
    HTTP_STATUS_CODES,
    HTTP_CONTENT_MIME_TYPES,
} from "../interfaces/http";
import {JSONLikeInterface, JSONObjectInterface} from "../interfaces/object";
import {Stream} from "stream";

export const DEFAULT_FILE_MIME_TYPE = 'application/octet-stream'
export const DEFAULT_CONTENT_TYPE = 'application/json'
export const MULTIPART_FORM_DATA_TYPE = 'multipart/form-data'

export class HttpClient implements BaseHttpResponseHandlerInterface {

    private corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Request-Method': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, GET',
        'Access-Control-Allow-Headers': '*',
    }

    protected _data: JSONLikeInterface = {}

    protected _dataURL: HttpURL

    protected _host: HttpHost

    protected _form: HttpFormDataInterface

    private isDataFetched: boolean = false

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

    set host(data: HttpHost) {

        this._host = data
    }

    get data(): JSONLikeInterface {

        return {...this._data}
    }

    get ready(): boolean {

        return !!this.isDataFetched
    }

    get form(): HttpFormData {

        return (this._form ||= new HttpFormData(this)) as HttpFormData
    }

    set form(formDataHandler: HttpFormData) {

        this._form = formDataHandler
    }

    get isFormData(): boolean {

        return this.request.headers['content-type']?.includes(MULTIPART_FORM_DATA_TYPE)
    }

    get hasError(): boolean {

        return !!(this.exceptionMessage || this.exceptionData || this.form.hasError)
    }

    get responseIsSent(): boolean {

        return this.response.headersSent || this.response.writableEnded || this.response.writableFinished
    }

    get parseURL(): HttpURL {
        return this._dataURL ||= HttpClient.getParsedURL(
            this._host
                ? HttpClient.getURI(this._host) + '/' + $.trimPath(this.request.url)
                : this.request.url
        )
    }

    setCorsHeaders(headers?: { [header: string]: string }) {

        headers = Object.assign({...this.corsHeaders}, headers ?? {})

        Object.entries(headers).forEach(([header, value]) => {

            this.response.getHeader(header) || this.response.setHeader(header, value)
        })
    }

    fetchData(): Promise<any> {

        return new Promise((resolve, reject) => {
            if (this.isDataFetched || this.isFormData) {
                resolve(this._data)
                return
            }

            const chunks = []

            this.request.on('data', chunk => chunks.push(chunk))
            this.request.on('end', () => {
                this._data = {}
                this._onFetchData(Buffer.concat(chunks), (err) => {
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
                this.onError()
            })

            this.request.on('aborted', () => {
                reject({message: 'request aborted'})
                this.handleError()
            })
        })
    }

    protected _onFetchData(buffer: Buffer, callback: (err?: Error) => void) {
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

        const stat = fs.stat(filePath)
        const parse = fs.parseFile(filePath)

        this.responseIsSent || this.response.writeHead(HTTP_STATUS_CODES.OK, {
            'Content-Type': contentType || HttpClient.getDefaultContentType(
                $.trim(parse.ext, '.'),
                this.config.mimeTypes,
                DEFAULT_FILE_MIME_TYPE
            ),
            'Content-Length': stat.size
        })

        const readStream = fs.system.createReadStream(filePath)

        readStream.on('error', err => {
            this.handleError(err, `Could not read data from file ${filePath}.`)
            this.onError()
        })

        readStream.pipe(this.response)
    }

    onError() {
    }

    handleError(err?: Error, message?: string) {
        this._data = {}
        if (err) {
            this.exceptionMessage = message ?? err?.message
            this.exceptionData = err
        }
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
        readonly http: BaseHttpResponseHandlerInterface,
        readonly config: HttpFormDataConfigExtended = {options: {}}) {

        this.config.options ??= {}
        this.config.uploadDir = fs.isDir(this.config.uploadDir) ? this.config.uploadDir : require('os').tmpdir()
    }

    get uploadDir() {

        return this.config.uploadDir
    }

    get form() {

        return this.client({...this.config.options ?? {}, headers: this.http.request.headers})
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

        this._files[field] ||= []
        this._stat.files[field] ||= []

        if (false === filter?.(field, info)) return

        let resolver = null
        let error = null

        this._filePromises.push(new Promise(res => resolver = res))

        const path = fs.path(this.uploadDir, $.random.hex())
        const writeStream = fs.system.createWriteStream(path)

        writeStream.on('close', () => {
            if (error) {
                this._errors.push({field, error})
                resolver()
                return
            }

            if (info.filename === undefined) {
                const stat = fs.stat(path)

                if (!stat || stat.size === 0) {
                    fs.isFile(path) && fs.system.unlink(path, () => {
                    })
                    resolver()
                    return
                }
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
