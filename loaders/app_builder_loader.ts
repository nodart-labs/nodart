import {AppLoader} from "../core/app_loader";
import {App, AppBuilder} from "../core/app";

export class AppBuilderLoader extends AppLoader {

    onCall(target: any, args?: any[]): void {
    }

    onGenerate(repository: string): void {
    }

    call(args: [app?: App]): any {

        return new AppBuilder(args?.[0] ?? this.app)
    }

}
