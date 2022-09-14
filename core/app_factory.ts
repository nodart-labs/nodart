import {App} from './app'
import {AppStore} from "./app_store";
import {CLIENT_STORE, SYSTEM_LISTENERS, SYSTEM_STORE, SYSTEM_STORE_NAME} from "./app_config";
import {AppLoaders} from "../interfaces/app";
import {AppLoader} from "./app_loader";

const events = require('../store/system').events

export class AppFactory {

    constructor(protected _app: App) {
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
        repo && store && AppStore.add(store, this._app.rootDir + '/' + repo)
    }

    createState() {
        App.system.store || AppStore.add(SYSTEM_STORE_NAME, __dirname + '/../' + SYSTEM_STORE)
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
        const loader = this._app.config.getStrict(`loaders.${name}`)
        return Reflect.construct(loader, [this._app])
    }

}
