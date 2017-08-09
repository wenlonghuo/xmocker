'use strict';

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function execFunction(ctx) {
  var condition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (condition.indexOf('return') < 0) condition = 'return ' + condition;
  var entries = Object.entries(params);
  var keys = entries.map(function (en) {
    return en[0];
  });
  var values = entries.map(function (en) {
    return en[1];
  });
  var func = void 0;

  keys.push(condition);
  try {
    func = new (Function.prototype.bind.apply(Function, [null].concat((0, _toConsumableArray3.default)(keys))))();
  } catch (e) {
    throw new Error('\u5206\u652F\u5224\u65AD\u51FD\u6570\u4E0D\u5408\u6CD5' + e.message);
  }

  try {
    return func.apply(ctx, values);
  } catch (e) {
    throw new Error('api\u5206\u652F\u6267\u884C\u5224\u65AD\u6761\u4EF6\u7684\u51FD\u6570\u65F6\u51FA\u73B0\u9519\u8BEF\uFF1A' + e.message);
  }
};