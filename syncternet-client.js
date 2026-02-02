//
// Syncternet client
//

console.info("Syncternet Client Loaded")

const Vue = require("./utils/vue.min.js")
const ReconnectingWebSocket = require("reconnecting-websocket")

const style = require("./style/json-style.json")
const xpath = require("./utils/xpath-micro.js")
//const _get = require("lodash.get")
//const _set = require("lodash.set")
const $ = require("./utils/cash.min.js")

const pluginsJson = require("./plugins/json-plugins.json")
console.log({ pluginsJson })

const initSyncternet = () => {
  // Append style and plugin templates
  if (!$("style.crowwwd").length) $("body").append(`<style class="crowwwd">${style}</style>`) // Append crowwwd style
  if (!$("div#crowwwd").length) {
    $("body").append("<div id='crowwwd'></div>")

    // Append name change menu // TODO: IMPORTANT, THIS SHOULD BE A TEMPLATE (or a plugin) AND SHOULD NOT BE INTO MULTIPLE LINES
    $("div#crowwwd").append(
      `<div class="fixed bottom-20 left-0"><span><input placeholder="Set new username" v-model="settings.menu.newUsername" /></span><i class="fas fa-save" style="position: relative; color: black; left: -25px; top: 1px;" @click="setUsername()"></i></div>`
    )

    $("div#crowwwd").append(`<div v-for="(P, username) in public">${Object.values(pluginsJson)
      .map((p) => p.html)
      .join("")}
      </div>`)
  }
}

initSyncternet()
console.info("Syncternet Plugins Loaded:", Object.keys(pluginsJson))

// Initialize crowwwd engine
new Vue({
  el: "div#crowwwd",
  data: {
    crowwwd: {
      socket: undefined,
      ONLINE: 1,
      AWAY: 0,
      X_OFFSET: 15,
      Y_OFFSET: 15,
      specialActions: ["@uuid", "@style", "@plugins"],
    },
    settings: {
      menu: {
        open: false,
        newUsername: "",
      },
    },
    auth: {
      UUID: "",
      username: "",
    },
    // Realtime data, this object contains all user's public information
    public: {},
    // Local data, every user has it own data for each plugin. This object contains only this user's information
    private: {},
    // Middleware
    middleware: { $: [] },
  },
  created() {},
  mounted() {
    this.startWSClient()
  },
  computed: {
    self() {
      return this.public[this.auth.username]
    },
    execSpecialAction() {
      return {
        "@uuid": (data) => {
          data = JSON.parse(data)
          this.auth.UUID = data.UUID
          this.auth.username = data.username
          this.$set(this.public, data.username, {})
          window.localStorage.setItem("crowwwd:UUID", data.UUID)
          window.localStorage.setItem("crowwwd:username", data.username)
          this.onUUIDReceived()
        },
      }
    },
  },
  methods: {
    startWSClient() {
      // Check for previous auth data
      const UUID = window.localStorage.getItem("crowwwd:UUID") || ""
      const username = window.localStorage.getItem("crowwwd:username") || ""

      // Init socket connection
      const protocol = location.protocol === "https:" ? "wss:" : "ws:"
      this.crowwwd.socket = new ReconnectingWebSocket(
        `${protocol}//${window.location.host}/?UUID=${UUID}&username=${username}`
      )
      this.crowwwd.socket.onopen = () => this.onWSOpen
      this.crowwwd.socket.onerror = (err) => this.onWSError(err)
      this.crowwwd.socket.onmessage = (msg) => this.onWSMessage(msg.data)
    },
    onWSOpen() {
      console.info("Syncternet - WS Open")
    },
    onWSError(err) {
      console.error("Syncternet - WS Error", err)
    },
    onWSMessage(msg) {
      try {
        let [, username, plugin, data] = msg.match(/^([@\w-]+)\|(\w+|)\|(.*)$/) // Spec: https://regex101.com/r/QMH6lD/1
        if (!username) return
        if (this.crowwwd.specialActions.includes(username)) return this.execSpecialAction[username](data) // TODO: Move to a better place, this should be a plugin that deals with usernames only
        data = JSON.parse(data)

        // For plugin data
        data = this.middleware[plugin](data, username, this.auth.username) // Plugin middleware
        for (rootMiddleware of this.middleware["$"]) data = rootMiddleware(data, username, this.auth.username) // Root $ middleware

        if (this.public[username] === undefined) return this.$set(this.public, username, { [plugin]: data }) // When a new user connects and it still doesn't exist in our public

        this.$set(this.public[username], plugin, data)
      } catch (e) {
        console.log("Invalid message", e) // Ignore faulty messages
      }
    },
    onUUIDReceived() {
      for (p of Object.entries(pluginsJson)) {
        const obj = eval(p[1].script)

        // Create plugin data placeholder
        this.$set(this.public[this.auth.username], p[0], {})
        this.$set(this.private, p[0], obj.private)

        // Populate middleware
        this.middleware["$"].push(obj.middleware["$"])
        delete obj.middleware["$"]
        Object.assign(this.middleware, obj.middleware)

        // Init plugin
        obj.init()
      }
    },
    sync(plugin, replace) {
      if (!plugin) {
        Object.keys(pluginsJson).forEach((p) => this.sync(p))
        return
      }
      this.send(plugin, this.self[plugin])
    },
    send(plugin, data) {
      if (!this.auth.UUID) return
      this.crowwwd.socket.send(this.auth.UUID + "|" + plugin + "|" + JSON.stringify(data))
    },
    raw(a, b, c) {
      this.crowwwd.socket.send(a + "|" + b + "|" + c)
    },
    setUsername() {
      if (!this.settings.menu.newUsername) return // TODO: Show an error message?
      this.raw(
        "@changeUsername",
        "",
        JSON.stringify({ newUsername: this.settings.menu.newUsername, UUID: this.auth.UUID })
      )
    },
  },
})
