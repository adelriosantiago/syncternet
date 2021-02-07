# crowwwd-noot

The crowwwd-noot variant does not use operational transform by default. It merely shares incoming messages which is the core of crowwwd.

### Server

Users is stored in `users`  global variable. This variable maps UUID to usernames. Clients are never expected to know other UUID's then themselves. Example structure:

``` json
const users = {
    "jumping-dog-123": "adelriosantiago",
	"sleeping-cat-321": "scasbyte",
    // ... and so on for other users
}
```

A matching UUID and username is what makes an user an authenticated one. For this reason UUIDs should never be shared to the client.

As an example we use 2 plugins:

- Party: Allows people to see where others are and shows an avatar near the DOM element over the cursor.
- Emoticons: Allows people to add reactions to elements. Inspired by Facebooks video reactions.

Public information about the each user for each plugin is stored in `public`. For example:

```js
const public = {
	"party": {
    	"jumping-dog-123": {
            pos: {
            	x: 13,
                y: 24,
            }
        },
    	"sleeping-cat-321": {
            pos: {
            	x: 88,
                y: 75,
            }
        },
	    // ... and so on for other users
    },
    "emoticons" : {
    	// ... plugin data
    },
    // ... and so on for other plugins
}
```

In the example above there are two users at two different locations on the page. *Note: Plugin data is not real. Actual positions are not stored in X, Y coordinates.*

Plugin definition is found in `plugins` variable:

```js
const plugins = {
	party: {
        html: "<div>plugin html</div>",
		created: "",
        mounted: "",
	},
    emoticons: {
    	// ... plugin data
    },
    // ... and so on for other plugins
}
```

When a new server is started we begin listening to 2 events:

- `onConnection`: Listens for client's first message when connected. There two cases:
  - A completely new user connects:
    - `"new"` is received.
    - The server adds a new randomly-generated UUID and username to `users`.
    - The server sends this information to the user. For example, `"new|jumping-dog-123|{ username: 'adelriosantiago' }"`.
    - The server sends initial plugin information.
  - An existing user connects:
    - `"continue|jumping-dog-123|{ username: 'adelriosantiago' }"` is received since an existing user connected.
    - We test if `"users['jumping-dog-123'] === adelriosantiago"`. There are 2 possibilities,
      - It does not match: A new UUID and username is generated and sent to the client. For example: `"keys|jumping-dog-123"`.
      - It matches: Nothing happens, the process continues.
    - A newly-generated UUID and username are generated and added to `users`. This UUID is `"jumping-dog-123"`.
    - The new UUID and all plugin information is sent to the connecting user. For example `"jumping-dog-123|{ html: [html content] }"`. (See the client's side to see how it handles this UUID).
- `onMessage`: When a client does any change and sends the change to the server. Step by step:
  - Server receives `"party|jumping-dog-123|{ pos: { x: 3, y: 2 } }"`.
  - `public.party["jumping-dog-123"]` is updated with `{ pos: { x: 3, y: 2 } }`.
  - We look for `jumping-dog-123` user from `users`. This is `adelriosantiago`.
  - Server broadcasts `"party|adelriosantiago|{ pos: { x: 3, y: 2 } }"` to all clients except the sender.

### Client

Users spin a VUE instance that looks like:

```js
new Vue({
    data: {
        public: { // Realtime data, every user has a copy of this
        	party: {
                adelriosantiago: {
                	xpath: "", pos: { x: 3, y: 5 },
                },
                scasbyte: {
                    xpath: "", pos: { x: 6, y: 8 },
                },
                // ... and so on for other users
            },
            emoticons: {
               	// ... plugin data
            },
       	    // ... and so on for other plugins
        },
        private: { // Local data, every user has it own data
        	UUID: "jumping-dog-123", // What server sent us
            username: "adelriosantiago", // What we chose
        },
    },
    created() {},
    mounted() {},
    methods: {},
})
```

When an user opens a page with crowwwd the following happens:

- The user connects.
- We look for `crowwwd:UUID` and `crowwwd:username` at `localStorage`. There are two options then,
  - If `UUID` exists, it is sent to the server. For example: `adelriosantiago|jumping-dog-123`.
  - 



## SO resources:

 - https://stackoverflow.com/questions/5100376/how-to-watch-for-array-changes