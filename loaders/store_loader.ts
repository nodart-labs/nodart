import {$, fs} from "../utils"
import {AppLoader} from "../core/app_loader";
import {CLIENT_STATE_NAME, getSourcesDir} from "../core/app_config";
import {App} from "../core/app";

export class StoreLoader extends AppLoader {

    constructor(app: App) {
        super(app)

        const repository = app.service.store.repo
        repository && (this.repository = repository)
    }

    onGenerate(repository: string) {

        if (!repository) return

        const ext = this.app.env.isCommonJS ? '.js' : '.ts'
        const state = $.trimPath(this.app.config.get.stateName) || CLIENT_STATE_NAME
        const dest = repository + '/' + state + ext

        fs.isFile(dest) || fs.copy(getSourcesDir('store/app' + ext), dest)
    }

}
