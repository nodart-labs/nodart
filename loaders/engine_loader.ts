import {AppLoader} from "../core/app_loader";


export class EngineLoader extends AppLoader {

    protected _repository = 'views'

    protected _onCall(target: any, args?: any[]): void {
    }

    protected _onGenerate(repository: string): void {
    }

}
