// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('wasm');

// Metro Universal Middleware: Injects security headers for the browser
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Catch custom log pings from the app
      if (req.url.startsWith('/log-to-terminal')) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const message = url.searchParams.get('msg');

        // This prints directly inside your machine's computer terminal window!
        console.log(`\x1b[32m[BROWSER RUNNER]\x1b[0m ${message}`);

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('ok');
        return;
      }

      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
