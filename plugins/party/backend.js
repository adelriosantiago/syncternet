module.exports = {
  $(data, sync, UUID, userPrivate) {
    // TODO: Make the middleware smart enough to know if changing $ (or root), party.pos or party.pos.x, or even otherPlugin.a.b.c.d, etc
    data.status = 1

    clearTimeout(userPrivate.timer)
    userPrivate.timer = setTimeout(() => {
      data.status = 0
      sync(data)
    }, 3000)

    return data
  },
}
