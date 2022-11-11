import {AppLoader} from "../core/app_loader";
import {HttpContainer, HttpFormData} from "../core/http_client";
import {HttpFormDataClientConfigInterface} from "../core/interfaces/http";

export class HttpFormDataLoader extends AppLoader {

    call(args: [http: HttpContainer, config?: HttpFormDataClientConfigInterface]): HttpFormData {

        const config = (args?.[1] || this.app.config.get.http?.form || {}) as HttpFormDataClientConfigInterface

        return new HttpFormData(args[0], config)
    }

    onCall() {
    }

    onGenerate(repository: string) {
    }

}
