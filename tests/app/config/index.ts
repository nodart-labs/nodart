import { AppConfigInterface } from "../../../core/interfaces/app";

const orm = require("./database");
const routes = require("./routes");

export = <AppConfigInterface>Object.freeze({
  rootDir: require("path").resolve(__dirname, ".."),
  http: {
    /**
     * See session supporting docs: https://github.com/mozilla/node-client-sessions
     */
    session: {
      config: {
        secret: "MY_SUPER_STRONG_SECRET_KEY", // (!!!) CHANGE THIS OPTION IN PRODUCTION ENVIRONMENT (should be a large unguessable string)
        duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
        activeDuration: 1000 * 60 * 5, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
      },
    },
  },
  /**
   * See ORM supporting docs: https://knexjs.org/guide/
   */
  orm,
  routes,
  exception: {
    template: "exception",
  },
  static: {
    // serve: false
  },
});
