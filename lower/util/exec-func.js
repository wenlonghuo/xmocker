'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx) {
    var condition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var keys, values, func;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (condition.indexOf('return') < 0) condition = 'return ' + condition;
            keys = Object.keys(params);
            values = keys.map(function (key) {
              return params[key];
            });
            func = void 0;


            keys.push(condition);
            _context.prev = 5;

            func = new (Function.prototype.bind.apply(Function, [null].concat((0, _toConsumableArray3.default)(keys))))();
            _context.next = 12;
            break;

          case 9:
            _context.prev = 9;
            _context.t0 = _context['catch'](5);
            throw new Error('\u5206\u652F\u5224\u65AD\u51FD\u6570\u4E0D\u5408\u6CD5' + _context.t0.message);

          case 12:
            _context.prev = 12;
            _context.next = 15;
            return func.apply(ctx, values);

          case 15:
            return _context.abrupt('return', _context.sent);

          case 18:
            _context.prev = 18;
            _context.t1 = _context['catch'](12);
            throw new Error('api\u5206\u652F\u6267\u884C\u5224\u65AD\u6761\u4EF6\u7684\u51FD\u6570\u65F6\u51FA\u73B0\u9519\u8BEF\uFF1A' + _context.t1.message);

          case 21:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[5, 9], [12, 18]]);
  }));

  function execFunction(_x) {
    return _ref.apply(this, arguments);
  }

  return execFunction;
}();