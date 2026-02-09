//
// Build plugins and store them into a JSON file so that it is browserify-able by the client.
//

import fs from "fs"
import path from "path"
import * as cheerio from "cheerio"

import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
const __dirname = dirname(fileURLToPath(import.meta.url))

const pluginsFolder = path.join(__dirname, "..", "plugins")

const readFrontend = (pluginPath) => {
  const frontendPath = path.join(pluginPath, "frontend.html")
  const content = fs.readFileSync(frontendPath, "utf8")
  const $ = cheerio.load(content, { xmlMode: false, decodeEntities: false })

  return {
    html: $("template").first().html()?.trim() ?? "",
    script: $("script").first().html()?.trim() ?? "",
  }
}

const plugins = fs
  .readdirSync(pluginsFolder)
  .filter((f) => fs.lstatSync(path.join(pluginsFolder, f)).isDirectory())
  .map((p) => ({
    [p]: {
      ...readFrontend(path.join(pluginsFolder, p)),
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
