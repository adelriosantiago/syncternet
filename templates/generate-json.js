import fs from "fs"
import path from "path"
import * as cheerio from "cheerio"

import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
const __dirname = dirname(fileURLToPath(import.meta.url))

const templatesFolder = __dirname

const readTemplate = (templatePath) => {
  const content = fs.readFileSync(templatePath, "utf8")
  const $ = cheerio.load(content, { xmlMode: false, decodeEntities: false })

  return $("template").first().html()?.trim() ?? content.trim()
}

const templates = fs
  .readdirSync(templatesFolder)
  .filter((f) => f.endsWith(".html"))
  .map((f) => ({ [f.replace(/\.html$/, "")]: readTemplate(path.join(templatesFolder, f)) }))
  .reduce((acc, current) => {
    acc[Object.keys(current)[0]] = Object.values(current)[0]
    return acc
  }, {})

console.info("Syncternet - Templates exported:", Object.keys(templates))

fs.writeFileSync(path.join(__dirname, "json-templates.json"), JSON.stringify(templates))
