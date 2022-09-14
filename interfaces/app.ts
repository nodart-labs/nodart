import {AppLoader} from "../core/app_loader";
import {DIReferenceEntries} from "./di";
import {SessionConfigInterface} from "./session";
import {EngineConfigInterface} from "./engine";
import {OrmConfig} from "./orm";
import {HttpClientConfigInterface} from "./http";
import {CommandLineConfigInterface} from "./cmd";
import {RouteEntry} from "./router";
import {Exception, ExceptionHandler, ExceptionLog} from "../core/exception";
import {AppExceptionResolve} from "../core/app";

export type AppLoaders =
    | 'http'
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
    | string

export type AppExceptions = 'http' | 'runtime' | string

export interface AppConfigInterface {
    rootDir?: string,
    store?: string | boolean,
    storeName?: string,
    stateName?: string,
    routes?: RouteEntry,
    loaders?: {
        [K in AppLoaders]?: typeof AppLoader
    },
    reference?: DIReferenceEntries,
    session?: SessionConfigInterface,
    engine?: EngineConfigInterface,
    orm?: { [key: string]: any } & OrmConfig,
    httpClient?: HttpClientConfigInterface,
    database?: string,
    static?: string,
    staticIndex?: string,
    cli?: CommandLineConfigInterface,
    exception?: {
        types?: {[K in AppExceptions]?: typeof Exception}
        handlers?: {[K in AppExceptions]?: typeof ExceptionHandler},
        log?: typeof ExceptionLog,
        resolve?: typeof AppExceptionResolve
    },
    [addon: string]: any,
}
