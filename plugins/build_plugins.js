const fs = require("fs")
const Mustache = require("mustache")

const plugins = {
  party: fs.readFileSync(`${__dirname}/party.html`, { encoding: "utf8", flag: "r" }),
}

const data = fs.readFileSync(`${__dirname}/plugins.js`, { encoding: "utf8", flag: "r" })
const output = Mustache.render(data, plugins)
fs.writeFileSync(`${__dirname}/export.js`, output, { encoding: "utf8", flag: "w" })
console.log("Plugins export built")
