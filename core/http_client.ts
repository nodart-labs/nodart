import {fs, $} from "../utils";
import {Http2ServerRequest, Http2ServerResponse} from "http2";
import {
    HttpResponseData,
    HttpURL,
    HttpHost,
    HttpContentExtensions,
    HttpMimeTypes,
    HttpFormDataOptions,
    BaseHttpResponseInterface,
    HttpClientConfigInterface,
    BaseHttpResponseHandlerInterface,
    HttpResponseDataInterface,
    HttpFormDataInterface,
    HttpFormDataConfigInterface,
    HTTP_STATUS_CODES,
    HTTP_CONTENT_MIME_TYPES,
} from "../interfaces/http";
import {JSONObjectInterface} from "../interfaces/object";

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

    protected _data: JSONObjectInterface = {}

    protected _buffer: Buffer

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

    get data(): JSONObjectInterface {

        return {...this._data}
    }

    get ready(): boolean {

        return !!this.isDataFetched
    }

    get buffer(): Buffer | undefined {

        return this._buffer
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
                this._buffer = Buffer.concat(chunks)
                this._data = {}

                const data = this._buffer.toString()
                const readQuery = (data) => {
                    try {
                        for (const [key, value] of new URLSearchParams(data).entries()) this._data[key] = value
                    } catch (err) {
                        reject(err)
                        this.handleError(err, 'Failed to fetch data from request')
                    }
                }

                try {
                    data.startsWith('{') || data.startsWith('[')
                        ? this._data = JSON.parse(data)
                        : readQuery(data)
                } catch (e) {
                    readQuery(data)
                }

                this.isDataFetched = true

                resolve(this._data)
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
        this._buffer = undefined
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
        fields: {
            [field: string]: {
                nameTruncated?: boolean,
                valueTruncated?: boolean,
                encoding?: string,
                mimeType?: string,
            }
        },
        files: {
            [field: string]: Array<{
                path?: string,
                filename?: string,
                encoding?: string,
                mimeType?: string
            }>
        }
    } = {
        fields: {},
        files: {},
    }

    private isDataFetched: boolean = false

    protected _errors: { field?: string, error: Error }[] = []

    constructor(
        readonly http: BaseHttpResponseHandlerInterface,
        readonly config: HttpFormDataConfigInterface & { options: HttpFormDataOptions } = {options: {}}) {

        this.config.options ??= {}
    }

    get uploadDir() {

        return fs.isDir(this.config.uploadDir) ? this.config.uploadDir : require('os').tmpdir()
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

    fetchFormData(onFile?: {}): Promise<this> {

        const form = this.form

        const uploadDir = this.uploadDir

        return new Promise((resolve, reject) => {

            if (this.isDataFetched) {
                resolve(this)
                return
            }

            const promises = []

            form.on('file', (name, file, info) => {

                let resolver = null
                let error = null

                promises.push(new Promise(res => resolver = res))

                const hash = $.random.hex()
                const path = fs.path(uploadDir, hash)
                const writeStream = fs.system.createWriteStream(path)

                this._files[name] ||= []
                this._stat.files[name] ||= []

                writeStream.on('close', () => {
                    if (error) {
                        this._errors.push({field: name, error})
                    } else {
                        info.path = path
                        this._files[name].push(path)
                        this._stat.files[name].push(info)
                    }
                    resolver()
                })

                writeStream.on('error', (err) => error = err)

                file.pipe(writeStream)
            })

            form.on('field', (name, value, info) => {
                this._fields[name] = value
                this._stat.fields[name] = info
            })

            form.on('close', () => {
                this.isDataFetched = true
                Promise.all(promises).then(() => resolve(this))
            })

            form.on('error', (error) => {
                this._errors.push({error})
                reject(error)
            })

            this.http.request.pipe(form)
        })
    }

}
