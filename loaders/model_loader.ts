import {AppLoader} from "../core/app_loader";
import {BaseModelInterface} from "../interfaces/orm";
import {Orm} from "../core/orm";
import {Model} from "../core/model";

export class ModelLoader extends AppLoader {

    protected _repository = 'models'

    protected _scope = {
        queryBuilder: null,
        orm: null,
    }

    protected get targetType() {

        return Model
    }

    protected _onCall(target: any) {
    }

    protected _onGenerate(repository: string) {
    }

    protected _resolve(target: BaseModelInterface, args?: any[]): BaseModelInterface | void {

        const model = super._resolve(target, args) as Model

        if (!(model instanceof Model)) return

        Object.defineProperty(model, 'orm', {
            get: () => this._scope.orm ||= this._app.get('orm').call() as Orm,
            set: (value) => this._scope.orm = value,
            enumerable: true,
            configurable: true
        })

        Object.defineProperty(model, 'queryBuilder', {
            get: () => this._scope.queryBuilder ||= model.orm?.queryBuilder,
            set: (value) => this._scope.queryBuilder = value,
            enumerable: true,
            configurable: true
        })

        return model
    }

}
