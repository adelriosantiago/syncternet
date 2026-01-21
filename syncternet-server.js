
import { WebSocketServer } from "ws"
import _pick from "lodash.pick"
import _get from "lodash.get"
import _set from "lodash.set"
import _toPath from "lodash.topath"
import * as uuid from "uuid"
import uptill from "uptill"
import Haikunator from "haikunator"

import { readFile } from "fs/promises";
const rawPlugins = JSON.parse(await readFile(new URL('./plugins/json-plugins.json', import.meta.url), 'utf-8'))

const haikunator = new Haikunator({
  defaults: {
    tokenLength: 6,
  },
})

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url))

const pluginBackends = Object.fromEntries(Object.entries(rawPlugins).map(([key, value]) => {
  return [key, eval(value.back)] // TODO: Try safer alternative const fn = new Function("x", `"use strict"; return (${expr});`);
}))

const WS_MESSAGE = "message"
const WS_CONNECTION = "connection"
const WS_CONNECTING = 0
const WS_OPEN = 1
const WS_CLOSING = 2
const WS_CLOSED = 3

let wsServer = undefined
let _users = {}
let _public = {}
let _private = {}

const execSpecialAction = {
  "@changeUsername": (socket, data) => {
    data = JSON.parse(data)
    _users[data.UUID] = data.newUsername // TODO: Check that it doesn't exists
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
  Object.keys(_public).forEach((UUID) => {
    Object.keys(_public[UUID]).forEach((plugin) => {
      send(socket, _users[UUID], plugin, JSON.stringify(_public[UUID][plugin]))
    })
  })
}

const buildSync = (username, plugin) => {
  return (data) => {
    broadcastData(username, plugin, JSON.stringify(data))
  }
}

const init = (server, app) => {
  // Register utility routes
  app.get("/syncternet/stats", (req, res) => {
    return res.json({
      status: "OK",
      users: Object.keys(_users).length,
      public: Object.keys(_public).length,
      private: Object.keys(_private).length,
    })
  })

  // Register client route
  app.get("/syncternet/client", (req, res) => {
    return res.sendFile(__dirname + "/exports/syncternet-client.js")
  })

  // Start websocket server
  wsServer = new WebSocketServer({ server })
  wsServer.on(WS_CONNECTION, async (socket, req) => {
    let [, UUID, username] = req.url.match(/^\/\?UUID=(.*)&username=(.*)$/) // Spec: https://regex101.com/r/yZO0av/1

    // Create new session or continue an old one

    if (!UUID || !username || !(_users[UUID] === username)) {
      // Non authenticated user, generate name and add to users
      UUID = uuid.v4()
      username = haikunator.haikunate()
      _users[UUID] = username
    }

    send(socket, "@keys", "", JSON.stringify({ UUID, username }))
    sendAllToClient(socket) // Send all existing public data at the beginning

    socket.on(WS_MESSAGE, (msg, isBinary) => {
      if (isBinary) return // Ignore binary messages
      const msgStr = msg.toString('utf8')
      let [, UUID, plugin, data] = msgStr.match(/^([@\w-]+)\|(\w+|)\|(.*)$/) // Spec: https://regex101.com/r/QMH6lD/1
      if (!UUID) return
      if (specialActions.includes(UUID)) return execSpecialAction[UUID](socket, data) // Special functions
      data = JSON.parse(data)

      // For plugin data
      if (_public[UUID] === undefined) _public[UUID] = {}
      if (_private[UUID] === undefined) _private[UUID] = {}

      // Process plugin backend middleware
      data = pluginBackends[plugin]["$"](
        data,
        buildSync(_users[UUID], plugin),
        UUID,
        _private[UUID],
        _public[UUID]
      )
      Object.assign(_public[UUID], { [plugin]: data })

      broadcastData(_users[UUID], plugin, JSON.stringify(data))
    })
  })
}

const store = () => {
  _public, _private, _users
}

export default {
  init,
  store,
}
