import {AppLoader} from "../core/app_loader";
import {Session} from "../core/session";
import {SessionClientConfigInterface} from "../core/interfaces/session";
import {HttpContainerInterface} from "../core/interfaces/http";

export class SessionLoader extends AppLoader {

    call(args: [http: HttpContainerInterface, config?: SessionClientConfigInterface]): Session {

        return this.getSession(args[0], args[1])
    }

    getSessionConfig(config?: SessionClientConfigInterface): SessionClientConfigInterface {

        return config

            ? {...this.app.config.get.http?.session?.config || {}, ...config} as SessionClientConfigInterface

            : this.app.config.get.http?.session?.config || {} as SessionClientConfigInterface
    }

    getSession(http: HttpContainerInterface, config?: SessionClientConfigInterface): Session {

        config = this.getSessionConfig(config)

        return typeof this.app.config.get.http?.session?.client === 'function'

            ? this.app.config.get.http.session.client(config, http)

            : new Session(config).load(http)
    }

    onCall() {
    }

    onGenerate(repository: string) {
    }

}
