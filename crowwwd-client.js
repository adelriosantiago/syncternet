// - Rock
// -> Plastic
// - Paper

const Vue = require("./vendor/vue.min.js")
const ReconnectingWebSocket = require("reconnecting-websocket")
const xpath = require("./vendor/xpath-micro.js")
const _get = require("lodash.get")
const _set = require("lodash.set")
const $ = require("./vendor/cash.min.js")
const initialization = require("./initialization.js")

const scripts = initialization.run(window)

// Initialize crowwwd engine
new Vue({
  el: "div#crowwwd",
  data: {
    // Realtime data, every user has a copy of this with the same contents
    public: {},
    // Local data, every user has it own data
    private: {
      UUID: "",
      username: "",
    },
  },
  created() {},
  mounted() {
    this.startWSClient()
    for (s of scripts) eval(s) // Run all plugins scripts
  },
  computed: {
    execSpecialAction() {
      return {
        "@keys": (data) => {
          data = JSON.parse(data)
          this.private.UUID = data.UUID
          this.private.username = data.username
          window.localStorage.setItem("crId", data.UUID)
        },
      }
    },
  },
  methods: {
    startWSClient() {
      // Check for previous auth data
      const crId = window.localStorage.getItem("crId") || ""

      // Init socket connection
      window.CROWWWD.socket = new ReconnectingWebSocket(`ws://${window.location.host}/crId=${crId}`)
      window.CROWWWD.socket.onopen = () => this.onWSOpen
      window.CROWWWD.socket.onerror = (err) => this.onWSError(err)
      window.CROWWWD.socket.onmessage = (msg) => this.onWSMessage(msg.data)
    },
    onWSOpen() {
      console.log("WebSocket open")
    },
    onWSError() {
      console.log(`WebSocket error: ${err}`)
    },
    onWSMessage(msg) {
      // TODO: Move this middleware POC into frontendExports
      const mid = {
        $: (data, username, isSelf) => {
          let rect

          try {
            rect = xpath(data.xpath).getBoundingClientRect()
          } catch (e) {
            rect = { x: 0, y: 0 }
          }

          data.pos = {
            x: Math.round(rect.x + document.documentElement.scrollLeft),
            y: Math.round(rect.y + document.documentElement.scrollTop),
          }

          if (data.pos.y > scrollY + innerHeight) {
            data.wayOut = "DOWN"
            data.pos.y = scrollY + innerHeight - 40
          } else if (data.pos.y < scrollY) {
            data.wayOut = "UP"
            data.pos.y = scrollY
          } else {
            data.wayOut = undefined
          }

          return data // TODO: Move to right place
        },
      }

      let [, username, plugin, data] = msg.match(/^([@\w-]+)\|(\w+|)\|(.*)$/) // Spec: https://regex101.com/r/QMH6lD/1
      if (!username) return
      if (window.CROWWWD.specialActions.includes(username)) return this.execSpecialAction[username](data)
      data = JSON.parse(data)

      // For plugin data
      data = mid["$"](data, username, username === this.private.username)
      if (this.public[username] === undefined) return this.$set(this.public, username, { [plugin]: data })
      Object.assign(this.public[username][plugin], data)
    },
    wsSend(plugin, data) {
      if (!this.private.UUID) return
      window.CROWWWD.socket.send(this.private.UUID + "|" + plugin + "|" + JSON.stringify(data))
    },
  },
})
