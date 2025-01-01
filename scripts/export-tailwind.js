// Re-builds the CSS-scoped version of Tailwind that plugins use

const fs = require("fs")
const scopedTailwind = fs.readFileSync("./vendor/tailwind.min.css", { encoding: "utf8", flag: "r" })

fs.writeFileSync("./exports/syncternet-tailwind.js", `module.exports = ${JSON.stringify(scopedTailwind)}`)
