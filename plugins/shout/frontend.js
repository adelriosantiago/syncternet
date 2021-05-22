new Object({
  init: () => {
    this.shoutText = {}

    window.addEventListener("keypress", (e) => {
      e = e || window.event
      const el = e.target || el.srcElement

      if (["TEXTAREA", "INPUT"].includes(el.tagName)) return // Bailout when we do want to write

      const timestamp = new Date().getTime()
      this.shoutText[timestamp] = e.key
      this.wsSend("shout", this.shoutText)

      setTimeout(() => {
        delete this.shoutText[timestamp]
        this.wsSend("shout", this.shoutText)
      }, 5000)
    })
  },
  middleware: {
    $: (data, username, isSelf) => {
      return data
    },
    shout: (data, username, isSelf) => {
      return data
    },
  },
})
