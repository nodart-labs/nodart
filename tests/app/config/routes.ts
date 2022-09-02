import {typeRoute} from "../../../core/router";

export = <typeRoute>{
    index: [
        {
            name: 'index',
            path: '/',
        }
    ],
    sample: 'sample',
    sample2: [
        '/:foo?/:+id'
    ]
}
