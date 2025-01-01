// Re-builds the CSS-scoped version of Tailwind that plugins use

const fs = require("fs")
const style = fs.readFileSync("./builds/tailwind.min.css", { encoding: "utf8", flag: "r" })

fs.writeFileSync("./exports/syncternet-style.js", `module.exports = ${JSON.stringify(style)}`)
