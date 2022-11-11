import {App} from "../core/app";
import {AppLoader} from "../core/app_loader";
import {CommandLine} from "../core/cmd";

export class CommandLineLoader extends AppLoader {

    onCall(target: any, args?: any[]): void {
    }

    onGenerate(repository: string): void {

        this._init()
    }

    call(args?: [app: App]): CommandLine {

        return this._init(args?.[0])
    }

    protected _init(app?: App) {

        return new CommandLine(app ?? this.app).system.init()
    }

}
