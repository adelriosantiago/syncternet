const WebSocketServer = require("ws").Server
const fs = require("fs")
const ws = require("ws")
const _pick = require("lodash.pick")
const _get = require("lodash.get")
const _set = require("lodash.set")
const _toPath = require("lodash.topath")
const uuid = require("uuid")
const uptill = require("uptill")
const path = require("path")
const haikunator = new (require("haikunator"))({
  defaults: {
    tokenLength: 6,
  },
})

// Load plugins
const pluginsFolder = path.join(__dirname, "plugins")
let plugins = fs
  .readdirSync(pluginsFolder)
  .map((p) => ({
    [p]: {
      // TODO: Standarize names, template -> html, frontend -> script, etc
      html: fs.readFileSync(path.join(pluginsFolder, p, "template.html"), "utf8"),
      middleware: require(path.join(pluginsFolder, p, "backend.js")),
      script: fs.readFileSync(path.join(pluginsFolder, p, "frontend.js"), "utf8"),
    },
  }))
  .reduce((a, c) => {
    a[Object.keys(c)[0]] = Object.values(c)[0]
    return a
  }, {})

console.info("Syncternet - Plugins loaded:", Object.keys(plugins))

const WS_MESSAGE = "message"
const WS_CONNECTION = "connection"
const WS_CONNECTING = 0
const WS_OPEN = 1
const WS_CLOSING = 2
const WS_CLOSED = 3

let wsServer = undefined
let users = {}
let public = {}
let private = {}

const execSpecialAction = {
  "@changeUsername": (socket, data) => {
    data = JSON.parse(data)
    users[data.UUID] = data.newUsername // TODO: Check that it doesn't exists
    send(socket, "@keys", "", JSON.stringify({ UUID: data.UUID, username: data.newUsername }))
  },
}
const specialActions = Object.keys(execSpecialAction)

const send = (socket, username, plugin, data) => {
  if (socket.readyState === WS_OPEN) socket.send(username + "|" + plugin + "|" + data)
}

const broadcastData = (username, plugin, data) => {
  wsServer.clients.forEach((socket) => send(socket, username, plugin, data))
}

const sendAllToClient = (socket) => {
  Object.keys(public).forEach((UUID) => {
    Object.keys(public[UUID]).forEach((plugin) => {
      send(socket, users[UUID], plugin, JSON.stringify(public[UUID][plugin]))
    })
  })
}

const buildSync = (username, plugin) => {
  return (data) => {
    broadcastData(username, plugin, JSON.stringify(data))
  }
}

const init = (server) => {
  // Get `app` from server
  const app = server.listeners("request")[0]

  // Register utility routes
  app.get("/syncternet/stats", (req, res) => {
    return res.json({
      status: "OK",
      users: Object.keys(users).length,
      public: Object.keys(public).length,
      private: Object.keys(private).length,
    })
  })

  app.get("/syncternet/client", (req, res) => {
    return res.sendFile(__dirname + "/exports/syncternet-client.js")
  })

  // Start websocket server
  wsServer = new WebSocketServer({ server })
  wsServer.on(WS_CONNECTION, async (socket, req) => {
    let [, UUID, username] = req.url.match(/^\/\?UUID=(.*)&username=(.*)$/) // Spec: https://regex101.com/r/yZO0av/1

    // Create new session or continue an old one

    if (!UUID || !username || !(users[UUID] === username)) {
      // Non authenticated user, generate name and add to users
      UUID = uuid.v4()
      username = haikunator.haikunate()
      users[UUID] = username
    }

    send(socket, "@keys", "", JSON.stringify({ UUID, username }))
    sendAllToClient(socket) // Send all existing public data at the beginning

    socket.on(WS_MESSAGE, (msg) => {
      let [, UUID, plugin, data] = msg.match(/^([@\w-]+)\|(\w+|)\|(.*)$/) // Spec: https://regex101.com/r/QMH6lD/1
      if (!UUID) return
      if (specialActions.includes(UUID)) return execSpecialAction[UUID](socket, data) // Special functions
      data = JSON.parse(data)

      // For plugin data
      if (public[UUID] === undefined) public[UUID] = {}
      if (private[UUID] === undefined) private[UUID] = {}

      // Process middleware
      data = plugins[plugin].middleware["$"](data, buildSync(users[UUID], plugin), UUID, private[UUID], public[UUID])
      Object.assign(public[UUID], { [plugin]: data })

      broadcastData(users[UUID], plugin, JSON.stringify(data))
    })
  })
}

const store = () => {
  public, private, users
}

module.exports = { init, store }
