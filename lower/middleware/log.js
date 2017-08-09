'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var errorExp = /\$\{msg\}/gi;
var uaParser = require('ua-parser-js');
var serverInfo = global.serverInfo;

function formatParam(ctx, data) {
  var option = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var source = serverInfo.option.source;
  var base = option.base || {};
  var model = option.model || {};
  var e = option.e;
  var ua = uaParser(ctx.headers['user-agent']);
  ua.ip = ctx.ip;

  var msg = {
    time: Date.now(),
    args: {
      port: serverInfo.option.port,
      fsPath: source.root
    },
    projectId: source._id,
    project: option.projectName,
    data: data,
    apiId: base._id,
    api: base.name,
    apiModelId: model._id,
    apiModel: model.name,
    req: {
      params: option.params,
      url: ctx.url,
      method: ctx.method
    },
    reqParsed: option.dealedParams,
    res: option.res || ctx.body,
    client: ua,
    additional: option.additional
  };
  if (e) {
    msg.err = {
      msg: e.message,
      stack: e.stack
    };
  }
  return msg;
}

function logError(ctx, msg) {
  var option = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var data = formatParam(ctx, msg, option);
  data._type = 'error';
  data.level = option.level || 8;
  process.send(data);
}

function toError(ctx, msg) {
  var option = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var errorModel = JSON.stringify(serverInfo.option.errorTmpl) || '{"code": -1, "codeDesc":"${msg}", "codeDescUser":"${msg}"}';
  ctx.logE(msg, option);
  ctx.body = formatError(errorModel, msg);
}

function logHis(ctx, msg) {
  var option = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var data = formatParam(ctx, msg, option);
  data._type = 'his';
  data.level = option.level || 8;
  process.send(data);
}

function logProxy(ctx, msg) {
  var option = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var data = formatParam(ctx, msg, option);
  data._type = 'proxy';
  data.level = option.level || 8;
  process.send(data);
}

module.exports = function () {
  return function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx, next) {
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              ctx.logE = logError.bind(null, ctx);
              ctx.toError = toError.bind(null, ctx);
              ctx.log = logHis.bind(null, ctx);

              return _context.abrupt('return', next());

            case 4:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function logBind(_x6, _x7) {
      return _ref.apply(this, arguments);
    }

    return logBind;
  }();
};

module.exports.logError = logError;
module.exports.toError = toError;
module.exports.logHis = logHis;
module.exports.logProxy = logProxy;

function formatError(model, msg) {
  var str = model.replace(errorExp, msg);
  var obj = void 0;
  try {
    obj = JSON.parse(str);
  } catch (e) {
    console.log('项目中错误串无法转换为obj。');
  }
  return obj;
}