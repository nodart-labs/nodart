import {typeAppConfig} from "../../../core/app_config";

const orm = require('./database')
const routes = require('./routes')

const _path = require('path')

export = <typeAppConfig>Object.freeze({
    rootDir: _path.resolve(__dirname, '..'),
    /**
     * See session supporting docs: https://github.com/mozilla/node-client-sessions
     */
    session: {
        duration: 2 * 60 * 60 * 1000
    },
    /**
     * See ORM supporting docs: https://knexjs.org/guide/
     */
    orm,
    routes
})
