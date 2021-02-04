// -> Rock
// - Plastic
// - Paper

const port = 3091
const http = require("http")
const express = require("express")
const bodyParser = require("body-parser")
const crowwwdServer = require("./crowwwd-server.js") // TODO: Make module
const app = express()

app.use(express.static("static"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get("/exampleGetPublic", (req, res) => {
  return res.json(public)
})

// Init server
const server = http.createServer(app)

let public = {
  word: "WORD",
  checkbox: true,
  sample: {
    deep: {
      field: "deep deep field",
    },
  },
  items: [
    { todo: "buy milk", prices: [3, 5, 6] },
    { todo: "buy a car", prices: [30, 50, 60] },
  ],
  otherList: [{ todo: "+++get milk" }, { todo: "+++buy meat" }, { todo: "+++exercise" }],
}

crowwwdServer.init(public, server)

server.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})
