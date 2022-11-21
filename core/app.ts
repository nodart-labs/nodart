import {
    AppEmitterEvents,
    AppLoaders,
    AppConfigInterface,
    AppModuleFacadeInterface,
    AppModuleConfigInterface,
    AppStateLoadersInterface
} from "./interfaces/app";
import {State, Store} from "./store";
import {Http2ServerRequest, Http2ServerResponse} from "http2";
import {HttpServiceRouteObject} from "./interfaces/service";
import {HttpServiceAcceptor, HttpService} from "../services/http";
import {BaseDependencyInterceptor, DIContainer} from "./di";
import {Router} from "./router";
import {StoreState, StoreListenerArguments, StoreListeners} from "./interfaces/store";
import {ExceptionHandler, ExceptionLog, RuntimeException} from "./exception";
import {
    AppConfig,
    SYSTEM_STORE,
    SYSTEM_STORE_REPOSITORY,
    SYSTEM_STORE_NAME,
    SYSTEM_STATE_NAME,
    DEFAULT_APP_BUILD_DIR,
    DEFAULT_ENV_FILE_NAME,
    CLIENT_STORE_REPOSITORY
} from "./app_config";
import {Server} from "http";
import {Server as SecureServer} from "https";
import {HttpHost, HttpMethod, HttpProtocols, HttpResponseDataInterface} from "./interfaces/http";
import {HttpClient} from "./http_client";
import {fs, $} from "../utils";
import {ModuleService} from "../services/module";
import {CashierService} from "../services/cashier";
import {OrmService} from "../services/orm";
import {RouteData} from "./interfaces/router";
import {DependencyInterceptorInterface} from "./interfaces/di";
import {ServiceFactory} from "./service";

export const DEFAULT_PORT = 3000
export const DEFAULT_HOST = 'localhost'

export const loaders = () => App.system.state.loaders as AppStateLoadersInterface

export class App {

    readonly config: AppConfig

    readonly factory: AppFactory

    readonly di: DIContainer

    readonly router: Router

    readonly builder: AppBuilder

    readonly emitter: AppEmitter

    readonly service: AppServiceManager

    readonly env: AppEnv

    protected _isStart: boolean = false

    protected _isInit: boolean = false

    protected _isServe: boolean = false

    private _host: HttpHost = {port: null, protocol: null, host: null, hostname: null, family: ''}

    private _uri: string = ''

    constructor(config: AppConfigInterface) {

        this.config = new AppConfig().set(config)
        this.factory = new AppFactory(this)
        this.service = new AppServiceManager(this)
        this.router = new Router(this.config.get.routes)
        this.builder = new AppBuilder(this)
        this.emitter = new AppEmitter(this)
        this.env = new AppEnv(this)
        this.di = new DIContainer({mediator: this, references: this.config.getStrict('reference')})
    }

    get rootDir() {

        return this.config.get.rootDir
    }

    get<K extends keyof AppLoaders>(loader: K): AppLoaders[K] {

        return this.factory.createLoader(loader)
    }

    get isStart() {

        return this._isStart
    }

    get isInit() {

        return this._isInit
    }

    get isServe() {

        return this._isServe
    }

    get host(): Readonly<HttpHost> {

        return this._host
    }

    get uri(): string {

        return this._uri
    }

    async init(): Promise<this> {

        this.service.check().throwIsInit

        this.factory.createStore()

        this.factory.createState()

        await this.factory.createApp()

        this.service.cashier.cacheAppFolder()

        this._isInit = true

        return this
    }

    async start(
        port: number = DEFAULT_PORT,
        protocol: HttpProtocols = 'http',
        host: string = DEFAULT_HOST,
        serve?: (app: App) => Server | SecureServer | Promise<Server | SecureServer>
    ): Promise<{ app: App, http: HttpServiceAcceptor, server: Server | SecureServer }> {

        this.service.check().throwIsStart

        this.factory.createState()

        this.service.cashier.cacheAppFolder()

        const server = await this.serve(port, protocol, host, serve)

        const http = this.service.http

        this._isStart = true

        return {app: this, http, server}
    }

    async serve(
        port: number = DEFAULT_PORT,
        protocol: HttpProtocols = 'http',
        host: string = DEFAULT_HOST,
        serve?: (app: App) => Server | SecureServer | Promise<Server | SecureServer>
    ): Promise<Server | SecureServer> {

        this.service.check().throwIsServe

        const server = serve ? await serve(this) : require(protocol).createServer()

        this.service.check().throwIsServer(server)

        return new Promise((resolve) => {

            setTimeout(async () => {

                const connection = server.address()

                if (connection) {
                    port = connection.port
                    host = connection.address
                    this.setHost(connection, protocol)
                }

                server.eventNames().includes('request') || server.on('request', (req, res) => {
                    this.resolveHttpRequest(req, res)
                })

                server.listening || server.listen(port, host, () => {
                    const connection = server.address()
                    this.setHost(connection, protocol)
                    console.log(`server start at port ${port}.`, this.uri)
                })

                setTimeout(async () => {
                    this._isServe = true
                    this.service.cashier.cacheAppFolder()
                    await this.emitter.emit('ON_START_SERVER', {server})
                    resolve(server)
                }, 100)

            }, 500)
        })
    }

