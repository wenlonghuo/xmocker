'use strict';

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var httpProxy = require('http-proxy');
var through2 = require('through2');
var unzip = require('zlib').unzipSync;

module.exports = function proxyTo() {
  var proxy = httpProxy.createProxyServer({ changeOrigin: true, preserveHeaderKeyCase: true });
  var web = proxy.web;
  proxy.on('proxyRes', function (proxyRes, req, res) {
    res.bufferBody = [];
    if (proxyRes.headers['accept-encoding'] && proxyRes.headers['accept-encoding'].indexOf('gzip')) res.isGZ = true;
    if (proxyRes.headers['content-type'] && ~proxyRes.headers['content-type'].indexOf('application/json')) res.isJSON = true;
    proxyRes.pipe(through2.obj(function (chunk, enc, callback) {
      res.bufferBody.push(chunk);
      callback();
    }));
  });

  proxy.web = function () {
    var args = arguments;
    var res = arguments[1];
    return new Promise(function (resolve, reject) {
      web.call.apply(web, [proxy].concat((0, _toConsumableArray3.default)(args), [function (res) {
        reject(res);
      }]));
      res.on('finish', function () {
        if (res.bufferBody && res.bufferBody.length) {
          var buffer = Buffer.concat(res.bufferBody);
          var data = void 0;
          try {
            buffer = unzip(buffer);
          } catch (e) {}

          data = buffer.toString('utf8');

          if (res.isJSON) {
            try {
              data = JSON.parse(data);
            } catch (e) {}
          }
          res.proxyBody = data;
        }
        resolve();
      });
    });
  };

  proxy.on('proxyReq', function (proxyReq, req, res, options) {
    if (req.body) {
      var bodyData = JSON.stringify(req.body);

      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));

      proxyReq.write(bodyData);
    }
  });
  return proxy;
};