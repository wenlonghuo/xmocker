'use strict'

const assert = require('assert')
let router = require('koa-router')()
const api = require('./controller/controller.api')
const inject = require('./controller/controller.inject')

async function returnJsonp (ctx, next) {
  await next()

  if (ctx.query.callback && ctx.method === 'GET' && !ctx.is('json') && typeof ctx.body === 'object') {
    ctx.body = `${ctx.query.callback}(${JSON.stringify(ctx.body)})`
    ctx.type = 'application/x-javascript'
  }
}

module.exports = function routes (option = {}) {
  if (option.linkViews) {
    router.get('/_refreshPage', inject.refresh)
    router.post('/_setPageList', inject.storePageList)
    router.get('/_link', inject.serveView)
  }

  let type = option.source && option.source.type
  let middlewares = api[type]
  assert(middlewares, 'source type is not valid, please checkout your option')

  router.all('*', returnJsonp, middlewares.findApi, middlewares.findFix, middlewares.findModel)
  return router
}
