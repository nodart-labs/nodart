import {DataProviderInterface} from "../orm/data_provider_interface";

export type typeModelConstruct = {}

export class ModelBehavior {

    constructor(protected _model: Model) {
    }
}

export class Model {

    protected _provider: DataProviderInterface

    constructor(construct?: typeModelConstruct) {
    }

    setProvider(provider: DataProviderInterface) {
        this._provider = provider
    }

}
