import {AppLoader} from "../core/app_loader";
import {DIReferenceEntries} from "./di";
import {SessionConfigInterface} from "./session";
import {EngineConfigInterface} from "./engine";
import {OrmConfig} from "./orm";
import {
    HttpClientConfigInterface,
    HttpResponseDataInterface,
    HttpFormDataConfigInterface
} from "./http";
import {CommandLineConfigInterface} from "./cmd";
import {RouteEntry} from "./router";
import {Exception, ExceptionHandler, ExceptionLog} from "../core/exception";
import {AppExceptionResolve} from "../core/app";
import {Engine} from "../core/engine";
import {HttpResponder} from "../core/http_respond";

export type AppLoaders =
    | 'app_builder'
    | 'http'
    | 'http_form'
    | 'http_service'
    | 'http_respond'
    | 'controller'
    | 'model'
    | 'store'
    | 'service'
    | 'session'
    | 'engine'
    | 'static'
    | 'orm'
    | 'cmd'
    | 'exception_handler'
    | 'exception_log'
    | 'exception_template'
    | string

export type AppExceptions = 'http' | 'runtime' | string

export interface AppEnvInterface {
    data: AppConfigInterface
    tsConfig: any
}

export interface AppConfigInterface {
    rootDir?: string
    envFileName?: string
    buildDirName?: string
    store?: string | boolean
    storeName?: string
    stateName?: string
    routes?: RouteEntry
    fetchDataOnRequest?: boolean
    loaders?: {
        [K in AppLoaders]?: typeof AppLoader
    }
    reference?: DIReferenceEntries
    session?: SessionConfigInterface
    engine?: typeof Engine
    engineConfig?: EngineConfigInterface
    httpResponder?: typeof HttpResponder
    orm?: { [key: string]: any } & OrmConfig
    httpClient?: HttpClientConfigInterface
    database?: string
    static?: string
    staticIndex?: string
    cli?: CommandLineConfigInterface
    exception?: {
        types?: { [K in AppExceptions]?: typeof Exception }
        handlers?: { [K in AppExceptions]?: typeof ExceptionHandler }
        log?: typeof ExceptionLog
        resolve?: typeof AppExceptionResolve
        template?: string | ((response: HttpResponseDataInterface) => string | void)  // Path to html (from views directory)
    }
    formData?: HttpFormDataConfigInterface

    [addon: string]: any
}
