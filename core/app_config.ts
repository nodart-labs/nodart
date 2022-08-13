import {$, fs, object} from '../utils'
import {typeAppLoaderEntries} from "./app_loader";
import {typeRouteEntries} from "./router";
import {ControllerLoader} from "../loaders/controller_loader";
import {ModelLoader} from "../loaders/model_loader";
import {StrategyLoader} from "../loaders/strategy_loader";
import {StoreLoader} from "../loaders/store_loader";
import {MiddlewareLoader} from "../loaders/middleware_loader";
import {typeReferenceEntries} from "./di";
import {App} from './app'

const _path = require('path')

export type typeAppConfig = {
    rootDir?: string,
    store?: string | boolean,
    storeName?: string,
    stateName?: string,
    routes?: typeRouteEntries,
    loaders?: typeAppLoaderEntries,
    reference?: typeReferenceEntries,
    [addon: string]: any,
}

export type typeAppLoaderKeys = 'controller' | 'model' | 'strategy' | 'store' | 'middleware' | keyof typeAppLoaderEntries

export const SYSTEM_STORE: string = 'store' //system store repository name
export const SYSTEM_STORE_NAME: string = 'system_store'
export const SYSTEM_STATE_NAME: string = 'system'
export const CLIENT_STORE: string = 'store' //client store repository name
export const CLIENT_STORE_NAME: string = 'app_store'
export const CLIENT_STATE_NAME: string = 'app'

export const SYSTEM_EVENTS = {
    httpRequest: require('../events/http_request')
}

export const getSamples = (path: string) => {
    return fs.dir(_path.resolve(__dirname, `../samples/${path}`)) ?? []
}

export const DEFAULT_CONTROLLER_NAME = 'index'

export const APP_CONFIG: typeAppConfig = Object.freeze({
    rootDir: '',
    store: true,
    storeName: CLIENT_STORE_NAME,
    stateName: CLIENT_STATE_NAME,
    routes: {},
    loaders: {
        controller: ControllerLoader,
        model: ModelLoader,
        strategy: StrategyLoader,
        store: StoreLoader,
        middleware: MiddlewareLoader,
    },
    reference: {
        middleware: (app: App, target: string, props?: any[]) => app.get('middleware').require(target).call(props),
    }
})

export class AppConfig {

    protected _config: typeAppConfig

    constructor() {
        this._config = {...APP_CONFIG}
    }

    get get (): typeAppConfig {
        return {...this._config}
    }

    getStrict(keyPathDotted: string) {
        return object.get(this._config, keyPathDotted) ?? object.get({...APP_CONFIG}, keyPathDotted)
    }

    set(config: typeAppConfig) {
        Object.assign(this._config, config)
        this.validate()
        return this
    }

    private validate() {

        this._config.rootDir = $.trimPath(this._config.rootDir)

        if (!this._config.rootDir || !fs.isDir(this._config.rootDir)) throw 'The App Root directory is not defined or does not exist.'
    }
}
