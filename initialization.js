// -> Rock
// - Plastic
// - Paper

const frontendExport = require("./exports/frontendExport.js")
const plugins = Object.keys(frontendExport.plugins)

const run = () => {
  let scripts = []

  CROWWWD = {
    socket: undefined,
    ONLINE: 1,
    AWAY: 0,
    X_OFFSET: 15,
    Y_OFFSET: 15,
    specialActions: ["@keys", "@style", "@plugins"],
  }

  // Append style and plugin templates

  if (!$("style.crowwwd").length) $("body").append(`<style class="crowwwd">${frontendExport.style}</style>`) // Append crowwwd style
  if (!$("div#crowwwd").length) {
    $("body").append("<div id='crowwwd'></div>")

    for (const p of plugins) {
      $("div#crowwwd").append(
        `<div v-for="(C, username) in public" :key="username">${frontendExport.plugins[p].html}</div>`
      )
      scripts.push(frontendExport.plugins[p].script)
    }
  }

  return scripts
}

module.exports = { run }
