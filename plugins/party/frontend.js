document.onmouseover = (e) => {
  e = e || window.event
  const el = e.target || el.srcElement

  const rect = el.getBoundingClientRect()
  const newData = {
    xpath: xpath(el),
    pic: "https://via.placeholder.com/150",
    status: window.CROWWWD.ONLINE,
    pos: {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
    },
  }

  this.wsSend("party", newData)
}
