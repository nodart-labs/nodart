#!/usr/bin/env node

const {App} = require('../dist')

const rootDir = process.cwd()

const app = new App({rootDir})

const cmd = app.get('cmd').call()

cmd.system.run()
