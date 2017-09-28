'use strict'
const httpProxy = require('http-proxy')
const through2 = require('through2')
const unzip = require('zlib').unzipSync

module.exports = function proxyTo () {
  let proxy = httpProxy.createProxyServer({ changeOrigin: true, preserveHeaderKeyCase: true })
  const web = proxy.web
  proxy.on('proxyRes', function (proxyRes, req, res) {
    res.bufferBody = []
    if (proxyRes.headers['accept-encoding'] && proxyRes.headers['accept-encoding'].indexOf('gzip')) res.isGZ = true
    if (proxyRes.headers['content-type'] && ~proxyRes.headers['content-type'].indexOf('application/json')) res.isJSON = true
    proxyRes.pipe(through2.obj(function (chunk, enc, callback) {
      res.bufferBody.push(chunk)
      callback()
    }))
  })
  // promisefy request
  proxy.web = function () {
    let args = arguments
    let res = arguments[1]
    return new Promise(function (resolve, reject) {
      web.call(proxy, ...args, function (res) {
        reject(res)
      })
      res.on('finish', function () {
        if (res.bufferBody && res.bufferBody.length) {
          let buffer = Buffer.concat(res.bufferBody)
          let data
          try {
            if (res.isGZ) buffer = unzip(buffer)
            data = buffer.toString('utf8')
          } catch (e) {

          }

          if (res.isJSON) {
            try {
              data = JSON.parse(data)
            } catch (e) {

            }
          }
          res.proxyBody = data
        }
        resolve()
      })
    })
  }

  // restream body
  proxy.on('proxyReq', function (proxyReq, req, res, options) {
    if (req.body) {
      let bodyData = JSON.stringify(req.body)
      // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
      proxyReq.setHeader('Content-Type', 'application/json')
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
      // stream the content
      proxyReq.write(bodyData)
    }
  })
  return proxy
}
