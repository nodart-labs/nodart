const fs = require("node:fs");
const path = require("node:path");
const decompress = require("decompress");

module.exports = ({ cmd }) => {
  const isJS = !!cmd.command.options.js;

  const source = isJS
    ? "../../sources/micro-app-js"
    : "../../sources/micro-app";

  if (!fs.existsSync(path.resolve(__dirname, source))) {
    console.log("Failed to retrieve app source.");
    process.exit(1);
  }

  const dest = path.resolve(process.cwd(), "nodart-app");

  fs.cp(
    path.resolve(__dirname, source),
    dest,
    { recursive: true },
    async (err) => {
      if (err) {
        console.log("Failed to create app.");
        console.log(err);
        process.exit(1);
      }

      const license = path.resolve(__dirname, "../../LICENSE");
      const gitignore = path.resolve(__dirname, "../../sources/gitignore.zip");

      fs.existsSync(license) &&
        fs.copyFile(license, path.resolve(dest, "LICENSE"), () => {});

      fs.existsSync(gitignore) && (await decompress(gitignore, dest));

      console.log(`A new application created by path: ${dest}`);

      process.exit();
    },
  );
};
