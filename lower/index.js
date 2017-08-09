'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var spawn = require('child_process').spawn;
var path = require('path');

var Mocker = function () {
  function Mocker(options) {
    (0, _classCallCheck3.default)(this, Mocker);

    this.option = Object.assign({}, options);
    this._uid = 0;
    this.reqList = [];
  }

  (0, _createClass3.default)(Mocker, [{
    key: 'start',
    value: function start() {
      var _this = this;

      var dir = resolve('./app');
      var startArgs = ['"' + dir + '"', '--option="' + convertCode(JSON.stringify(this.option)) + '"'];
      return new Promise(function (resolve, reject) {
        var server = spawn('node', startArgs, {
          stdio: ['pipe', 'ipc', 'pipe'],
          shell: true
        });

        server.stderr.on('data', function (e) {
          console.error(e.toString());
        });
        server.on('exit', function (code, signal) {
          reject({ code: code, signal: signal, option: _this.option });
        });

        server.on('message', function (msg) {
          if ((typeof msg === 'undefined' ? 'undefined' : (0, _typeof3.default)(msg)) === 'object') {
            if (msg.type === 'finish') {
              resolve(msg.data);
            } else if (msg.type === 'console') {
              console.log(msg);
            } else if (msg.type === 'log') {
              _this.emit('log', msg);
            } else {
              _this.reqHandler(msg);
            }
          }
        });
        _this.server = server;
      });
    }
  }, {
    key: 'reqHandler',
    value: function reqHandler(msg) {
      if (msg._uid) {
        var reqIndex = this.reqList.findIndex(function (item) {
          return item._uid === msg._uid;
        });
        if (~reqIndex) {
          var req = this.reqList.splice(reqIndex, 1)[0];
          if (msg.status === 0) {
            req.resolve(msg);
          } else {
            req.reject(msg);
          }
        }
      }
    }
  }, {
    key: 'send',
    value: function send(action, data) {
      var _this2 = this;

      if (!this.server) throw new Error('server has not started!');
      var msg = { action: action, data: data, _uid: this._uid++ };
      this.server.send(msg);
      return new Promise(function (resolve, reject) {
        _this2.reqList.push({ _uid: msg._uid, resolve: resolve, reject: reject });
      });
    }
  }, {
    key: 'reconfig',
    value: function reconfig(option) {}
  }, {
    key: 'refresh',
    value: function refresh(option) {
      this.send('refresh', option);
    }
  }, {
    key: 'setLinkViews',
    value: function setLinkViews(option) {
      this.send('setLinkViews', option);
    }
  }, {
    key: 'setApiReturn',
    value: function setApiReturn(option) {
      this.send('setApiReturn', option);
    }
  }, {
    key: 'getApiReturns',
    value: function getApiReturns(option) {
      this.send('getApiReturns', option);
    }
  }, {
    key: 'setProxyMode',
    value: function setProxyMode(option) {
      this.send('setProxyMode', option);
    }
  }, {
    key: 'reloadApis',
    value: function reloadApis(option) {
      this.send('reloadApis', option);
    }
  }, {
    key: 'exit',
    value: function exit(option) {
      this.send('exit', option);
    }
  }, {
    key: 'restart',
    value: function restart(option) {
      this.send('restart', option);
    }
  }]);
  return Mocker;
}();

function resolve(dir) {
  return path.join(__dirname, dir);
}

function convertCode(param) {
  var p = param || '';
  return encodeURIComponent(p);
}

module.exports = Mocker;