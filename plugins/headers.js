module.exports = {
  style: "build.js failed to overwrite this placeholder with actual <style> data.",
  plugins: {
    party: {
      frontend: {
        html: "build.js failed to overwrite this placeholder with actual <html> plugin data.",
        script: "build.js failed to overwrite this placeholder with actual <script> plugin data.",
        middleware: {},
      },
      backend: {
        middleware: {
          $: (data, sync, UUID, userPrivate) => {
            // TODO: Make the middleware smart enough to know if changing $ (or root), party.pos or party.pos.x, or even otherPlugin.a.b.c.d, etc
            data.status = 1

            clearTimeout(userPrivate.timer)
            userPrivate.timer = setTimeout(() => {
              data.status = 0
              sync(data)
            }, 3000)

            return data
          },
        },
      },
    },
  },
}
