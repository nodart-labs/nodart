import {AppListener, AppStore} from "./app_store";
import {SYSTEM_STORE_NAME, SYSTEM_STATE_NAME, AppConfig, typeAppConfig, typeAppLoaderKeys} from "./app_config";
import {AppFactory} from "./app_factory";
import {AppLoader} from "./app_loader";
import {Http2ServerRequest, Http2ServerResponse} from "http2";
import {DIManager} from "./di";
import {Router} from "./router";
import {HttpHandler} from "./http_handler";

const events = require('../store/system').events

export declare type typeHttpHandler = (defaultHttpHandler: HttpHandler) => Promise<any>

export class App {

    private _httpHandler: typeHttpHandler

    readonly config: AppConfig

    readonly factory: AppFactory

    readonly di: DIManager

    readonly router: Router

    constructor(config: typeAppConfig) {
        this.config = new AppConfig().set(config)
        this.factory = new AppFactory(this)
        this.di = new DIManager(this.config.getStrict('reference'), this)
        this.router = new Router(this.config.get.routes)
    }

    get rootDir() {
        return this.config.get.rootDir
    }

    get(loader: typeAppLoaderKeys): AppLoader {
        return this.factory.createLoader(loader)
    }

    async init() {
        await this.factory.createApp()
        this.factory.createStore()
        this.factory.createState()
        this.factory.createEventListener()
        return this
    }

    serve(port: number = 3000, protocol: string = 'http') {
        require(protocol).createServer(async (req: Http2ServerRequest, res: Http2ServerResponse) => {
            await App.system.set({event: {[events.HTTP_REQUEST]: [this, req, res]}})
        }).listen(port, function () {
            console.log(`server start at port ${port}`)
        })
    }

    setHttpHandler(handler: typeHttpHandler) {
        this._httpHandler = handler
        return this
    }

    get httpHandler () {
        return this._httpHandler
    }

    static store(storeName: string): AppListener {
        return AppStore.get(storeName)
    }

    static state(storeName: string, storeStateName: string) {
        return App.store(storeName).get(storeStateName)
    }

    static get system() {
        const store = AppStore.get(SYSTEM_STORE_NAME)
        const state = AppStore.get(SYSTEM_STORE_NAME)?.get(SYSTEM_STATE_NAME)

        return {
            store,
            state,
            set: async (data: object) => await store.set(SYSTEM_STATE_NAME, data),
            setup: (data: object) => store.setup(SYSTEM_STATE_NAME, data),
            on: (data: object) => store.on(SYSTEM_STATE_NAME, data),
        }
    }

}
