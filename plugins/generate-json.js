//
// Build plugins and store them into a JSON file so that it is browserify-able by the client.
//

const fs = require("fs")
const path = require("path")

const pluginsFolder = path.join(__dirname, "..", "plugins")
const plugins = fs
  .readdirSync(pluginsFolder)
  .filter((f) => fs.lstatSync(path.join(pluginsFolder, f)).isDirectory())
  .map((p) => ({
    [p]: {
      // TODO: Standarize names, template -> html, frontend -> script, etc
      html: fs.readFileSync(path.join(pluginsFolder, p, "template.html"), "utf8"),
      script: fs.readFileSync(path.join(pluginsFolder, p, "frontend.js"), "utf8"),
      back: fs.readFileSync(path.join(pluginsFolder, p, "backend.js"), "utf8"),
    },
  }))
  .reduce((a, c) => {
    a[Object.keys(c)[0]] = Object.values(c)[0]
    return a
  }, {})

console.info("Syncternet - Plugins exported:", Object.keys(plugins))

// Write file to exports
fs.writeFileSync(path.join(__dirname, "json-plugins.json"), JSON.stringify(plugins))
