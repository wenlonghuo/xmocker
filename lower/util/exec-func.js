'use strict';

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(ctx) {
    var condition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var keys, values, func, AsyncFunction;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (condition.indexOf('return') < 0) condition = 'return ' + condition;
            keys = Object.keys(params);
            values = keys.map(function (key) {
              return params[key];
            });
            func = void 0;


            keys.push(condition);
            AsyncFunction = Object.getPrototypeOf((0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
              return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                    case 'end':
                      return _context.stop();
                  }
                }
              }, _callee, this);
            }))).constructor;
            _context2.prev = 6;

            func = new (Function.prototype.bind.apply(AsyncFunction, [null].concat((0, _toConsumableArray3.default)(keys))))();
            _context2.next = 13;
            break;

          case 10:
            _context2.prev = 10;
            _context2.t0 = _context2['catch'](6);
            throw new Error('\u5206\u652F\u5224\u65AD\u51FD\u6570\u4E0D\u5408\u6CD5' + _context2.t0.message);

          case 13:
            ctx.require = require;
            _context2.prev = 14;
            _context2.next = 17;
            return func.apply(ctx, values);

          case 17:
            return _context2.abrupt('return', _context2.sent);

          case 20:
            _context2.prev = 20;
            _context2.t1 = _context2['catch'](14);
            throw new Error('api\u5206\u652F\u6267\u884C\u5224\u65AD\u6761\u4EF6\u7684\u51FD\u6570\u65F6\u51FA\u73B0\u9519\u8BEF\uFF1A' + _context2.t1.message);

          case 23:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[6, 10], [14, 20]]);
  }));

  function execFunction(_x) {
    return _ref.apply(this, arguments);
  }

  return execFunction;
}();