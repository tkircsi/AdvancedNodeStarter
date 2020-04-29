// import proxy from 'http-proxy-middleware';
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // app.use(proxy('/auth/**', { target: 'http://localhost:5000/' }));
  // app.use(proxy('/api/**', { target: 'http://localhost:5000/' }));

  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
  app.use(
    '/auth',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
};
