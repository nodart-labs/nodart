import {AppLoader} from "../core/app_loader";
import {Exception, ExceptionHandler} from "../core/exception";
import {RuntimeException} from "../core/exception";

export class ExceptionHandlerLoader extends AppLoader {

    protected _target: ExceptionHandler

    protected _onCall(target: any, args?: any[]) {
    }

    protected _resolve(target?: any, args?: any[]): any {

        const exception = args[0] instanceof Exception ? args[0] : new RuntimeException({
            exceptionMessage: typeof args[0] === 'string' ? args[0] : args[0]?.message ?? '',
            exceptionData: args[0]
        })

        const handler = this._getExceptionHandler(exception)

        return this._target = handler ? Reflect.construct(handler, [exception]) : undefined
    }

    protected _onGenerate(repository: string) {
    }

    protected _getExceptionHandler(exception: Exception): typeof ExceptionHandler | undefined {

        const exceptions = this._app.config.get.exception.types ?? {}
        const handlers = this._app.config.get.exception.handlers ?? {}

        for (const [key, value] of Object.entries(exceptions)) {
            if (exception instanceof value) {
                return handlers[key]
            }
        }
    }

}
