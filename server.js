const http = require("http")
const express = require("express")
const bodyParser = require("body-parser")
const port = 3080

const app = express()
app.use(express.static("static"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Init server
const server = http.createServer(app)

let scope = {
  word: "starting word",
  title: "initial title",
  subject: "random subject",
  thing: "red bold",
  bool: "false",
  number: "4",
  data: {
    name: "John Doe",
    address: "74 Henry Road",
  },
}

server.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})
