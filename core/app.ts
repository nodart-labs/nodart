import {AppListener, AppStore} from "./app_store";
import {AppFactory} from "./app_factory";
import {AppLoader} from "./app_loader";
import {Http2ServerRequest, Http2ServerResponse} from "http2";
import {HttpServiceRouteObject} from "../interfaces/service";
import {HttpServiceAcceptor, HttpService} from "../services/http";
import {HttpHandler} from "./http_handler";
import {DIManager} from "./di";
import {Router} from "./router";
import {Orm} from "./orm";
import {StoreState, StoreListenerArguments, StoreListeners} from "../interfaces/store";
import {ExceptionHandler, ExceptionLog, RuntimeException} from "./exception";
import {SYSTEM_STORE_NAME, SYSTEM_STATE_NAME, AppConfig, DEFAULT_APP_BUILD_DIR} from "./app_config";
import {AppConfigInterface, AppLoaders} from "../interfaces/app";
import {HttpHost, HttpResponseDataInterface} from "../interfaces/http";
import {HttpClient} from "./http_client";
import {fs} from "../utils";

const events = require('../store/system').events

export const DEFAULT_PORT = 3000
export const DEFAULT_HOST = 'localhost'

type Protocols = 'http' | 'https' | string

export class App {

    readonly config: AppConfig

    readonly factory: AppFactory

    readonly di: DIManager

    readonly router: Router

    readonly builder: AppBuilder

    readonly httpServiceRoutes: Array<HttpServiceRouteObject> = []

    protected _httpHandlerPayload: (httpHandler: HttpHandler) => Promise<any>

    protected _requestPayload: (request: Http2ServerRequest, response: Http2ServerResponse) => Promise<any>

    protected _exceptionPayload: (data: HttpResponseDataInterface, resolve: AppExceptionResolve) => HttpResponseDataInterface

    private _host: HttpHost = {port: null, protocol: null, host: null, hostname: null}

    constructor(config: AppConfigInterface) {

        this.config = new AppConfig().set(config)

        this.factory = new AppFactory(this)

        this.di = new DIManager(this.config.getStrict('reference'), this)

        this.router = new Router(this.config.get.routes)

        this.builder = new AppBuilder(this)
    }

    get rootDir() {

        return fs.path(this.config.get.rootDir)
    }

    get(loader: AppLoaders): AppLoader {

        return this.factory.createLoader(loader)
    }

    get db() {

        const orm = this.get('orm').call() as Orm
        return {
            query: orm.queryBuilder,
            orm
        }
    }

    async init() {

        await this.factory.createApp()

        this.factory.createStore()

        this.factory.createState()

        this.factory.createEventListener()

        return this
    }

    start(port: number = DEFAULT_PORT, protocol: Protocols | {[K in Protocols]: any} = 'http', host: string = DEFAULT_HOST) {

        this.factory.createStore()

        this.factory.createState()

        this.factory.createEventListener()

        const server = this.serve(port, protocol, host)

        const http = this.service.http()

        return {app: this, http, server}
    }

    serve(port: number = DEFAULT_PORT, protocol: Protocols | {[K in Protocols]: any} = 'http', host: string = DEFAULT_HOST) {

        const type = typeof protocol === 'string' ? protocol : Object.keys(protocol)[0] as string

        const http = typeof protocol === 'string' ? require(protocol) : protocol[type]

        this._host = Object.freeze(HttpClient.fetchHostData({port, protocol: type, host}))

        return http.createServer((req: Http2ServerRequest, res: Http2ServerResponse) => {

            (async () => {

                this.requestPayload && await this.requestPayload(req, res)

                await App.system.listen({event: {[events.HTTP_REQUEST]: [this, req, res]}}).catch(exception => {

                    this.resolveExceptionOnHttp(exception, req, res)
                })

            })()

        }).listen(port, host, () => {

            console.log(`server start at port ${port}.`, this.uri)
        })
    }

    get host(): HttpHost {

        return {...this._host}
    }

    get uri(): string {

        return HttpClient.getURI(this.host)
    }

    get service() {

        return {

            http: (): HttpServiceAcceptor => {

                const httpService = this.get('http_service').call() as HttpService

                httpService.subscribe((data: HttpServiceRouteObject) => {

                    this.httpServiceRoutes.push(data)
                })

                return httpService.httpAcceptor
            }
        }
    }

    async resolveExceptionOnHttp(exception: any, req: Http2ServerRequest, res: Http2ServerResponse) {

        const resolve = this.config.get.exception.resolve || AppExceptionResolve

        await new resolve(this, exception).resolveOnHttp(req, res)
    }

