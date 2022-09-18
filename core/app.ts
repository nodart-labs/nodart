import {AppListener, AppStore} from "./app_store";
import {AppFactory} from "./app_factory";
import {AppLoader} from "./app_loader";
import {Http2ServerRequest, Http2ServerResponse} from "http2";
import {DIManager} from "./di";
import {Router} from "./router";
import {Orm} from "./orm";
import {SYSTEM_STORE_NAME, SYSTEM_STATE_NAME, AppConfig} from "./app_config";
import {AppConfigInterface, AppLoaders} from "../interfaces/app";
import {HttpResponseDataInterface} from "../interfaces/http";
import {StoreState, StoreListenerArguments, StoreListeners} from "../interfaces/store";
import {ExceptionHandler, ExceptionLog} from "./exception";
import {HttpHandler} from "./http_handler";

const events = require('../store/system').events

export class App {

    protected _httpHandlerPayload: (httpHandler: HttpHandler) => Promise<any>

    protected _requestPayload: (request: Http2ServerRequest, response: Http2ServerResponse) => Promise<any>

    protected _exceptionPayload: (data: HttpResponseDataInterface, resolve: AppExceptionResolve) => HttpResponseDataInterface

    readonly config: AppConfig

    readonly factory: AppFactory

    readonly di: DIManager

    readonly router: Router

    constructor(config: AppConfigInterface) {
        this.config = new AppConfig().set(config)
        this.factory = new AppFactory(this)
        this.di = new DIManager(this.config.getStrict('reference'), this)
        this.router = new Router(this.config.get.routes)
    }

    get rootDir() {
        return this.config.get.rootDir
    }

    get(loader: AppLoaders): AppLoader {
        return this.factory.createLoader(loader)
    }

    get db() {
        const orm = this.get('orm').call([this.config.get.orm]) as Orm
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

    serve(port: number = 3000, protocol: 'http' | 'https' = 'http', host?: string) {
        require(protocol).createServer((req: Http2ServerRequest, res: Http2ServerResponse) => {
            (async () => {
                this.requestPayload && await this.requestPayload(req, res)
                await App.system.listen({event: {[events.HTTP_REQUEST]: [this, req, res]}}).catch(exception => {
                    const resolve = this.config.get.exception.resolve || AppExceptionResolve
                    new resolve(this, exception).resolveOnHttp(req, res)
                })
            })()
        }).listen(port, host, function () {
            console.log(`server start at port ${port}.`, host ? `host: ${host}` : '')
            console.log(`${protocol}://${host ? host : 'localhost'}:${port}`)
        })
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
