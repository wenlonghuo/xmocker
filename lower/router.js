'use strict';

var assert = require('assert');
var router = require('koa-router')();
var api = require('./controller/controller.api');
var inject = require('./controller/controller.inject');

module.exports = function routes() {
  var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (option.linkViews) {
    router.get('/_refreshPage', inject.refresh);
    router.post('/_setPageList', inject.storePageList);
    router.get('/_link', inject.serveView);
  }

  var type = option.source && option.source.type;
  var middlewares = api[type];
  assert(middlewares, 'source type is not valid, please checkout your option');

  router.all('*', middlewares.findApi, middlewares.findFix, middlewares.findModel);
  return router;
};