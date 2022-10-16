import {App} from './app'
import {AppStore} from "./app_store";
import {AppLoader} from "./app_loader";
import {AppConfigInterface, AppEnvInterface, AppLoaders} from "../interfaces/app";
import {
    CLIENT_STORE,
    DEFAULT_ENV_FILE_NAME,
    SYSTEM_LISTENERS,
    SYSTEM_STORE,
    SYSTEM_STORE_NAME
} from "./app_config";
import {fs, $} from "../utils";
import {RuntimeException} from "./exception";

const events = require('../store/system').events

export class AppFactory {

    private envFileNamePattern: RegExp = /^[A-z\d.-_]+(\.ts|\.js)$/

    private tsConfigFileName: string = 'tsconfig.json'

    private _env: AppEnvInterface

    constructor(protected _app: App) {
    }

    get baseDir() {
        return fs.isFile(fs.path(this._app.rootDir, this.tsConfigFileName)) ? this._app.rootDir : process.cwd()
    }

    get env(): AppEnvInterface {
        return this._env ||= {
            data: this.envData as AppConfigInterface,
            tsConfig: this.tsConfig
        }
    }

    get envData(): AppConfigInterface {
        const data = fs.include(this.envFile, {
            log: false,
            skipExt: true,
            error: () => {
                throw new RuntimeException(`No environment data found on the path "${this.envFile}"`)
            }
        })
        return $.isPlainObject(data) ? data : {}
    }

    get envFileName() {
        const name = this._app.config.get.envFileName || DEFAULT_ENV_FILE_NAME
        if (!name.match(this.envFileNamePattern))
            throw new RuntimeException(
                `The environment file name "${name}" does not have a permitted name or extension (.js or .ts).`
                + ' Check the configuration parameter "envFileName".'
            )
        return name
    }

    get envFile() {
        return fs.path(this._app.rootDir, this.envFileName)
    }

    get tsConfig() {
        return fs.json(fs.path(this.baseDir, this.tsConfigFileName)) ?? {}
    }

    get tsConfigExists(): boolean {
        return fs.isFile(fs.path(this.baseDir, this.tsConfigFileName))
    }

    get storeData() {
        return {
            store: this._app.config.get.storeName,
            state: this._app.config.get.stateName,
            repo: this.storeRepo
        }
    }

    get storeRepo() {
        const repo = this._app.config.get.store
        return typeof repo === 'boolean' ? (repo ? CLIENT_STORE : '') : repo
    }

    async createApp() {
        for (const loader of Object.keys(this._app.config.getStrict('loaders'))) {
            await this.createLoader(loader as AppLoaders).generate()
        }
    }

    createStore() {
        const {store, repo} = this.storeData
        repo && store && AppStore.add(store, fs.path(this._app.rootDir, repo))
    }

    createState() {
        App.system.store || AppStore.add(SYSTEM_STORE_NAME, fs.path(__dirname, '../' + SYSTEM_STORE))
        App.system.state.app || App.system.setup({app: this._app})
    }

    createEventListener() {
        App.system.on({
            event: {
                [events.HTTP_REQUEST]: SYSTEM_LISTENERS[events.HTTP_REQUEST],
                [events.HTTP_RESPONSE]: SYSTEM_LISTENERS[events.HTTP_RESPONSE]
            }
        })
    }

    createLoader(name: AppLoaders): AppLoader {
        return Reflect.construct(this._app.config.getStrict(`loaders.${name}`), [this._app])
    }

}
