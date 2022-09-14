import {AppLoader} from "../core/app_loader";
import {CommandLine} from "../core/cmd";
import {DEFAULT_CMD_DIR, DEFAULT_CMD_COMMANDS_DIR, getSourcesDir} from "../core/app_config";
import {fs} from "../utils";

export class CommandLineLoader extends AppLoader {

    protected _repository = DEFAULT_CMD_DIR

    protected _onCall(target: any, args?: any[]): void {
    }

    protected _onGenerate(repository: string): void {

        const cmdDir = require('path').resolve(repository, this._app.config.get.cli.commandDirName || DEFAULT_CMD_COMMANDS_DIR)

        this._loadSource()

        fs.isDir(cmdDir) || fs.mkDeepDir(cmdDir)
    }

    protected _resolve(target?: any, args?: any[]): any {

        this._loadSource()

        return new CommandLine(args?.[0] ?? this._app)
    }

    protected _loadSource() {

        const dest = this.getRepo() + '/index.js'

        fs.isFile(dest) || fs.copy(getSourcesDir('cmd/index.js'), dest)
    }

}
