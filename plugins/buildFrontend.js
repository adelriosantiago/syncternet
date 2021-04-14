const fs = require("fs")
const tailwindScoped = fs.readFileSync("./vendor/tailwind.min.css", { encoding: "utf8", flag: "r" })

const { readdirSync } = require("fs")
const getDirectories = (source) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory()) // TODO: Call from file along with backend file
    .map((dirent) => dirent.name)

const plugins = getDirectories("./plugins")

let frontendExport = { plugins: {} }
for (const p of plugins) {
  frontendExport.plugins[p] = {} // TODO: Simplify into a single object line
  frontendExport.plugins[p].html = fs.readFileSync(`./plugins/${p}/template.html`, "utf8")
  frontendExport.plugins[p].middleware = {}
  frontendExport.plugins[p].script = fs.readFileSync(`./plugins/${p}/frontend.js`, "utf8")
  frontendExport.style = tailwindScoped
  fs.writeFileSync("./plugins/frontendExport.js", `module.exports = ${JSON.stringify(frontendExport)}`)
}