    private setHost(connection: { address: string, family: string, port: number }, protocol: HttpProtocols) {

        this._host = Object.freeze(HttpClient.fetchHostData({
            port: connection.port,
            protocol,
            host: connection.address,
            family: connection.family
        }))

        this._uri = HttpClient.getURI(this._host)
    }

    resolveHttpRequest(req: Http2ServerRequest, res: Http2ServerResponse) {

        this.service.requestPayload

            ? this.service.requestPayload(req, res).then(() => SYSTEM_STORE.events.HTTP_REQUEST(this, req, res))

            : SYSTEM_STORE.events.HTTP_REQUEST(this, req, res)
    }

    resolveException(exception: any, req: Http2ServerRequest, res: Http2ServerResponse) {

        const resolve = this.config.get.exception.resolve || AppExceptionResolve

        new resolve(this, exception).resolveOnHttp(req, res)
    }

    static store(storeName: string): State {

        return Store.get(storeName)
    }

    static state(storeName: string, storeStateName: string) {

        return App.store(storeName).get(storeStateName)
    }

    static get system() {

        const store = Store.get(SYSTEM_STORE_NAME)
        const state = Store.get(SYSTEM_STORE_NAME)?.get(SYSTEM_STATE_NAME) ?? {}

        return {
            events: SYSTEM_STORE.events,
            store,
            state,
            setup: (data: StoreState) => store.setup(SYSTEM_STATE_NAME, data),
            set: async (data: StoreListenerArguments) => await store.set(SYSTEM_STATE_NAME, data),
            listen: async (data: StoreListenerArguments) => await store.listen(SYSTEM_STATE_NAME, data),
            on: (data: StoreListeners) => store.on(SYSTEM_STATE_NAME, data),
        }
    }
}

export class AppFactory {

    readonly service: ServiceFactory

    constructor(readonly app: App) {

        this.service = new ServiceFactory(app)
    }

    async createApp() {
        for (const loader of Object.keys(this.app.config.getStrict('loaders'))) {
            await this.createLoader(loader as keyof AppLoaders).generate()
        }
    }

    createStore() {
        const {store, repo} = this.app.service.store.data
        repo && store && Store.add(store, fs.path(this.app.rootDir, repo))
    }

    createState() {
        App.system.store || Store.add(SYSTEM_STORE_NAME, fs.path(__dirname, '../' + SYSTEM_STORE_REPOSITORY))
        App.system.state.app || App.system.setup({
            app: this.app,
            loaders: {
                static: this.createLoader('static'),
                http: this.createLoader('http'),
                controller: this.createLoader('controller'),
                service: this.createLoader('service'),
                model: this.createLoader('model'),
            } as AppStateLoadersInterface
        })
    }

    createLoader<K extends keyof AppLoaders>(name: K): AppLoaders[K] {
        return Reflect.construct(this.app.config.getStrict(`loaders.${name}`), [this.app])
    }
}

export abstract class AppModule {

    protected constructor(readonly app: App, readonly config: AppModuleConfigInterface = {options: {}}) {
    }

    abstract init<K extends keyof AppEmitterEvents>(event: K, scope: AppEmitterEvents[K]): void | AppModuleFacade
}

export abstract class AppModuleFacade implements AppModuleFacadeInterface {

    protected constructor(readonly module: AppModule) {
    }
}

export class AppServiceManager {

    protected _http: HttpService

    protected _orm: OrmService

    protected _module: ModuleService

    protected _cashier: CashierService

    protected _requestPayload: (request: Http2ServerRequest, response: Http2ServerResponse) => Promise<any>

    protected _exceptionPayload: (data: HttpResponseDataInterface, resolve: AppExceptionResolve) => HttpResponseDataInterface

    constructor(readonly app: App) {
    }

    get store() {

        const config = this.app.config.get

        return {
            get data() {
                return {
                    store: config.storeName,
                    state: config.stateName,
                    repo: this.repo
                }
            },
            get repo() {
                const repo = config.store
                return typeof repo === 'boolean' ? (repo ? CLIENT_STORE_REPOSITORY : '') : repo
            }
        }
    }

    check(app?: App) {

        app ||= this.app

        return {
            get throwIsServe() {
                if (app.isServe) throw 'The App already is being served.'
                return
            },
            get throwIsStart() {
                if (app.isStart) throw 'The App already has been started.'
                return
            },
            get throwIsInit() {
                if (app.isInit) throw 'The App already has been initialised.'
                return
            },
            throwIsServer(server: any) {
                if (server instanceof Server) return
                if (server instanceof SecureServer) return
                throw 'The provided server is not an instance of node "Server".'
            }
        }
    }

