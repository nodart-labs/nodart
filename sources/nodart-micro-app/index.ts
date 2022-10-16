import {App, nodart} from "nodart"

const config: nodart.app.AppConfigInterface = {
    rootDir: __dirname,
    // See session supporting docs: https://github.com/mozilla/node-client-sessions
    session: {
        secret: 'MY_SUPER_STRONG_SECRET_KEY', // (!!!) CHANGE THIS OPTION IN PRODUCTION ENVIRONMENT (should be a large unguessable string)
        duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
        activeDuration: 1000 * 60 * 5 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds,
    },
    /*
    // See ORM supporting docs: https://knexjs.org/guide/
    orm: {
        client: 'better-sqlite3', // or 'sqlite3'
        connection: {
            filename: require("path").resolve(__dirname, 'database/sample.sqlite')
        },
        useNullAsDefault: true,
    },*/
    /*
    exception: {
        /!****************************************************************************************
         Uncomment this line and set another path to your exception.html or leave it as is.
         This option provides template for view data from Exception. (under the "views" folder)
         ****************************************************************************************!/
        // template: 'exception' // or (response: nodart.http.HttpResponseDataInterface) => stringPathToTemplate
    },*/
}

const {app, http, server} = new App({...config}).start(3000)

http.get('/', ({
    app,
    http,
    session,
    route,
    model,
    service,
    respond,
    controller
}) => {

    return {}

})
