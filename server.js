// -> Rock
// - Plastic
// - Paper

const port = 3091
const http = require("http")
const express = require("express")
const bodyParser = require("body-parser")
const boydog = require("./boydog.js") // TODO: Make module
const app = express()
app.use(express.static("static"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get("/exampleGetScope", (req, res) => {
  return res.json(scope)
})

// Init server
const server = http.createServer(app)

let scope = {
  word: "123",
  "items>0>todo": "buy milk",
  "items>1>todo": "buy meat",
  "items>2>todo": "fix car",
}

boydog.init(scope, server)

server.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})
