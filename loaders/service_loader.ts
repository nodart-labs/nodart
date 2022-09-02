import {AppLoader} from "../core/app_loader";
import {Service} from "../core/service";

export class ServiceLoader extends AppLoader {

    protected _repository = 'services'

    protected get targetType() {

        return Service
    }

    protected _onCall(target: any) {
    }

    protected _onGenerate(repository: string) {
    }

}
