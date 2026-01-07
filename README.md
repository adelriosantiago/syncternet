# Syncternet - NPM module

Syncternet shares gathers all users currently looking a webpage, allowing them to chat and interact. This is the NPM module that allows you to add Syncternet to your own Express.js project.

## How to use

1. Install the package with `npm install syncternet`.
2. Initialize the server with `const syncternet = require('syncternet')` and `syncternet.init(app)`, where `app` is your Express app.
3. Load the script in the front-end with `<script src="/syncternet/client"></script>`, this route is injected to the Express app when the module is loaded.

# Development

1. The best way to get started developing is to grab the [syncternet-demo](https://github.com/adelriosantiago/syncternet-demo).
2. Build the style with `npm run build:style`
3. Build the client with `npm run build:client`
Note that when developing using [syncternet-demo](https://github.com/adelriosantiago/syncternet-demo), the client is built automatically.