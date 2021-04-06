const fs = require("fs")
const cheerio = require("cheerio")
const tailwindScoped = fs.readFileSync("./vendor/tailwind.min.css", { encoding: "utf8", flag: "r" })

let headers = require("./headers.js")
for (const p of Object.keys(headers.plugins)) {
  const content = fs.readFileSync(`./plugins/${p}.html`, "utf8")
  const $ = cheerio.load(content)
  headers.plugins[p].frontend.html = $("html").html()
  headers.plugins[p].frontend.script = $("script").html()
  headers.style = tailwindScoped
  fs.writeFileSync("./plugins/headersExport.js", JSON.stringify(headers))
}
