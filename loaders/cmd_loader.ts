import {App} from "../core/app";
import {AppLoader} from "../core/app_loader";
import {CommandLine} from "../core/cmd";

export class CommandLineLoader extends AppLoader {

    protected _onCall(target: any, args?: any[]): void {
    }

    protected _onGenerate(repository: string): void {

        this._init()
    }

    protected _resolve(target?: any, args?: any[]): any {

        return this._init()
    }

    protected _init(app?: App) {

        return new CommandLine(app ?? this._app).system.init()
    }

}
