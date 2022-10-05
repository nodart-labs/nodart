import {AppLoader} from "../core/app_loader";
import {Session} from "../core/session";
import {SessionConfigInterface} from "../interfaces/session";
import {BaseHttpResponseInterface} from "../interfaces/http";

export class SessionLoader extends AppLoader {

    protected _onCall(target: any) {
    }

    protected _onGenerate(repository: string) {
    }

    protected _resolve(target?: any, args?: [http: BaseHttpResponseInterface, config: SessionConfigInterface]): Session {

        return new Session(args?.[1] ?? this._app.config.get.session).load(args[0])
    }

}
