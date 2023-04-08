#!/usr/bin/env node

const { App } = require("nodart");

const app = new App({
  // INSERT YOUR APPLICATION's CONFIGURATION IN HERE
  rootDir: process.cwd(),
});

const cmd = app.get("cmd").call();

cmd.run();
