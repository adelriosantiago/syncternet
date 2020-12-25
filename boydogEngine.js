// - Rock
// -> Plastic
// - Paper

const WS_CONNECTING = 0
const WS_OPEN = 1
const WS_CLOSING = 2
const WS_CLOSED = 3

let wsServer
let scope = {}

const action = {
  "@init": (socket, data) => {
    console.log("action: @init")
    socket.send(`@init|${JSON.stringify(scope)}`)
  },
  "@example": (socket, data) => {
    console.log("action: @example")
  },
}

const message = (socket, msg) => {
  console.log("msg", msg)

  scope[msg.p] = msg.v

  // Send to clients
  setTimeout(() => {
    wsServer.clients.forEach((client) => {
      if (client.readyState === WS_OPEN) client.send(JSON.stringify({ p: msg.p, v: msg.v }))
    })
  }, 0)
}

const init = (_wsServer, _scope) => {
  wsServer = _wsServer
  scope = _scope
}

module.exports = { action, message, init }
