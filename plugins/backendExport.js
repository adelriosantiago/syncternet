const { readdirSync } = require("fs")
const getDirectories = (source) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory()) // TODO: Dryfy with front, load from file
    .map((dirent) => dirent.name)
const plugins = getDirectories("./plugins")

let backendExport = { plugins: {} }
for (const p of plugins) {
  backendExport.plugins[p] = {}
  backendExport.plugins[p].middleware = require(`./${p}/backend.js`) // TODO: simplify object, use only one line
}

module.exports = backendExport
