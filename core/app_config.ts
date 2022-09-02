import {$, fs, object} from '../utils'
import {App} from './app'
import {typeAppLoaderEntries} from "./app_loader";
import {typeRoute} from "./router";
import {ControllerLoader} from "../loaders/controller_loader";
import {ModelLoader} from "../loaders/model_loader";
import {StoreLoader} from "../loaders/store_loader";
import {ServiceLoader} from "../loaders/service_loader";
import {SessionLoader} from "../loaders/session_loader";
import {typeReferenceEntries} from "./di";
import {EngineLoader} from "../loaders/engine_loader";
import {StaticLoader} from "../loaders/static_loader";
import {typeClientSessionsConfig} from "./session";
import {typeNunjuksConfig} from "./engine";
import {typeOrmConfig} from "./orm";
import {OrmLoader} from "../loaders/orm_loader";

const _path = require('path')

type typeBaseEntry = { [key: string]: any }

export type typeAppConfig = {
    rootDir?: string,
    store?: string | boolean,
    storeName?: string,
    stateName?: string,
    routes?: typeRoute,
    loaders?: typeAppLoaderEntries,
    reference?: typeReferenceEntries,
    session?: typeClientSessionsConfig,
    engine?: typeNunjuksConfig,
    orm?: typeBaseEntry & typeOrmConfig,
    mimeType?: string,
    mimeTypes?: typeBaseEntry,
    database?: string,
    static?: string,
    staticIndex?: string,
    [addon: string]: any,
}

export type typeAppLoaderKeys = 'controller'
    | 'model'
    | 'store'
    | 'service'
    | 'session'
    | 'engine'
    | 'static'
    | 'orm'
    | keyof typeAppLoaderEntries

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
export const DEFAULT_STATIC_INDEX = 'index.html'
export const DEFAULT_STATIC_REPOSITORY = 'static'
export const DEFAULT_MIME_TYPE = 'application/octet-stream'
export const DEFAULT_MIME_TYPES = Object.freeze({
    html: 'text/html',
    htm: 'text/html',
    js: 'text/javascript',
    css: 'text/css',
    json: 'application/json',
    png: 'image/png',
    ico: 'image/vnd.microsoft.icon',
    jpg: 'image/jpg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    wav: 'audio/wav',
    mp4: 'video/mp4',
    avi: 'video/x-msvideo',
    woff: 'application/font-woff',
    ttf: 'application/font-ttf',
    eot: 'application/vnd.ms-fontobject',
    otf: 'application/font-otf',
    wasm: 'application/wasm',
})

export const DEFAULT_DATABASE_REPOSITORY = 'database'
export const DEFAULT_DATABASE_MIGRATION_REPOSITORY = 'migrations'
export const DEFAULT_DATABASE_MIGRATION_SRC_REPOSITORY = 'migration_sources'
export const DEFAULT_DATABASE_SEED_REPOSITORY = 'seeds'
export const DEFAULT_DATABASE_SEED_SRC_REPOSITORY = 'seed_sources'

export const DEFAULT_ENGINE_VIEWS_REPOSITORY = 'views'

export const APP_CONFIG: typeAppConfig = Object.freeze({
    rootDir: '',
    store: true,
    storeName: CLIENT_STORE_NAME,
    stateName: CLIENT_STATE_NAME,
    routes: {},
    engine: {},
    session: {
        secret: require('crypto').randomBytes(20).toString('hex')
    },
    orm: {},
    database: DEFAULT_DATABASE_REPOSITORY,
    static: DEFAULT_STATIC_REPOSITORY,
    staticIndex: DEFAULT_STATIC_INDEX,
    loaders: {
        controller: ControllerLoader,
        model: ModelLoader,
        store: StoreLoader,
        service: ServiceLoader,
        session: SessionLoader,
        engine: EngineLoader,
        static: StaticLoader,
        orm: OrmLoader
    },
    reference: {
        service: (app: App, target: string, props?: any[]) => app.get('service').require(target).call(props),
        model: (app: App, target: string, props?: any[]) => app.get('model').require(target).call(props),
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
        this._config = object.merge(this._config, config)
        this.validate()
        return this
    }

    private validate() {
        this._config.rootDir = $.trimPath(this._config.rootDir)

        if (!this._config.rootDir || !fs.isDir(this._config.rootDir)) {
            throw 'The App Root directory is not defined or does not exist.'
        }
    }
}
