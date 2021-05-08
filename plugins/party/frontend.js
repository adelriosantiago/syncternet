document.onmouseover = (e) => {
  try {
    e = e || window.event
    const el = e.target || el.srcElement

    const rect = el.getBoundingClientRect()
    const newData = {
      xpath: xpath(el),
      status: window.CROWWWD.ONLINE,
      pic: "https://via.placeholder.com/150", // TODO: Improve so that it is not sent everytime
    }

    this.wsSend("party", newData)
  } catch (e) {
    console.log("Party error", e) // Ignore faulty messages
  }
}
