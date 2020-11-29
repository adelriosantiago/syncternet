let scope = {
  word: "123",
  items: [
    { todo: "get milk", amt: 5 },
    { todo: "buy meat", amt: 3 },
    { todo: "exercise", amt: 1 },
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
  scope[msg.p] = msg.v
}

module.exports = { action, message }
