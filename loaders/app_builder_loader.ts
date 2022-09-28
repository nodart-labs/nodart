import {AppLoader} from "../core/app_loader";
import {App, AppBuilder} from "../core/app";

export class AppBuilderLoader extends AppLoader {

    protected _onCall(target: any, args?: any[]): void {
    }

    protected _onGenerate(repository: string): void {
    }

    protected _resolve(target?: any, args?: [app?: App]): any {

        return new AppBuilder(args?.[0] ?? this._app)
    }

}
