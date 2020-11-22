let _onLeaf = (p, v) => {}
let _onParent = (p, v) => {}

const onLeaf = (f) => {
  _onLeaf = f
}

const onParent = (f) => {
  _onParent = f
}

const run = (root, prependPath = "") => {
  Object.entries(root).forEach((e) => {
    const p = `${prependPath}>${e[0]}`

    if (Object.prototype.toString.call(e[1]) === "[object Object]") {
      _onParent(p.substr(1), JSON.stringify(e[1]))
      run(e[1], p, onLeaf)
    } else if (Object.prototype.toString.call(e[1]) === "[object Array]") {
      _onParent(p.substr(1), JSON.stringify(e[1]))
      run({ ...e[1] }, p, onLeaf)
    } else {
      _onLeaf(p.substr(1), e[1])
    }
  })
}

module.exports = { run, onLeaf, onParent }
