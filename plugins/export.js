module.exports = {
  party: {
    frontend: {
      html: `<div
  class="absolute z-50"
  style="pointer-events: none"
  :style="{'left': C.party.pos.x + 'px', 'top': C.party.pos.y + 'px' }"
>
  <img class="inline-block object-cover w-12 h-12 rounded-full" :src="C.party.pic" :alt="username" />
  <span
    class="absolute bottom-0 left-0 inline-block w-3 h-3 border border-white rounded-full"
    :class="{'bg-green-600': C.party.status === CROWWWD.ONLINE, 'bg-yellow-600': C.party.status === CROWWWD.AWAY, 'bg-gray-600': C.party.status === undefined}"
  ></span>
  <span class="text-sm text-white" style="background-color: rgba(0, 0, 0, 0.5)">{{username}}</span>
</div>
`,
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
  emoticons: {
    frontend: {
      html: "<div>emoticons plugin</div>",
      middleware: {}, // TODO
    },
    backend: {
      middleware: {},
    },
  },
}
