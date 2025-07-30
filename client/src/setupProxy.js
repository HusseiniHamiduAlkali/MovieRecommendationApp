// client/src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // This path will be proxied
    createProxyMiddleware({
      target: 'http://localhost:5000', // Your backend server
      changeOrigin: true,
    })
  );
};