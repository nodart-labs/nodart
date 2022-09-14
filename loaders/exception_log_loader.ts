import {AppLoader} from "../core/app_loader";
import {ExceptionLog} from "../core/exception";

export class ExceptionLogLoader extends AppLoader {

    protected _onCall(target: any, args?: any[]) {
    }

    protected _resolve(target?: any, args?: any[]): any {

        return Reflect.construct(this._app.config.get.exception.log ?? ExceptionLog, [args[0]])
    }

    protected _onGenerate(repository: string) {
    }

}
