//TODO: Make NPM module?

const _get = require("lodash.get")
const utils = require("./utils.js")

const make = (scope, onFunctions) => {
  if (Object.prototype.toString.call(onFunctions) !== "[object Object]")
    throw new Error("At least one of `beforeSet`, `afterSet`, `beforeGet` or `afterGet` functions must be defined.")

  onFunctions = Object.assign(
    {
      beforeGet: (p, v) => {
        return v
      },
      afterGet: () => {},
      beforeSet: (p, v) => {
        return v
      },
      afterSet: () => {},
    },
    onFunctions
  )

  const iterateAllScope = (onLeaf) => {
    utils.iterate(scope, "", onLeaf)
  }

  // Make mirror
  let _scope = {} // Flat scope which holds scope's real values
  iterateAllScope((p, v) => {
    const prePath = p.split(">")
    const leaf = prePath.pop()

    _scope[p] = v // Set initial value in flat scope

    const obj = prePath.length ? _get(scope, prePath) : scope
    Object.defineProperty(obj, leaf, {
      set: (v) => {
        v = onFunctions.beforeSet(p, v)
        _scope[p] = v
        setTimeout(() => {
          onFunctions.afterSet(p, v)
        }, 0)
      },
      get: () => {
        const v = _scope[p]
        const r = onFunctions.beforeGet(p, v)
        setTimeout(() => {
          onFunctions.afterGet(p, r)
        }, 0)
        return r
      },
    })
  })

  return _scope
}

module.exports = make
