// client/src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // This path will be proxied
    createProxyMiddleware({
      target: 'https://movie-recommendation-app-h5pp.onrender.com', // Your production server
      changeOrigin: true,
    })
  );
};