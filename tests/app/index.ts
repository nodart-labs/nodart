const App = require('../../core/app').App
const config = require('./config')

new App({...config}).init().then(app => app.serve(3000))