    setHttpRequestPayload(payload: (request: Http2ServerRequest, response: Http2ServerResponse) => Promise<any>) {

        this._requestPayload = payload

        return this
    }

    setHttpHandlerPayload(payload: (httpHandler: HttpHandler) => Promise<any>) {

        this._httpHandlerPayload = payload

        return this
    }

    setHttpExceptionPayload(payload: (data: HttpResponseDataInterface) => HttpResponseDataInterface) {

        this._exceptionPayload = payload

        return this
    }

    get requestPayload() {

        return this._requestPayload
    }

    get httpHandlerPayload() {

        return this._httpHandlerPayload
    }

    get exceptionPayload() {

        return this._exceptionPayload
    }

    static store(storeName: string): AppListener {

        return AppStore.get(storeName)
    }

    static state(storeName: string, storeStateName: string) {

        return App.store(storeName).get(storeStateName)
    }

    static get system() {

        const store = AppStore.get(SYSTEM_STORE_NAME)
        const state = AppStore.get(SYSTEM_STORE_NAME)?.get(SYSTEM_STATE_NAME) ?? {}

        return {
            events,
            store,
            state,
            setup: (data: StoreState) => store.setup(SYSTEM_STATE_NAME, data),
            set: async (data: StoreListenerArguments) => await store.set(SYSTEM_STATE_NAME, data),
            listen: async (data: StoreListenerArguments) => await store.listen(SYSTEM_STATE_NAME, data),
            on: (data: StoreListeners) => store.on(SYSTEM_STATE_NAME, data),
        }
    }

}

export class AppExceptionResolve {

    protected _handler: ExceptionHandler

    protected _log: ExceptionLog

    protected _httpResponseData: HttpResponseDataInterface

    constructor(readonly app: App, public exception: any) {
    }

    getHandler(): ExceptionHandler {

        return this._handler ||= this.app.get('exception_handler').call([this.exception]) as ExceptionHandler
    }

    getLog(): ExceptionLog {

        return this._log ||= this.app.get('exception_log').call([this.exception]) as ExceptionLog
    }

    getExceptionTemplate(response: HttpResponseDataInterface): void | string {

        return this.app.get('exception_template').call([response])
    }

    async resolveOnHttp(request: Http2ServerRequest, response: Http2ServerResponse) {

        const handler = this.getHandler()

        handler && (this.exception = handler) && await handler.resolve()

        const exceptionLog = this.getLog()

        this._httpResponseData = exceptionLog.onHttp(request, response).getHttpResponseData(request, response)

        exceptionLog.dump()

        this._sendHttpException(request, response)
    }

    protected _sendHttpException(request: Http2ServerRequest, response: Http2ServerResponse) {

        if (response.headersSent || response.writableEnded || response.writableFinished) return

        const data = this._httpResponseData ?? {} as HttpResponseDataInterface

        const contentType = data.contentType

        Object.assign(data, {request, response})

        this.app.exceptionPayload && Object.assign(data, this.app.exceptionPayload(data, this))

        const exceptionTemplate = this.getExceptionTemplate(data)

        response.writeHead(data.status, {
            'Content-Type': contentType === data.contentType
                ? (exceptionTemplate ? 'text/html' : contentType)
                : data.contentType
        })

        response.end(exceptionTemplate || data.content)
    }

}

export class AppBuilder {

    constructor(readonly app: App) {
    }

    get buildDir() {

        const buildDirName = this.app.config.get.buildDirName || DEFAULT_APP_BUILD_DIR

        const buildDir = fs.path(this.app.rootDir, buildDirName)

        const tsConfig = this.app.factory.tsConfig

        return tsConfig?.compilerOptions?.outDir === buildDirName ? buildDir : null
    }

    get envIsBuild() {

        const buildDir = this.buildDir

        return !!(buildDir && this.app.rootDir.startsWith(buildDir))
    }

    build(onError?: Function) {

        const buildDir = this.buildDir

        if (buildDir === null) throw new RuntimeException(
            'App Build failed. Cannot retrieve a build directory name.'
            + ' Check that configuration parameter "buildDirName" and the option "outDir"'
            + ' in tsconfig.json file are both the same values.'
        )

        fs.rmDir(buildDir, (err) => {
            err || require('child_process').execFileSync('tsc', ['--build'], {shell: true, encoding: "utf-8"})
            err && onError?.(err)
        })
    }
}
