import {AppLoader} from "../core/app_loader";

export class MiddlewareLoader extends AppLoader {

    protected _repository = 'middleware'

    protected _onCall(target: any) {
    }

    protected _onGenerate(repository: string) {
    }

}
