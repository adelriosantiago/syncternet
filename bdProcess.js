let scope = {
  word: "123",
  items: [
    { todo: "get milk", amt: 5, prices: [3, 5, 6] },
    { todo: "buy meat", amt: 3, prices: [30, 50, 60] },
    { todo: "exercise", amt: 1, prices: [300, 500, 600] },
  ],
}

const action = {
  "@sendScope": (socket, data) => {
    console.log("action: @sendScope")
    socket.send(`@updateScope>${JSON.stringify(scope)}`)
  },
  "@example": (socket, data) => {
    console.log("action: @example")
  },
}

const message = (socket, msg) => {
  console.log("msg", msg)
  //scope[msg.p] = msg.v
}

module.exports = { action, message }
