const listdirs = require("listdirs")
let backendExport = { plugins: {} }

// TODO: Use async
listdirs("./plugins", function callback(err, plugins) {
  if (err) {
    console.log(err) // handle errors in your preferred way.
  } else {
    plugins.shift()
    plugins = plugins.map((f) => f.match(/\w+$/g)[0]) // TODO: Simplify

    for (const p of plugins) {
      backendExport.plugins[p] = {
        middleware: require(`../plugins/${p}/backend.js`),
      }
    }
  }
})

module.exports = backendExport
