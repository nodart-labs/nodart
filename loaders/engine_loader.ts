import {AppLoader} from "../core/app_loader";
import {DEFAULT_ENGINE_VIEWS_REPOSITORY} from "../core/app_config";
import {App} from "../core/app";
import {Engine} from "../core/engine";
import {EngineConfigInterface} from "../interfaces/engine";

export class EngineLoader extends AppLoader {

    protected _repository = DEFAULT_ENGINE_VIEWS_REPOSITORY

    protected _engine: typeof Engine

    protected get targetType() {

        return Engine
    }

    constructor(protected _app: App) {
        super(_app)

        this._repository = _app.config.get.engineConfig?.views ?? DEFAULT_ENGINE_VIEWS_REPOSITORY
    }

    protected _onCall(target: any): void {

        this._engine = target ?? this._app.config.get.engine ?? Engine
    }

    protected _resolve(target?: any, args?: [config: EngineConfigInterface]): any {

        return new this._engine(args?.[0] ?? this.getEngineConfig())
    }

    getEngineConfig(): any {

        const config = {...this._app.config.get.engineConfig ?? {}}

        config.views = this.getRepo()

        return config
    }

    protected _onGenerate(repository: string): void {
    }

}
