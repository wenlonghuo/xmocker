'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var refresh = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx, next) {
    var pages;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            pages = ctx.query.pages;

            wsctrl.broadcast({ action: 'reload', pages: pages });
            ctx.body = 'ok';

          case 3:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function refresh(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var storePageList = function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(ctx, next) {
    var param, pages;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            param = ctx.request.body;

            if (param) {
              _context2.next = 3;
              break;
            }

            return _context2.abrupt('return');

          case 3:
            pages = param.html || [];

            LINK.list = pages.map(function (url) {
              if ((typeof url === 'undefined' ? 'undefined' : (0, _typeof3.default)(url)) === 'object') return url;

              return {
                _path: url.replace(/index.html$/, '').replace(/\/|\\/g, ''),
                path: url.replace(/index.html$/, '').replace(/\/|\\/g, ''),
                url: url
              };
            });
            setLinkData();
            ctx.body = 'ok';

          case 7:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function storePageList(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

var serveView = function () {
  var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(ctx, next) {
    var query, info, complied;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            query = ctx.query;

            if (!LINK.localAddr) LINK.localAddr = 'http://' + serverInfo.local.ip + ':' + serverInfo.option.port;
            info = Object.assign({}, LINK, { query: query });
            complied = template(htmlStr);

            ctx.body = complied(info);

          case 5:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function serveView(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs');
var url = require('url');
var path = require('path');

var _ = require('lodash');
var template = _.template;
var serverInfo = global.serverInfo;

var htmlStr = fs.readFileSync(path.join(__dirname, '../tmpl/link.tmpl'), { encoding: 'utf-8' });

var LINK = {
  list: [],
  urls: [],
  configList: [],
  configNoList: [],
  unconfigList: []
};

function combineUrl(arr, commonParams) {
  if (!Array.isArray(arr)) arr = [];
  var urlArr = [];
  arr.forEach(function (item) {
    if (item.list) {
      urlArr.push.apply(urlArr, (0, _toConsumableArray3.default)(combineUrl(item.list, commonParams)));
      return;
    }
    if (item.path) {
      item._path = item.path.replace(/index.html$/, '').replace(/\/|\\/g, '');
      var urlObj = url.parse(item.path);
      var params = Object.assign({}, item.params, commonParams);
      var _arr = [];
      Object.keys(params).forEach(function (key) {
        _arr.push(key + '=' + params[key]);
      });
      urlObj.search += '&' + _arr.join('&');
      item._url = url.format(urlObj);
    } else {
      item._url = item.url;
    }
    urlArr.push(item);
  });
  return urlArr;
}

function setLinkData() {
  LINK.configList = [];
  LINK.configNoList = [];
  LINK.unconfigList = [];
  var option = serverInfo.option;

  var linkViews = combineUrl(option.linkViews, option.linkParams);
  var storeList = combineUrl(LINK.list, option.linkParams);
  LINK.urls = linkViews;
  LINK.list = storeList;

  linkViews.forEach(function (item) {
    var exist = storeList.find(function (link) {
      return item._path === link._path;
    });
    if (exist) {
      LINK.configList.push(item);
    } else {
      LINK.configNoList.push(item);
    }
  });

  storeList.forEach(function (link) {
    if (!linkViews.find(function (item) {
      return item._path === link._path;
    })) {
      LINK.unconfigList.push(link);
    }
  });
}

var wsctrl = require('./controller.ws');


module.exports = {
  setLinkData: setLinkData,
  serveView: serveView,
  storePageList: storePageList,
  refresh: refresh
};