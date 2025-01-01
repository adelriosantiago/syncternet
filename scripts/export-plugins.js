// Re-builds plugins and creates a export file that includes the all built plugins *plus* a CSS-scoped version of Tailwind that plugins can use

const fs = require("fs")
const listdirs = require("listdirs")

// TODO: Use async
listdirs("./plugins", (err, plugins) => {
  if (err) return console.info(err)

  plugins.shift()
  plugins = plugins
    .map((f) => f.match(/\w+$/g)[0])
    .map((p) => ({
      [p]: {
        html: fs.readFileSync(`./plugins/${p}/template.html`, "utf8"),
        middleware: {},
        script: fs.readFileSync(`./plugins/${p}/frontend.js`, "utf8"),
      },
    }))
    .reduce((a, c) => {
      a[Object.keys(c)[0]] = Object.values(c)[0]
      return a
    }, {})

  fs.writeFileSync("./exports/syncternet-plugins.js", `module.exports = ${JSON.stringify(plugins)}`)
})
