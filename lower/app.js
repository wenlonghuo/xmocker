'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Koa = require('koa');
var app = new Koa();
var minimist = require('minimist');
var bodyParser = require('koa-bodyparser')();

console.log = function log() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  args = args.map(function (item) {
    if (item instanceof Error) {
      item = { err: item.message, stack: item.stack };
    }
    return item;
  });

  var msg = {
    action: 'console',
    time: +new Date(),
    data: args
  };
  process.send(msg);
};

var args = minimist(process.argv.slice(2));
var option = args.option ? JSON.parse(decodeURIComponent(args.option)) : {};

global.serverInfo = {
  option: option,
  apiList: [],
  status: {},
  fixedApis: {},
  local: require('./util/getLocalInfo')
};

app.use(bodyParser);

var actions = require('./controller/controller.comm');
var start = require('./controller/controller.start');

if (option.source) {
  var starter = option.source.type === 'database' ? start.startServerByDataBase(app, option) : start.startServerByOption(app, option);
  starter.then(function (data) {
    process.send({ action: 'finish', data: global.serverInfo.option });
  });
}

process.on('message', function (msg) {
  if ((typeof msg === 'undefined' ? 'undefined' : (0, _typeof3.default)(msg)) !== 'object') return;
  if (msg.action) {
    if (actions[msg.action]) {
      actions[msg.action](msg);
    } else {
      actions.error(msg._uid, 'not found function');
    }
  }
});
process.on('unhandledRejection', function (e) {
  throw e;
});