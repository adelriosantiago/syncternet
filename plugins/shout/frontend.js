new Object({
  init: () => {
    this.self.shout.messages = {}

    let currentElement

    document.addEventListener("mouseover", (e) => {
      try {
        e = e || window.event
        const el = e.target || el.srcElement
        currentElement = xpath(el)
      } catch (e) {
        console.log("Shout error while creating anchor", e) // Ignore faulty messages
      }
    })

    window.addEventListener("keypress", (e) => {
      e = e || window.event
      const el = e.target || el.srcElement

      if (["TEXTAREA", "INPUT"].includes(el.tagName)) return // Bailout when we do want to write

      const timestamp = new Date().getTime()
      if (!this.self.shout.messages[currentElement]) this.self.shout.messages[currentElement] = { txt: {}, pos: {} }
      this.self.shout.messages[currentElement].txt[timestamp] = e.key
      this.sync("shout")

      setTimeout(() => {
        delete this.self.shout[timestamp]
        this.sync("shout")
      }, 5000)
    })
  },
  middleware: {
    $: (data, username, isSelf) => {
      return data
    },
    shout: (data, username, isSelf) => {
      Object.keys(data.messages).forEach((k) => {
        if (!Object.keys(data.messages[k].pos).length) {
          let rect
          try {
            rect = xpath(k).getBoundingClientRect()
          } catch (e) {
            rect = { x: 0, y: 0 }
          }

          data.messages[k].pos = {
            x: Math.round(rect.x + document.documentElement.scrollLeft),
            y: Math.round(rect.y + document.documentElement.scrollTop),
          }
        }
      })

      return data
    },
  },
})