    get http(): HttpServiceAcceptor {

        this.httpService.subscribers.length || this.httpService.subscribe((data: HttpServiceRouteObject & { route: RouteData }) => {

            data.route.callback = data.callback

            this.app.router.addRoute(data.route, data.action as HttpMethod)
        })

        return this.httpService.httpAcceptor
    }

    get httpService() {

        return this._http ||= new HttpService()
    }

    get requestPayload() {

        return this._requestPayload
    }

    setRequestPayload(payload: (request: Http2ServerRequest, response: Http2ServerResponse) => Promise<any>) {

        if (this._requestPayload) throw 'The request payload already has been set.'

        this._requestPayload = payload

    }

    get exceptionPayload() {

        return this._exceptionPayload
    }

    setExceptionPayload(payload: (data: HttpResponseDataInterface, resolve: AppExceptionResolve) => HttpResponseDataInterface) {

        if (this._exceptionPayload) throw 'The exception payload already has been set.'

        this._exceptionPayload = payload
    }

    get db() {

        return this._orm ||= new OrmService(this.app)
    }

    get module() {

        return this._module ||= new ModuleService(this.app, this.app.config.get.modules)
    }

    get cashier() {

        return this._cashier ||= new CashierService(this.app)
    }
}

export class AppEnv {

    private envFilenamePattern: RegExp = /^[A-z\d.-_]+(\.ts|\.js)$/

    private tsConfigFileName: string = 'tsconfig.json'

    private env: AppConfigInterface

    constructor(readonly app: App) {
    }

    get baseDir() {
        return fs.isFile(fs.path(this.app.rootDir, this.tsConfigFileName)) ? this.app.rootDir : process.cwd()
    }

    get data(): AppConfigInterface {
        return this.env ||= fs.include(this.envFile, {
            log: false,
            skipExt: true,
            success: (data) => $.isPlainObject(data) ? data : {}
        })
    }

    get envFilename() {
        const name = this.app.config.get.envFilename || DEFAULT_ENV_FILE_NAME
        if (!name.match(this.envFilenamePattern))
            throw `The environment file name "${name}" does not have a permitted name or extension (.js or .ts).`
        return name
    }

    get envFile() {
        return fs.path(this.app.rootDir, this.envFilename)
    }

    get tsConfig() {
        return fs.json(fs.path(this.baseDir, this.tsConfigFileName)) ?? {}
    }

    get tsConfigExists(): boolean {
        return fs.isFile(fs.path(this.baseDir, this.tsConfigFileName))
    }

    get isCommonJS(): boolean {

        return !this.tsConfigExists
    }

    get isBuild(): boolean {

        if (this.isCommonJS) return true

        const buildDir = this.app.builder.buildDir

        return !!(buildDir && this.app.rootDir.startsWith(buildDir))
    }

}

export class AppEmitter {

    constructor(readonly app: App) {
    }

    async emit<K extends keyof AppEmitterEvents>(event: K, scope?: AppEmitterEvents[K]) {

        for (const module of this.app.service.module.getModules()) {

            const facade = await module.init(event, scope)

            if (!facade) continue

            await facade[<keyof AppModuleFacadeInterface>event]?.(scope)
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

        if (HttpClient.getResponseIsSent(response)) return

        const data = this._httpResponseData ?? {} as HttpResponseDataInterface

        const contentType = data.contentType

        const payload = this.app.service.exceptionPayload

        Object.assign(data, {request, response})

        payload && Object.assign(data, payload(data, this) || {})

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

    get buildDir(): string | null {

        const buildDirname = this.app.config.get.buildDirname || DEFAULT_APP_BUILD_DIR

        const buildDir = fs.path(this.app.env.baseDir, buildDirname)

        const tsConfig = this.app.env.tsConfig

        return tsConfig?.compilerOptions?.outDir === buildDirname ? buildDir : null
    }

    build(onError?: Function) {

        if (this.app.env.isCommonJS) return

        const buildDir = this.buildDir

        if (buildDir === null) throw new RuntimeException(
            'App Build failed. Cannot retrieve a build directory name.'
            + ' Check that configuration parameter "buildDirname" and the option "outDir"'
            + ' in tsconfig.json file are both the same values.'
        )

        fs.rmDir(buildDir, (err) => {
            err || require('child_process').execFileSync('tsc', ['--build'], {shell: true, encoding: "utf-8"})
            err && onError?.(err)
        })
    }

    substractRootDir(buildDir: string, rootDir: string) {

        const substract = $.trimPath(rootDir.replace(this.app.env.baseDir, ''))

        return substract ? fs.path(buildDir, substract) : buildDir
    }
}
