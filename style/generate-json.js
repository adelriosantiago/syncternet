//
// Build plugins and store them into a JSON file so that it is browserify-able by the client.
//

const fs = require("fs")
const path = require("path")

// Read file and convert to json
const style = fs.readFileSync(path.join(__dirname, "style.min.css"), "utf8")

// Write file to exports
fs.writeFileSync(path.join(__dirname, "json-style.json"), JSON.stringify(style))
