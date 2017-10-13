'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var spawn = require('child_process').spawn;
var path = require('path');
var WebSocket = require('ws');

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

      this._log = log;
      var dir = resolve('./app');
      var startArgs = ['"' + dir + '"', '--option="' + convertCode(JSON.stringify(this.option)) + '"'];
      return new Promise(function (resolve, reject) {
        var server = spawn('node', startArgs, {
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

        server.stdout.on('data', function (data) {
          data = data.toString();
          if (/^finish::/.test(data)) {
            data = JSON.parse(data.slice(8));
            _this._port = data.port;

            var ws = new WebSocket('ws://localhost:' + _this._port + '/owners');

            ws.on('message', _this._dealWsMsg.bind(_this));

            ws.on('open', function () {
              _this.ws = ws;
              _this.status = 3;
              resolve(data);
            });
            ws.on('error', function (e) {
              reject(e);
            });
            ws.on('close', function (e) {
              console.log('maybe something is wrong...', e);
              if (_this.status > 1) {
                _this._reConnectSocket();
              }
            });

            return;
          }
          console.log(data);
        });
        _this.server = server;
      });
    }
  }, {
    key: '_dealWsMsg',
    value: function _dealWsMsg(req) {
      try {
        req = JSON.parse(req);
      } catch (e) {
        console.log(e);
        return;
      }
      if (req._uid) {
        return this._reqHandler(req);
      }

      if (req.action === 'console') {
        return console.log(req);
      }
      if (req.action === 'log' && this._log) {
        this._log(req);
      }
    }
  }, {
    key: '_reConnectSocket',
    value: function _reConnectSocket() {
      var _this2 = this;

      var ws = new WebSocket('ws://localhost:' + this._port + '/owners');

      ws.on('message', this._dealWsMsg.bind(this));

      ws.on('open', function () {
        _this2.ws = ws;
      });
      ws.on('close', function (e) {
        if (_this2.status > 1) {
          _this2._wsHandler = setTimeout(_this2._reConnectSocket.bind(_this2), 1000);
        }
      });
      ws.on('error', function (e) {});
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
      var _this3 = this;

      if (!this.server) throw new Error('server has not started!');
      var msg = { action: action, data: data, _uid: this._uid++ };
      this.ws.send(JSON.stringify(msg));
      return new Promise(function (resolve, reject) {
        _this3.reqList.push({ _uid: msg._uid, resolve: resolve, reject: reject });
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
      var _this4 = this;

      if (!this.server) return Promise.reject('server has not started!');
      return new Promise(function (resolve, reject) {
        _this4.server.on('exit', function (code, signal) {
          delete _this4.server;
          _this4.status = 0;
          resolve(_this4);
        });
        _this4._send('exit', option);
        clearTimeout(_this4._wsHandler);
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