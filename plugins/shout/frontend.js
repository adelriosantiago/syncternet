new Object({
  init: () => {
    this.self.shout.messages = {}
    let currentElement = null

    document.addEventListener("mouseover", (e) => {
      try {
        currentElement = xpath(e.target || e.srcElement)
      } catch (e) {
        /* Ignore when we are not in the DOM */
      }
    })

    window.addEventListener("keypress", (e) => {
      if (!currentElement) return // Bailout when we don't have an element
      if (["TEXTAREA", "INPUT"].includes(currentElement.tagName)) return // Bailout when we are typing in an input field

      const timestamp = new Date().getTime()
      if (!this.self.shout.messages[currentElement]) this.self.shout.messages[currentElement] = { txt: {}, pos: {} }
      this.self.shout.messages[currentElement].txt[timestamp] = e.key
      this.sync("shout")
    })
  },
  methods: {
    // TODO: Implement plugins this way
    onKeyPress: (e) => {
      console.log("Key pressed:", e.key)
    },
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
