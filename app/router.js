'use strict'

const assert = require('assert')
let router = require('koa-router')()
const api = require('./controller/controller.api')
const inject = require('./controller/controller.inject')

module.exports = function routes (option = {}) {
  if (option.linkViews) {
    router.get('/_refreshPage', inject.refresh)
    router.post('/_setPageList', inject.storePageList)
    router.get('/_link', inject.serveView)
  }

  let type = option.source && option.source.type
  let middlewares = api[type]
  assert(middlewares, 'source type is not valid, please checkout your option')

  router.all('*', middlewares.findApi, middlewares.findFix, middlewares.findModel)
  return router
}
