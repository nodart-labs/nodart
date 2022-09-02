import {AppLoader} from "../core/app_loader";
import {DEFAULT_ENGINE_VIEWS_REPOSITORY} from "../core/app_config";
import {App} from "../core/app";
import {Engine} from "../core/engine";

export class EngineLoader extends AppLoader {

    protected _repository = DEFAULT_ENGINE_VIEWS_REPOSITORY

    constructor(protected _app: App) {
        super(_app)
        this._repository = _app.config.get.engine?.views ?? DEFAULT_ENGINE_VIEWS_REPOSITORY
    }

    protected _resolve(target?: any, args?: any[]): any {

        return new Engine(args?.[0] ?? this.getEngineConfig())
    }

    getEngineConfig() {
        const config = {...this._app.config.get.engine ?? {}}
        config.views = this.getRepo()
        return config
    }

    protected _onCall(target: any, args?: any[]): void {
    }

    protected _onGenerate(repository: string): void {
    }

}
