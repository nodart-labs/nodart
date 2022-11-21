import {AppLoader} from "../core/app_loader";
import {Service} from "../core/service";
import {ServiceScope} from "../core/interfaces/service";

export class ServiceLoader extends AppLoader {

    protected _repository = 'services'

    get sourceType() {

        return Service
    }

    call(args?: [scope: ServiceScope], path?: string, rootDir?: string): any {

        return this.resolve(path ? this.load(path, Service, rootDir) : this._source, args)
    }

    onGenerate(repository: string) {
    }

}
