const { App } = require("nodart");

const config = {
  rootDir: __dirname,
  http: {
    useCors: false, // CORS Headers are disabled by default. Switch on this option if needed.
    session: {
      // See session supporting docs: https://github.com/mozilla/node-client-sessions
      config: {
        secret: "MY_SUPER_STRONG_SECRET_KEY", // (!!!) CHANGE THIS OPTION IN PRODUCTION ENVIRONMENT (should be a large unguessable string)
        duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
        activeDuration: 1000 * 60 * 5, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
      },
    },
  },
  // See ORM supporting docs: https://knexjs.org/guide/
  orm: {
    client: "better-sqlite3", // or 'sqlite3'
    connection: {
      filename: require("node:path").resolve(
        __dirname,
        "database/sample.sqlite",
      ),
    },
    useNullAsDefault: true,
  },
  exception: {
    /* Uncomment this line and set another path to your exception.html or leave it as is. */
    /* This option provides template (under the "views" folder) for view data from Exception on client side. */
    // template: 'exception' // or (response: nodart.http.HttpResponseDataInterface) => 'string/path'
  },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
new App({ ...config }).start(3000).then(({ app, http, server }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  http.get("/", ({ app, http, route, model, service, controller }) => {
    return {};
  });
});
