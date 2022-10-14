import {$, fs, object} from '../utils'
import {App, AppExceptionResolve} from './app'
import {AppConfigInterface} from "../interfaces/app";
import {ControllerLoader} from "../loaders/controller_loader";
import {ModelLoader} from "../loaders/model_loader";
import {StoreLoader} from "../loaders/store_loader";
import {ServiceLoader} from "../loaders/service_loader";
import {SessionLoader} from "../loaders/session_loader";
import {EngineLoader} from "../loaders/engine_loader";
import {StaticLoader} from "../loaders/static_loader";
import {OrmLoader} from "../loaders/orm_loader";
import {CommandLineLoader} from "../loaders/cmd_loader";
import {HttpClientLoader} from "../loaders/http_client_loader";
import {HttpExceptionHandler, RuntimeExceptionHandler} from "./exception";
import {HttpException, RuntimeException} from "./exception";
import {ExceptionHandlerLoader} from "../loaders/exception_handler_loader";
import {ExceptionLog} from "./exception";
import {ExceptionLogLoader} from "../loaders/exception_log_loader";
import {ExceptionTemplateLoader} from "../loaders/exception_template_loader";
import {AppBuilderLoader} from "../loaders/app_builder_loader";
import {HttpServiceLoader} from "../loaders/http_service_loader";
import {HttpRespondLoader} from "../loaders/http_respond_loader";
import {HttpFormDataLoader} from "../loaders/http_form_data_loader";
import {Engine} from "./engine";
import {HttpResponder} from "./http_respond";

const STORE = require('../store/system')

export const SYSTEM_STORE: string = 'store' //system store repository name
export const SYSTEM_STORE_NAME: string = 'system_store'
export const SYSTEM_STATE_NAME: string = 'system'
export const CLIENT_STORE: string = 'store' //client store repository name
export const CLIENT_STORE_NAME: string = 'app_store'
export const CLIENT_STATE_NAME: string = 'app'
export const SYSTEM_LISTENERS = {
    [STORE.events.HTTP_REQUEST]: require('../events/http_request'),
    [STORE.events.HTTP_RESPONSE]: require('../events/http_response'),
}

export const DEFAULT_CONTROLLER_NAME = 'index'
export const DEFAULT_STATIC_INDEX = 'index.html'
export const DEFAULT_STATIC_REPOSITORY = 'static'

export const DEFAULT_DATABASE_REPOSITORY = 'database'
export const DEFAULT_DATABASE_MIGRATION_REPOSITORY = 'migrations'
export const DEFAULT_DATABASE_MIGRATION_SRC_REPOSITORY = 'migration_sources'
export const DEFAULT_DATABASE_SEED_REPOSITORY = 'seeds'
export const DEFAULT_DATABASE_SEED_SRC_REPOSITORY = 'seed_sources'

export const DEFAULT_CMD_DIR = 'cmd'
export const DEFAULT_CMD_COMMANDS_DIR = 'commands'
export const DEFAULT_ENGINE_VIEWS_REPOSITORY = 'views'
export const DEFAULT_APP_BUILD_DIR = 'build'
export const DEFAULT_ENV_FILE_NAME = 'env.ts'

export const APP_CONFIG: AppConfigInterface = Object.freeze({
    rootDir: '',
    envFileName: DEFAULT_ENV_FILE_NAME,
    buildDirName: DEFAULT_APP_BUILD_DIR,
    cli: {},
    store: true,
    storeName: CLIENT_STORE_NAME,
    stateName: CLIENT_STATE_NAME,
    httpClient: {},
    fetchDataOnRequest: true,
    routes: {},
    engine: Engine,
    engineConfig: {},
    httpResponder: HttpResponder,
    session: {
        secret: $.random.hex()
    },
    orm: {},
    database: DEFAULT_DATABASE_REPOSITORY,
    static: DEFAULT_STATIC_REPOSITORY,
    staticIndex: DEFAULT_STATIC_INDEX,
    exception: {
        resolve: AppExceptionResolve,
        types: {
            http: HttpException,
            runtime: RuntimeException,
        },
        handlers: {
            http: HttpExceptionHandler,
            runtime: RuntimeExceptionHandler,
        },
        log: ExceptionLog,
    },
    loaders: {
        app_builder: AppBuilderLoader,
        http: HttpClientLoader,
        http_form: HttpFormDataLoader,
        http_service: HttpServiceLoader,
        http_respond: HttpRespondLoader,
        controller: ControllerLoader,
        model: ModelLoader,
        store: StoreLoader,
        service: ServiceLoader,
        session: SessionLoader,
        engine: EngineLoader,
        static: StaticLoader,
        orm: OrmLoader,
        cmd: CommandLineLoader,
        exception_handler: ExceptionHandlerLoader,
        exception_log: ExceptionLogLoader,
        exception_template: ExceptionTemplateLoader
    },
    reference: {
        service: (app: App, target: string, props?: any[]) => app.get('service').require(target).call(props),
        model: (app: App, target: string, props?: any[]) => app.get('model').require(target).call(props),
    },
    formData: {}
})

export class AppConfig {

    protected _config: AppConfigInterface

    constructor() {
        this._config = {...APP_CONFIG}
    }

    get get (): AppConfigInterface {
        return {...this._config}
    }

    getStrict(keyPathDotted: string) {
        return object.get(this._config, keyPathDotted) ?? object.get({...APP_CONFIG}, keyPathDotted)
    }

    set(config: AppConfigInterface) {
        this._config = object.merge(this._config, config)
        this.validate()
        return this
    }

    private validate() {
        this._config.rootDir = $.trimPath(this._config.rootDir)

        if (!this._config.rootDir || !fs.isDir(this._config.rootDir)) {
            throw new RuntimeException('AppConfig: The App Root directory is not defined or does not exist.')
        }
    }
}

export const getSourcesDir = (path?: string) => {
    const dir = fs.path(__dirname, '../../sources')
    const localDir = fs.path(__dirname, '../sources')
    const resolve = fs.isDir(dir) ? dir : fs.isDir(localDir) ? localDir : null
    return resolve ? (path ? fs.path(resolve, path) : resolve) : null
}

export const getSources = (path: string, callback: Function, onError?: Function) => {
    const dir = getSourcesDir(path)
    dir && fs.dir(dir).forEach(file => fs.isFile(file) ? callback(file) : onError && onError())
}

export const getSource = (filePathFromSourceDir: string, callback: Function, onError?: Function) => {
    const dir = getSourcesDir()
    const path = fs.path(dir, filePathFromSourceDir)
    fs.isFile(path) ? callback(path) : onError && onError()
}
