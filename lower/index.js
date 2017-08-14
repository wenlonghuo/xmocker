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
    this._uid = 1;
    this.reqList = [];

    this.status = 2;
  }

  (0, _createClass3.default)(Mocker, [{
    key: 'start',
    value: function start(log) {
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
          if (code !== 0) {
            _this.status = 1;
            reject({ code: code, signal: signal, option: _this.option });
          }
        });

        server.on('message', function (msg) {
          if ((typeof msg === 'undefined' ? 'undefined' : (0, _typeof3.default)(msg)) === 'object') {
            if (msg.action === 'finish') {
              _this.status = 3;
              _this._option = msg.data;
              resolve(msg.data);
            } else if (msg.action === 'console') {
              console.log(msg);
            } else if (msg.action === 'log') {
              if (log) {
                log(msg);
              }
            } else {
              _this._reqHandler(msg);
            }
          }
        });
        _this.server = server;
      });
    }
  }, {
    key: '_reqHandler',
    value: function _reqHandler(msg) {
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
    key: '_send',
    value: function _send(action, data) {
      var _this2 = this;

      if (!this.server) throw new Error('server has not started!');
      var msg = { action: action, data: data, _uid: this._uid++ };
      this.server._send(msg);
      return new Promise(function (resolve, reject) {
        _this2.reqList.push({ _uid: msg._uid, resolve: resolve, reject: reject });
      });
    }
  }, {
    key: 'reconfig',
    value: function reconfig(option) {
      return this._send('reconfig', option);
    }
  }, {
    key: 'refresh',
    value: function refresh(option) {
      return this._send('refresh', option);
    }
  }, {
    key: 'setLinkViews',
    value: function setLinkViews(option) {
      return this._send('setLinkViews', option);
    }
  }, {
    key: 'setApiReturn',
    value: function setApiReturn(option) {
      return this._send('setApiReturn', option);
    }
  }, {
    key: 'getApiReturns',
    value: function getApiReturns(option) {
      return this._send('getApiReturns', option);
    }
  }, {
    key: 'setProxyMode',
    value: function setProxyMode(option) {
      return this._send('setProxyMode', option);
    }
  }, {
    key: 'reloadApis',
    value: function reloadApis(option) {
      return this._send('reloadApis', option);
    }
  }, {
    key: 'exit',
    value: function exit(option) {
      var _this3 = this;

      if (!this.server) return Promise.reject('server has not started!');
      return new Promise(function (resolve, reject) {
        _this3.server.on('exit', function (code, signal) {
          delete _this3.server;
          _this3.status = 0;
          resolve(_this3);
        });
        _this3._send('exit', option);
      });
    }
  }, {
    key: 'restart',
    value: function restart(option) {
      return this._send('restart', option);
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