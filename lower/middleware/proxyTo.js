'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var execProxyList = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx, proxyReg) {
    var i;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            i = 0;

          case 1:
            if (!(i < proxyReg.length)) {
              _context.next = 16;
              break;
            }

            if (!proxyReg[i].reg.test(ctx.path)) {
              _context.next = 13;
              break;
            }

            ctx.req.body = ctx.request.body;
            _context.prev = 4;
            _context.next = 7;
            return execProxy(ctx, proxyReg[i].target);

          case 7:
            return _context.abrupt('return', _context.sent);

          case 10:
            _context.prev = 10;
            _context.t0 = _context['catch'](4);
            throw _context.t0;

          case 13:
            i++;
            _context.next = 1;
            break;

          case 16:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[4, 10]]);
  }));

  return function execProxyList(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var execProxy = function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(ctx, target) {
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            ctx.req.body = ctx.request.body;
            _context2.prev = 1;
            _context2.next = 4;
            return proxy.web(ctx.req, ctx.res, { target: target });

          case 4:
            _context2.next = 9;
            break;

          case 6:
            _context2.prev = 6;
            _context2.t0 = _context2['catch'](1);
            throw _context2.t0;

          case 9:
            return _context2.abrupt('return', ctx.res.proxyBody || null);

          case 10:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[1, 6]]);
  }));

  return function execProxy(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var assert = require('assert');
var proxy = require('../plugin/proxy')();

function toReg(table) {
  assert(Array.isArray(table), 'proxyTable must be an array');
  var proxyReg = [];
  table.forEach(function (p) {
    if (!p.api || !p.target) {
      console.error('proxy table must has api or target key, ' + JSON.stringify(p));
      return;
    }
    proxyReg.push({ reg: new RegExp(p.api), target: p.target });
  });
  return proxyReg;
}

function setProxy(table, _ref3) {
  var err = _ref3.err,
      deal = _ref3.deal;

  var proxyReg = toReg(table);
  return function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(ctx, next) {
      var data;
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              data = void 0;
              _context3.prev = 1;
              _context3.next = 4;
              return execProxyList(ctx, proxyReg);

            case 4:
              data = _context3.sent;
              _context3.next = 11;
              break;

            case 7:
              _context3.prev = 7;
              _context3.t0 = _context3['catch'](1);

              if (err) err.call(ctx, ctx, '\u4EE3\u7406\u670D\u52A1\u5668\u5931\u8D25\uFF1A' + ctx.path, { e: _context3.t0 });
              return _context3.abrupt('return');

            case 11:
              if (deal) deal.call(ctx, ctx, '代理成功', { res: data });

              if (!(data !== undefined)) {
                _context3.next = 14;
                break;
              }

              return _context3.abrupt('return', next());

            case 14:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this, [[1, 7]]);
    }));

    function proxyTo(_x5, _x6) {
      return _ref4.apply(this, arguments);
    }

    return proxyTo;
  }();
}

function proxyTo(target, _ref5) {
  var status = _ref5.status,
      err = _ref5.err,
      deal = _ref5.deal;

  return function () {
    var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(ctx, next) {
      var _this = this;

      return _regenerator2.default.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              return _context5.abrupt('return', next().then((0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
                var data;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        if (!(status === undefined || ctx.status === status)) {
                          _context4.next = 13;
                          break;
                        }

                        data = void 0;
                        _context4.prev = 2;
                        _context4.next = 5;
                        return execProxy(ctx, target);

                      case 5:
                        data = _context4.sent;
                        _context4.next = 12;
                        break;

                      case 8:
                        _context4.prev = 8;
                        _context4.t0 = _context4['catch'](2);

                        if (err) err.call(ctx, ctx, '\u4EE3\u7406\u670D\u52A1\u5668\u5931\u8D25\uFF1A' + (target + ctx.path), { e: _context4.t0 });
                        return _context4.abrupt('return');

                      case 12:
                        if (deal) deal.call(ctx, ctx, '代理成功', { res: data });

                      case 13:
                      case 'end':
                        return _context4.stop();
                    }
                  }
                }, _callee4, _this, [[2, 8]]);
              }))));

            case 1:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    return function (_x7, _x8) {
      return _ref6.apply(this, arguments);
    };
  }();
}

function setProxyGlobal(_ref8) {
  var err = _ref8.err,
      deal = _ref8.deal;

  return function () {
    var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(ctx, next) {
      var table, proxyReg, data;
      return _regenerator2.default.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              table = global.serverInfo.option.proxyTable;

              if (!(!table || !table.length)) {
                _context6.next = 3;
                break;
              }

              return _context6.abrupt('return', next());

            case 3:
              proxyReg = toReg(table);
              data = void 0;
              _context6.prev = 5;
              _context6.next = 8;
              return execProxyList(ctx, proxyReg);

            case 8:
              data = _context6.sent;
              _context6.next = 15;
              break;

            case 11:
              _context6.prev = 11;
              _context6.t0 = _context6['catch'](5);

              if (err) err.call(ctx, ctx, '\u4EE3\u7406\u670D\u52A1\u5668\u5931\u8D25\uFF1A' + ctx.path, { e: _context6.t0 });
              return _context6.abrupt('return');

            case 15:
              if (deal) deal.call(ctx, ctx, '代理成功', { res: data });

              if (!(data === undefined)) {
                _context6.next = 18;
                break;
              }

              return _context6.abrupt('return', next());

            case 18:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, this, [[5, 11]]);
    }));

    function proxyTo(_x9, _x10) {
      return _ref9.apply(this, arguments);
    }

    return proxyTo;
  }();
}

function proxyToGlobal(_ref10) {
  var status = _ref10.status,
      err = _ref10.err,
      deal = _ref10.deal;

  return function () {
    var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(ctx, next) {
      var _this2 = this;

      var target;
      return _regenerator2.default.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              target = global.serverInfo.option.proxy404;
              return _context8.abrupt('return', next().then((0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7() {
                var data;
                return _regenerator2.default.wrap(function _callee7$(_context7) {
                  while (1) {
                    switch (_context7.prev = _context7.next) {
                      case 0:
                        if (!(!target || !~~global.serverInfo.option.proxyMode)) {
                          _context7.next = 2;
                          break;
                        }

                        return _context7.abrupt('return');

                      case 2:
                        if (!(status === undefined || ctx.status === status)) {
                          _context7.next = 15;
                          break;
                        }

                        data = void 0;
                        _context7.prev = 4;
                        _context7.next = 7;
                        return execProxy(ctx, target);

                      case 7:
                        data = _context7.sent;
                        _context7.next = 14;
                        break;

                      case 10:
                        _context7.prev = 10;
                        _context7.t0 = _context7['catch'](4);

                        if (err) err.call(ctx, ctx, '\u4EE3\u7406\u670D\u52A1\u5668\u5931\u8D25\uFF1A' + (target + ctx.path), { e: _context7.t0 });
                        return _context7.abrupt('return');

                      case 14:
                        if (deal) deal.call(ctx, ctx, '代理成功', { res: data });

                      case 15:
                      case 'end':
                        return _context7.stop();
                    }
                  }
                }, _callee7, _this2, [[4, 10]]);
              }))));

            case 2:
            case 'end':
              return _context8.stop();
          }
        }
      }, _callee8, this);
    }));

    return function (_x11, _x12) {
      return _ref11.apply(this, arguments);
    };
  }();
}

module.exports = setProxy;
module.exports.proxyTo = proxyTo;
module.exports.setProxyGlobal = setProxyGlobal;
module.exports.proxyToGlobal = proxyToGlobal;