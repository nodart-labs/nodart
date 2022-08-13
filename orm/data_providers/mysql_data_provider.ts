import {DataProviderInterface} from "../data_provider_interface";

export class MysqlDataProvider implements DataProviderInterface {

    get () {
        return ''
    }

    list () {
        return [{}]
    }

    update () {
        return ''
    }

    delete() {
        return false
    }

}
