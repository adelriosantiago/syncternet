window.addEventListener("keypress", (e) => {
  e = e || window.event
  const el = e.target || el.srcElement

  if (["TEXTAREA", "INPUT"].includes(el.tagName)) return // Bailout when we do want to write

  const ooo = { [new Date().getTime()]: e.key }
  this.wsSend("shout", ooo)
})
