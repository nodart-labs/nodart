import {$, fs} from "../utils"
import {AppLoader} from "../core/app_loader";
import {CLIENT_STATE_NAME, getSourcesDir} from "../core/app_config";
import {App} from "../core/app";

export class StoreLoader extends AppLoader {

    constructor(app: App) {
        super(app)

        const repository = app.factory.storeRepo
        repository && (this._repository = repository)
    }

    protected _onCall(target: any) {
    }

    protected _onGenerate(repository: string) {

        if (!repository) return

        const state = $.trimPath(this._app.config.get.stateName) || CLIENT_STATE_NAME
        const dest = repository + '/' + state + '.ts'

        fs.isFile(dest) || fs.copy(getSourcesDir('store/app.ts'), dest)
    }

}
