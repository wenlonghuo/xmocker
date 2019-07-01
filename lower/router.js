'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var returnJsonp = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx, next) {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return next();

          case 2:

            if (ctx.query.callback && ctx.method === 'GET' && !ctx.is('json') && (0, _typeof3.default)(ctx.body) === 'object') {
              ctx.body = ctx.query.callback + '(' + JSON.stringify(ctx.body) + ')';
              ctx.type = 'application/x-javascript';
            }

          case 3:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function returnJsonp(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

  router.all('*', returnJsonp, middlewares.findApi, middlewares.findFix, middlewares.findModel);
  return router;
};