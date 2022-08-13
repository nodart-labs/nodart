import {DataProviderInterface} from "../data_provider_interface";

export class FileDataProvider implements DataProviderInterface {

    get() {
        return ''
    }

    list() {
        return [{}]
    }

    update() {
        return ''
    }

    delete() {
        return false
    }

}
