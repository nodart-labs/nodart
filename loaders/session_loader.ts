import {AppLoader} from "../core/app_loader";
import {Session} from "../core/session";

export class SessionLoader extends AppLoader {

    protected _onCall(target: any) {
    }

    protected _onGenerate(repository: string) {
    }

    protected _resolve(target?: any, args?: any[]): any {
        return new Session(this._app.config.get.session)
    }

}
