const fs = require("fs")

const tailwindScoped = fs.readFileSync("./vendor/tailwind.min.css", { encoding: "utf8", flag: "r" })

const listdirs = require("listdirs")

// TODO: Use async
listdirs("./plugins", function callback(err, plugins) {
  if (err) {
    console.log(err) // handle errors in your preferred way.
  } else {
    plugins.shift()
    plugins = plugins.map((f) => f.match(/\w+$/g)[0])

    let frontendExport = {
      style: tailwindScoped,
      plugins: {},
    }
    for (const p of plugins) {
      frontendExport.plugins[p] = {
        html: fs.readFileSync(`./plugins/${p}/template.html`, "utf8"),
        middleware: {},
        script: fs.readFileSync(`./plugins/${p}/frontend.js`, "utf8"),
      }
      fs.writeFileSync("./exports/frontendExport.js", `module.exports = ${JSON.stringify(frontendExport)}`)
    }
  }
})
