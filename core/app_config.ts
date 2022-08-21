import {$, fs, object} from '../utils'
import {App} from './app'
import {typeAppLoaderEntries} from "./app_loader";
import {typeRouteEntries} from "./router";
import {ControllerLoader} from "../loaders/controller_loader";
import {ModelLoader} from "../loaders/model_loader";
import {StoreLoader} from "../loaders/store_loader";
import {MiddlewareLoader} from "../loaders/middleware_loader";
import {SessionLoader} from "../loaders/session_loader";
import {typeReferenceEntries, typeReferencePayload} from "./di";
import {EngineLoader} from "../loaders/engine_loader";
import {StaticLoader} from "../loaders/static_loader";

const _path = require('path')

type typeBaseEntry = { [key: string]: string }

export type typeAppConfig = {
    rootDir?: string,
    store?: string | boolean,
    storeName?: string,
    stateName?: string,
    routes?: typeRouteEntries,
    loaders?: typeAppLoaderEntries,
    reference?: typeReferenceEntries,
    session?: typeAppSessionConfig,
    mimeType?: string,
    mimeTypes?: typeBaseEntry,
    static?: string,
    [addon: string]: any,
}

export type typeAppLoaderKeys = 'controller'
    | 'model'
    | 'store'
    | 'middleware'
    | 'session'
    | 'engine'
    | 'static'
    | keyof typeAppLoaderEntries
/**
 * https://github.com/mozilla/node-client-sessions
 */
export type typeAppSessionConfig = {
    cookieName?: string,
    requestKey?: string, // requestKey overrides cookieName for the key name added to the request object.
    secret: string, // should be a large unguessable string or Buffer
    duration?: number,
    activeDuration?: number, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
    // Advanced Cryptographic Options
    encryptionAlgorithm?: string,
    encryptionKey?: string,
    // use a SHORTER-than-default MAC:
    signatureAlgorithm?: string,
    signatureKey?: string,
    cookie?: {
        path?: string, // cookie will only be sent to requests under '/api'
        maxAge?: number, // duration of the cookie in milliseconds, defaults to duration above
        ephemeral?: boolean, // when true, cookie expires when the browser closes
        httpOnly?: boolean, // when true, cookie is not accessible from javascript
        secure?: boolean, // when true, cookie will only be sent over SSL. use key 'secureProxy' instead if you handle SSL not in your node process
        [addon: string]: any,
    },
    [addon: string]: any,
}

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
export const DEFAULT_STATIC_REPOSITORY = 'static'
export const DEFAULT_MIME_TYPE = 'application/octet-stream'
export const DEFAULT_MIME_TYPES = Object.freeze({
    'html': 'text/html',
    'js': 'text/javascript',
    'css': 'text/css',
    'json': 'application/json',
    'png': 'image/png',
    'ico': 'image/vnd.microsoft.icon',
    'jpg': 'image/jpg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'wav': 'audio/wav',
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'woff': 'application/font-woff',
    'ttf': 'application/font-ttf',
    'eot': 'application/vnd.ms-fontobject',
    'otf': 'application/font-otf',
    'wasm': 'application/wasm',
})

export const APP_CONFIG: typeAppConfig = Object.freeze({
    rootDir: '',
    store: true,
    storeName: CLIENT_STORE_NAME,
    stateName: CLIENT_STATE_NAME,
    routes: {},
    loaders: {
        controller: ControllerLoader,
        model: ModelLoader,
        store: StoreLoader,
        middleware: MiddlewareLoader,
        session: SessionLoader,
        engine: EngineLoader,
        static: StaticLoader,
    },
    reference: {
        middleware: (app: App, target: string, props?: any[]) => app.get('middleware').require(target).call(props),
        model: (app: App, target: string, props?: any[]) => app.get('model').require(target).call(props),
        strategy: (app: App, target: string, props?: any[]) => app.get('strategy').require(target).call(props),
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
