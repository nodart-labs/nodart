import {AppLoader} from "../core/app_loader";
import {DEFAULT_ENGINE_VIEWS_REPOSITORY} from "../core/app_config";
import {App} from "../core/app";
import {Engine} from "../core/engine";
import {EngineClientConfigInterface} from "../core/interfaces/engine";
import {fs} from "../utils";

export class EngineLoader extends AppLoader {

    protected _repository = DEFAULT_ENGINE_VIEWS_REPOSITORY

    constructor(readonly app: App) {
        super(app)

        this.repository = this.app.config.get.http?.engine?.config?.views || DEFAULT_ENGINE_VIEWS_REPOSITORY
    }

    call(args?: [config: EngineClientConfigInterface]): Engine {

        return this.getEngine(args?.[0])
    }

    getEngineConfig(config?: EngineClientConfigInterface): EngineClientConfigInterface {

        const engineConfig = {...this.app.config.get.http?.engine?.config || {}, ...config || {}}

        fs.isDir(engineConfig.views) || (engineConfig.views = this.getRepo())

        return engineConfig as EngineClientConfigInterface
    }

    getEngine(config?: EngineClientConfigInterface): Engine {

        config = this.getEngineConfig(config)

        return typeof this.app.config.get.http?.engine?.client === 'function'

            ? this.app.config.get.http.engine.client(config)

            : new Engine(config)
    }

    onGenerate(repository: string): void {
    }

}
