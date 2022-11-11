import {AppLoader} from "../app_loader";
import {DIReference} from "./di";
import {OrmConfig} from "./orm";
import {HttpContainerConfigInterface,HttpResponseDataInterface} from "./http";
import {CommandLineConfigInterface} from "./cmd";
import {RouteEntry} from "./router";
import {Exception, ExceptionHandler, ExceptionLog} from "../exception";
import {App, AppExceptionResolve, AppModule, AppModuleFacade} from "../app";
import {AppBuilderLoader} from "../../loaders/app_builder_loader";
import {HttpClientLoader} from "../../loaders/http_client_loader";
import {HttpFormDataLoader} from "../../loaders/http_form_data_loader";
import {HttpServiceLoader} from "../../loaders/http_service_loader";
import {ControllerLoader} from "../../loaders/controller_loader";
import {ModelLoader} from "../../loaders/model_loader";
import {StoreLoader} from "../../loaders/store_loader";
import {ServiceLoader} from "../../loaders/service_loader";
import {SessionLoader} from "../../loaders/session_loader";
import {EngineLoader} from "../../loaders/engine_loader";
import {StaticLoader} from "../../loaders/static_loader";
import {OrmLoader} from "../../loaders/orm_loader";
import {CommandLineLoader} from "../../loaders/cmd_loader";
import {ExceptionHandlerLoader} from "../../loaders/exception_handler_loader";
import {ExceptionLogLoader} from "../../loaders/exception_log_loader";
import {ExceptionTemplateLoader} from "../../loaders/exception_template_loader";
import {Server} from "http";

export type AppLoaders = {
    app_builder: AppBuilderLoader
    http: HttpClientLoader
    http_form: HttpFormDataLoader
    http_service: HttpServiceLoader
    controller: ControllerLoader
    model: ModelLoader
    store: StoreLoader
    service: ServiceLoader
    session: SessionLoader
    engine: EngineLoader
    static: StaticLoader
    orm: OrmLoader
    cmd: CommandLineLoader
    exception_handler: ExceptionHandlerLoader
    exception_log: ExceptionLogLoader
    exception_template: ExceptionTemplateLoader

    [addon: string]: AppLoader
}

export type AppStateLoaders = {
    static: StaticLoader
    http: HttpClientLoader
    httpService: HttpServiceLoader
    controller: ControllerLoader
    service: ServiceLoader
    model: ModelLoader
}

export type AppExceptions = 'http' | 'runtime' | string

export type AppServerProtocols = 'http' | 'https'

export type AppModules = {
    types?: Array<[
        type: typeof AppModule,
        config?: AppModuleConfigInterface
    ]>
    modules?: {
        [name: string]: [
            type: typeof AppModule,
            config?: AppModuleConfigInterface
        ]
    }
}

export type AppEmitterFacade<K extends keyof AppEmitterEvents> = (scope: AppEmitterEvents[K]) => App | void

export type AppEmitterEvents = {
    ON_START_SERVER?: {server: Server}
}

export interface AppModuleFacadeInterface {
    ON_START_SERVER?: AppEmitterFacade<'ON_START_SERVER'>

    [addon: string]: any
}

export interface AppModuleConfigInterface {
    facades?: {
        [key: string]: typeof AppModuleFacade
    }
    options: { [key: string]: unknown }
}

export interface AppConfigInterface {
    rootDir?: string
    envFilename?: string
    buildDirname?: string
    store?: string | boolean
    storeName?: string
    stateName?: string
    routes?: RouteEntry
    modules?: AppModules
    loaders?: {
        [K in keyof AppLoaders]?: typeof AppLoader
    }
    reference?: DIReference
    orm?: OrmConfig
    http?: HttpContainerConfigInterface
    cli?: CommandLineConfigInterface
    database?: string // database directory
    static?: {
        dirname?: string // static file's folder name
        index?: string // main static file (index.html by default)
        favicon?: string // favicon icon filename (favicon.ico by default)
    }
    exception?: {
        types?: { [K in AppExceptions]?: typeof Exception }
        handlers?: { [K in AppExceptions]?: typeof ExceptionHandler }
        log?: typeof ExceptionLog
        resolve?: typeof AppExceptionResolve
        template?: string | ((response: HttpResponseDataInterface) => string | void)  // Path to html (from views directory)
    }

    [addon: string]: any
}
