import {$, fs} from "../utils"
import {AppLoader} from "../core/app_loader";
import {CLIENT_STATE_NAME, getSamples} from "../core/app_config";

export class StoreLoader extends AppLoader {

    protected _onCall(target: any) {
    }

    protected _onGenerate(repository: string) {
        repository = this._app.factory.storeRepo
        repository && (this._repository = repository)
    }

    protected _resolve() {
        const repo = this.getRepo()
        if (!repo) return

        const state = $.trimPath(this._app.config.get.stateName) || CLIENT_STATE_NAME
        const dest = repo + '/' + $.trim(state, ['.js', '.ts'])

        getSamples('store').forEach(samp => {
            fs.isFile(samp) && !fs.isFile(dest, ['js', 'ts']) && fs.copy(samp, dest + '.ts')
        })
    }

}
