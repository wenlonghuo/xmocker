'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var findAppBase = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(db) {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return db.appBase.cfindOne({}).exec();

          case 3:
            return _context.abrupt('return', _context.sent);

          case 6:
            _context.prev = 6;
            _context.t0 = _context['catch'](0);

            console.log(_context.t0);
            return _context.abrupt('return');

          case 10:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 6]]);
  }));

  return function findAppBase(_x) {
    return _ref.apply(this, arguments);
  };
}();

var findProjectById = function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(db, projectId) {
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return db.project.cfindOne({ _id: projectId }).exec();

          case 3:
            return _context2.abrupt('return', _context2.sent);

          case 6:
            _context2.prev = 6;
            _context2.t0 = _context2['catch'](0);

            console.log(_context2.t0);
            return _context2.abrupt('return');

          case 10:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[0, 6]]);
  }));

  return function findProjectById(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
}();

var startServerByDataBase = function () {
  var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(app, option) {
    var db, appConfig, proj, gInfo, finalOption, server;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            assert(option.source.projectId, 'projectId must be provided');

            db = require('../database').init(option).dbs;
            _context3.next = 4;
            return findAppBase(db);

          case 4:
            _context3.t0 = _context3.sent;

            if (_context3.t0) {
              _context3.next = 7;
              break;
            }

            _context3.t0 = {};

          case 7:
            appConfig = _context3.t0;
            _context3.next = 10;
            return findProjectById(db, option.source.projectId);

          case 10:
            proj = _context3.sent;

            assert(proj, 'project is not found: ' + option.source.projectId);

            if (option.source && option.source.common && option.source.common.length > 3) {
              process.emitWarning('common db too much will cause slow reaction and higher memory used');
            }

            gInfo = global.serverInfo;
            finalOption = getOptionFromProj(proj);

            finalOption.mainPort = appConfig.mainPort || 6001;
            Object.assign(gInfo.option, finalOption, option);
            gInfo.option.commonProjs = gInfo.option.commonProjs || [];
            if (proj.parentId) gInfo.option.commonProjs.unshift(proj.parentId);

            gInfo.option.source.projectName = proj.name;
            _context3.next = 22;
            return startupServer(app, option);

          case 22:
            server = _context3.sent;
            return _context3.abrupt('return', server);

          case 24:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function startServerByDataBase(_x4, _x5) {
    return _ref3.apply(this, arguments);
  };
}();

var startServerByOption = function () {
  var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(app) {
    var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var defaultOption, server;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            defaultOption = {
              port: 6000,
              inject: false,
              linkViews: true,
              linkParams: {}
            };

            option = Object.assign({}, defaultOption, option);
            if (option.root) {
              option.staticPaths = option.staticPaths || [];
              option.staticPaths.unshift(option.root);
            }

            option.inject = evalStringBool(option.inject);
            option.history = evalStringBool(option.history);
            Object.assign(global.serverInfo.option, option);
            _context4.next = 8;
            return startupServer(app, option);

          case 8:
            server = _context4.sent;
            return _context4.abrupt('return', server);

          case 10:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function startServerByOption(_x6) {
    return _ref4.apply(this, arguments);
  };
}();

var startupServer = function () {
  var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(app) {
    var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return _regenerator2.default.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            return _context8.abrupt('return', new Promise(function (resolve, reject) {
              app.use(log());

              app.use(require('../middleware/proxyTo').proxyToGlobal({
                status: 404,
                error: log.toError,
                deal: log.logProxy
              }));

              app.use(require('../middleware/proxyTo').setProxyGlobal({
                status: 404,
                error: log.toError,
                deal: log.logProxy
              }));

              if (option.history) {
                var redirectPath = typeof option.history === 'boolean' ? '/' : option.history;
                app.use(function () {
                  var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(ctx, next) {
                    return _regenerator2.default.wrap(function _callee6$(_context6) {
                      while (1) {
                        switch (_context6.prev = _context6.next) {
                          case 0:
                            return _context6.abrupt('return', next().then((0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
                              var accept, sendAsync;
                              return _regenerator2.default.wrap(function _callee5$(_context5) {
                                while (1) {
                                  switch (_context5.prev = _context5.next) {
                                    case 0:
                                      accept = ctx.headers['accept'];

                                      if (!(ctx.status !== 404 || !~accept.indexOf('text/html'))) {
                                        _context5.next = 3;
                                        break;
                                      }

                                      return _context5.abrupt('return');

                                    case 3:
                                      sendAsync = sendFile(ctx, redirectPath, {
                                        root: option.root,
                                        index: 'index.html',
                                        serverOption: option,
                                        plugin: htmlInject
                                      });
                                      _context5.next = 6;
                                      return sendAsync();

                                    case 6:
                                    case 'end':
                                      return _context5.stop();
                                  }
                                }
                              }, _callee5, this);
                            }))));

                          case 1:
                          case 'end':
                            return _context6.stop();
                        }
                      }
                    }, _callee6, this);
                  }));

                  return function (_x10, _x11) {
                    return _ref6.apply(this, arguments);
                  };
                }());
              }

              if (option.staticPaths) {
                option.staticPaths.forEach(function (dir) {
                  var absDir = dir.trim();
                  if (option.root && !path.isAbsolute(absDir)) {
                    absDir = path.join(option.root, absDir);
                  }

                  app.use(function () {
                    var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(ctx, next) {
                      return _regenerator2.default.wrap(function _callee7$(_context7) {
                        while (1) {
                          switch (_context7.prev = _context7.next) {
                            case 0:
                              return _context7.abrupt('return', next().then(sendFile(ctx, ctx.path, {
                                root: absDir,
                                index: 'index.html',
                                serverOption: option,
                                plugin: htmlInject
                              })));

                            case 1:
                            case 'end':
                              return _context7.stop();
                          }
                        }
                      }, _callee7, this);
                    }));

                    return function (_x12, _x13) {
                      return _ref8.apply(this, arguments);
                    };
                  }());
                });
              }

              app.use(require('../router.js')(option).routes());

              var httpServer = http.createServer(app.callback());

              wsctrl.init(httpServer);

              httpServer.listen(option.port, function (e) {
                resolve();
              });
              global.serverInfo.server = httpServer;

              require('./controller.inject').setLinkData();
              return httpServer;
            }));

          case 1:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, this);
  }));

  return function startupServer(_x8) {
    return _ref5.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var assert = require('assert');
var path = require('path');
var http = require('http');
var sendFile = require('../plugin/file-server');
var htmlInject = require('../util/file-server-inject');
var log = require('../middleware/log');
var wsctrl = require('./controller.ws.js');

module.exports = {
  startServerByDataBase: startServerByDataBase,
  startServerByOption: startServerByOption
};


function getOptionFromProj(proj) {
  var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var op = {
    port: proj.port,
    root: (proj.path || '').trim(),
    proxy404: proj.proxyTo,
    proxyMode: proj.proxyType || 0,
    linkViews: proj.urls,
    inject: proj.injectHtml,
    staticPaths: proj.staticPath || [],
    proxyTable: proj.proxyTable || []
  };

  if (op.root) {
    var gulp = proj.gulp || {};
    var gulpPath = (gulp.buildPath || '').trim();
    if (gulpPath) {
      op.staticPaths.unshift(path.join(op.root, gulpPath));
    } else {
      op.staticPaths.unshift(op.root);
    }
  }

  return op;
}

function evalStringBool(str) {
  if (str === 'true' || str === 'false') {
    return JSON.parse(str);
  }
  return str;
}