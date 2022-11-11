import {AppLoader} from "../core/app_loader";
import {ExceptionLog} from "../core/exception";

export class ExceptionLogLoader extends AppLoader {

    call(args: [exception: any]): any {

        return Reflect.construct(this.app.config.get.exception?.log || ExceptionLog, [args[0]])
    }

    onCall() {
    }

    onGenerate(repository: string) {
    }
}
