import {App} from "../../core/app";
const config = require('./config')

new App({...config}).init().then(app => app.serve(3000))
