const fs = require("node:fs");
const path = require("node:path");
const decompress = require("decompress");

module.exports = async ({ app }) => {
  const source = path.resolve(__dirname, "../../sources/nodart-app.zip");

  await decompress(source, app.rootDir)
    .then(() => {
      const err =
        "Warning: Failed to apply package version from existing source.";

      console.log("done!");

      try {
        const packJson = app.rootDir + "/package.json";

        if (!fs.existsSync(packJson)) return;

        const pack = JSON.parse(
          fs.readFileSync(packJson, { encoding: "utf-8" }),
        );

        if (!pack?.dependencies?.nodart) {
          console.log(err);

          return process.exit();
        }

        const ver = (str, v) =>
          str.replace(/("nodart")(\s*:\s*")([^"]+)/, `$1$2${v}`);

        const appPackage = fs.readFileSync(
          app.rootDir + "/nodart-app/package.json",
          { encoding: "utf-8" },
        );

        fs.writeFileSync(
          app.rootDir + "/nodart-app/package.json",
          ver(appPackage, pack.dependencies.nodart),
          { encoding: "utf-8" },
        );
      } catch (e) {
        console.log(err);
      }
    })
    .catch(() => {
      console.error("Failed to unpack base application resource file.");
    });
};
