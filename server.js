const http = require("http")
const express = require("express")
const bodyParser = require("body-parser")
const ws = require("ws")
const port = 3080

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
  word: "starting word",
  /*title: "initial title",
  subject: "random subject",
  thing: "red bold",
  bool: false,
  number: 4,
  data: {
    name: "John Doe",
    address: "74 Henry Road",
  },*/
}

// Set WS server
const wsServer = new ws.Server({ noServer: true })
wsServer.on("connection", (socket) => {
  console.log("connection")

  socket.on("message", (message) => {
    console.log("RX message", message)
    wsServer.clients.forEach((client) => {
      if (client.readyState === ws.OPEN) client.send(message)
    })
  })
})

server
  .listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
  })
  .on("upgrade", (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, (socket) => {
      wsServer.emit("connection", socket, request)
    })
  })
