import {typeOrmConfig} from "../../../core/orm";

const _path = require('path')

/**
 * See ORM supporting docs: https://knexjs.org/guide/
 */
export = <typeOrmConfig>Object.freeze({
    // SQLite
    client: 'better-sqlite3', // or 'sqlite3'
    connection: {
        /**
         * You can also run either SQLite3 or Better-SQLite3 with an in-memory database by providing filename: ":memory:"
         * !!! Not recommended to use this option in production because of the memory leak and data losses
         */
        filename: _path.resolve(__dirname, '../database/sample.sqlite')
    },
    useNullAsDefault: true,

    // MySQL
    // client: 'mysql',
    // connection: {
    //     host : '127.0.0.1',
    //     port : 3306,
    //     user : 'root',
    //     password : '',
    //     database : 'nodart'
    // },

    // PostgreSQL
    // client: 'pg',
    // connection: 'postgres://YourUserName:YourPassword@YourHostname:5432/YourDatabaseName', // 'postgres://postgres:@127.0.0.1:5432/nodart'

    //// Oracle
    // client: 'oracledb',
    // connection: {/*...*/},
    // fetchAsString: [ 'number', 'clob' ]
})
