'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs');
var parseURL = require('../util/url-params');
var jsonGate = require('../plugin/json-gate/json-gate');
var createSchema = jsonGate.createSchema;
var execFunc = require('../util/exec-func');
var db = require('../database/');
var _ = require('lodash');

var common = {
  findApi: function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx, next) {
      var serverInfo, api, base, apiList, params, i, urlParam;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              serverInfo = global.serverInfo;

              if (!(~~serverInfo.option.proxyMode === 1)) {
                _context.next = 3;
                break;
              }

              return _context.abrupt('return');

            case 3:
              _context.prev = 3;
              _context.next = 6;
              return this.fetchApiList();

            case 6:
              _context.next = 11;
              break;

            case 8:
              _context.prev = 8;
              _context.t0 = _context['catch'](3);
              return _context.abrupt('return', ctx.toError('获取API列表失败', { e: _context.t0 }));

            case 11:
              api = void 0, base = void 0;
              apiList = serverInfo.apiList;
              params = Object.assign({}, ctx.query || {}, ctx.request.body);
              i = 0;

            case 15:
              if (!(i < apiList.length)) {
                _context.next = 31;
                break;
              }

              api = apiList[i];

              if (!(api.method.toUpperCase() !== ctx.method)) {
                _context.next = 19;
                break;
              }

              return _context.abrupt('continue', 28);

            case 19:
              urlParam = parseURL(api.url, ctx.path);

              if (urlParam) {
                _context.next = 22;
                break;
              }

              return _context.abrupt('continue', 28);

            case 22:
              if (!api.path) {
                _context.next = 25;
                break;
              }

              if (!(params[api.path] !== api.pathEqual)) {
                _context.next = 25;
                break;
              }

              return _context.abrupt('continue', 28);

            case 25:
              base = api;
              Object.assign(params, urlParam);
              return _context.abrupt('break', 31);

            case 28:
              i++;
              _context.next = 15;
              break;

            case 31:
              if (base) {
                _context.next = 33;
                break;
              }

              return _context.abrupt('return');

            case 33:

              ctx.matchedApi = { base: base, params: params };

              return _context.abrupt('return', next());

            case 35:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this, [[3, 8]]);
    }));

    function findApi(_x, _x2) {
      return _ref.apply(this, arguments);
    }

    return findApi;
  }(),
  findModel: function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(ctx, next) {
      var _ctx$matchedApi, base, oriParams, finalParams, models, model, targetModel, params, i, condition, _params, inputParam, sourceModel, data, result;

      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (ctx.matchedApi) {
                _context2.next = 2;
                break;
              }

              return _context2.abrupt('return', next());

            case 2:
              _ctx$matchedApi = ctx.matchedApi, base = _ctx$matchedApi.base, oriParams = _ctx$matchedApi.params;
              finalParams = void 0;
              models = void 0;
              _context2.prev = 5;
              _context2.next = 8;
              return this.fetchModelList(base);

            case 8:
              models = _context2.sent;
              _context2.next = 14;
              break;

            case 11:
              _context2.prev = 11;
              _context2.t0 = _context2['catch'](5);
              return _context2.abrupt('return', ctx.toError('查询分支失败', { e: _context2.t0 }));

            case 14:
              model = void 0, targetModel = void 0;
              params = oriParams;
              i = 0;

            case 17:
              if (!(i < models.length)) {
                _context2.next = 40;
                break;
              }

              model = models[i];
              condition = model.condition || '';

              condition = condition.trim();

              if (!(condition === '')) {
                _context2.next = 24;
                break;
              }

              targetModel = model;
              return _context2.abrupt('continue', 37);

            case 24:
              _context2.prev = 24;
              _params = _.cloneDeep(oriParams);
              inputParam = model.inputParam || base.inputParam;

              if (inputParam && Object.keys(inputParam).length) {
                createSchema(inputParam).format(_params);
              }

              if (!execFunc(ctx, condition, _params)) {
                _context2.next = 32;
                break;
              }

              finalParams = _params;
              targetModel = model;
              return _context2.abrupt('break', 40);

            case 32:
              _context2.next = 37;
              break;

            case 34:
              _context2.prev = 34;
              _context2.t1 = _context2['catch'](24);
              return _context2.abrupt('return', ctx.toError(_context2.t1, { base: base, model: model, params: params, e: _context2.t1 }));

            case 37:
              i++;
              _context2.next = 17;
              break;

            case 40:
              if (!(!targetModel && base.data == null && !(base.afterFunc || '').trim() && !base.outputParam)) {
                _context2.next = 42;
                break;
              }

              return _context2.abrupt('return', ctx.toError('该API暂无数据', { base: base, params: params }));

            case 42:
              sourceModel = targetModel || base || {};

              params = finalParams;
              data = void 0;
              _context2.prev = 45;
              result = getFinalData({ sourceModel: sourceModel, base: base, oriParams: oriParams, parsedParams: finalParams, ctx: ctx });

              params = result.params;
              data = result.data;
              _context2.next = 54;
              break;

            case 51:
              _context2.prev = 51;
              _context2.t2 = _context2['catch'](45);
              return _context2.abrupt('return', ctx.toError(_context2.t2, { base: base, model: model, params: params, e: _context2.t2 }));

            case 54:

              ctx.log('获取api数据成功：' + base.name, { base: base, model: targetModel, params: params, res: data });

              _context2.next = 57;
              return delay(base.delay);

            case 57:
              ctx.body = data;
              return _context2.abrupt('return', next());

            case 59:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this, [[5, 11], [24, 34], [45, 51]]);
    }));

    function findModel(_x3, _x4) {
      return _ref2.apply(this, arguments);
    }

    return findModel;
  }()
};

var databaseOperator = {
  findFix: function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(ctx, next) {
      var _ctx$matchedApi2, base, params, fixedApis, fixData, type, data, _data, model, result;

      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _ctx$matchedApi2 = ctx.matchedApi, base = _ctx$matchedApi2.base, params = _ctx$matchedApi2.params;
              fixedApis = global.serverInfo.fixedApis;
              fixData = fixedApis[base._id];

              if (fixData) {
                _context3.next = 5;
                break;
              }

              return _context3.abrupt('return', next());

            case 5:
              type = ~~fixData.type;

              if (!(type === 1)) {
                _context3.next = 21;
                break;
              }

              _context3.prev = 7;
              _context3.next = 10;
              return db.dbs.Lib.cfindOne({ _id: fixData.id }).exec();

            case 10:
              data = _context3.sent;

              if (data) {
                _context3.next = 13;
                break;
              }

              return _context3.abrupt('return', next());

            case 13:
              ctx.body = convertStrToJSON(data.model);
              _context3.next = 19;
              break;

            case 16:
              _context3.prev = 16;
              _context3.t0 = _context3['catch'](7);
              return _context3.abrupt('return', ctx.toError('指定的模板值不存在！', { e: _context3.t0 }));

            case 19:
              _context3.next = 51;
              break;

            case 21:
              if (!(type === 2)) {
                _context3.next = 25;
                break;
              }

              ctx.throw(fixData.data.code, fixData.data.message);
              _context3.next = 51;
              break;

            case 25:
              if (!(type === 3)) {
                _context3.next = 50;
                break;
              }

              _context3.prev = 26;
              _data = void 0, model = void 0;

              if (!(String(fixData.id) !== '0')) {
                _context3.next = 34;
                break;
              }

              _context3.next = 31;
              return db.dbs.apiModel.cfindOne({ _id: fixData.id }).exec();

            case 31:
              model = _context3.sent;

              if (model) {
                _context3.next = 34;
                break;
              }

              return _context3.abrupt('return', ctx.toError('指定的分支不存在！'));

            case 34:
              _context3.prev = 34;
              result = getFinalData({ sourceModel: model, base: base, oriParams: params, ctx: ctx });

              _data = result.data;
              _context3.next = 42;
              break;

            case 39:
              _context3.prev = 39;
              _context3.t1 = _context3['catch'](34);
              return _context3.abrupt('return', ctx.toError(_context3.t1, { base: base, model: model, params: params, e: _context3.t1 }));

            case 42:
              ctx.body = _data;
              _context3.next = 48;
              break;

            case 45:
              _context3.prev = 45;
              _context3.t2 = _context3['catch'](26);
              return _context3.abrupt('return', ctx.toError('查询出错啦~~', { e: _context3.t2 }));

            case 48:
              _context3.next = 51;
              break;

            case 50:
              return _context3.abrupt('return', next());

            case 51:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this, [[7, 16], [26, 45], [34, 39]]);
    }));

    function findFix(_x5, _x6) {
      return _ref3.apply(this, arguments);
    }

    return findFix;
  }(),

  fetchApiList: function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
      var serverInfo, status, source, _serverInfo$apiList, currentList, commonList, commonProjs;

      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              serverInfo = global.serverInfo;
              status = serverInfo.status;
              source = serverInfo.option.source || {};

              if (!(status.isNewest && serverInfo.apiList.length)) {
                _context4.next = 5;
                break;
              }

              return _context4.abrupt('return');

            case 5:

              this.isFetching = true;
              status.isNewest = true;
              _context4.prev = 7;
              currentList = void 0, commonList = void 0;
              _context4.next = 11;
              return db.dbs.apiBase.cfind({ project: source.projectId }).sort({ name: 1 }).exec();

            case 11:
              _context4.t0 = _context4.sent;

              if (_context4.t0) {
                _context4.next = 14;
                break;
              }

              _context4.t0 = [];

            case 14:
              currentList = _context4.t0;
              commonProjs = serverInfo.option.commonProjs || [];

              if (!commonProjs.length) {
                _context4.next = 20;
                break;
              }

              _context4.next = 19;
              return db.dbs.apiBase.cfind({ project: { $in: commonProjs } }).sort({ name: 1 }).exec();

            case 19:
              commonList = _context4.sent;

            case 20:
              commonList = commonList || [];
              (_serverInfo$apiList = serverInfo.apiList).splice.apply(_serverInfo$apiList, [0, serverInfo.apiList.length].concat((0, _toConsumableArray3.default)(currentList), (0, _toConsumableArray3.default)(commonList)));
              this.isFetching = false;
              _context4.next = 29;
              break;

            case 25:
              _context4.prev = 25;
              _context4.t1 = _context4['catch'](7);

              this.isFetching = false;
              throw _context4.t1;

            case 29:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, this, [[7, 25]]);
    }));

    function fetchApiList() {
      return _ref4.apply(this, arguments);
    }

    return fetchApiList;
  }(),
  fetchModelList: function () {
    var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(base) {
      return _regenerator2.default.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.prev = 0;
              _context5.next = 3;
              return db.dbs.apiModel.cfind({ baseid: base._id }).exec();

            case 3:
              return _context5.abrupt('return', _context5.sent);

            case 6:
              _context5.prev = 6;
              _context5.t0 = _context5['catch'](0);
              throw _context5.t0;

            case 9:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, this, [[0, 6]]);
    }));

    function fetchModelList(_x7) {
      return _ref5.apply(this, arguments);
    }

    return fetchModelList;
  }()
};

var jsonfileOperator = {
  findFix: function () {
    var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(ctx, next) {
      var base, fixedApis, fixData, type, model;
      return _regenerator2.default.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              base = ctx.matchedApi.base;
              fixedApis = global.serverInfo.fixedApis;
              fixData = fixedApis[base._id];

              if (fixData) {
                _context6.next = 5;
                break;
              }

              return _context6.abrupt('return', next());

            case 5:
              type = ~~fixData.type;

              if (!(type === 1)) {
                _context6.next = 10;
                break;
              }

              ctx.body = fixData.data;
              _context6.next = 22;
              break;

            case 10:
              if (!(type === 2)) {
                _context6.next = 14;
                break;
              }

              ctx.throw(fixData.data.code, fixData.data.message);
              _context6.next = 22;
              break;

            case 14:
              if (!(type === 3)) {
                _context6.next = 21;
                break;
              }

              model = base.models.find(function (item) {
                return item._uid === fixData.id;
              });

              if (model) {
                _context6.next = 18;
                break;
              }

              return _context6.abrupt('return', next());

            case 18:
              ctx.body = model.data;
              _context6.next = 22;
              break;

            case 21:
              return _context6.abrupt('return', next());

            case 22:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, this);
    }));

    function findFix(_x8, _x9) {
      return _ref6.apply(this, arguments);
    }

    return findFix;
  }(),
  fetchApiList: function () {
    var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7() {
      var serverInfo, status, source, str;
      return _regenerator2.default.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              serverInfo = global.serverInfo;
              status = serverInfo.status;
              source = serverInfo.option.source || {};

              if (!(status.isNewest || !source.location)) {
                _context7.next = 5;
                break;
              }

              return _context7.abrupt('return');

            case 5:

              this.isFetching = true;
              status.isNewest = true;
              _context7.prev = 7;
              str = fs.readFileSync(source.location, 'utf-8');

              serverInfo.apiList = JSON.parse(str) || [];
              _context7.next = 15;
              break;

            case 12:
              _context7.prev = 12;
              _context7.t0 = _context7['catch'](7);
              throw _context7.t0;

            case 15:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, this, [[7, 12]]);
    }));

    function fetchApiList() {
      return _ref7.apply(this, arguments);
    }

    return fetchApiList;
  }(),
  fetchModelList: function () {
    var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(base) {
      return _regenerator2.default.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.prev = 0;
              return _context8.abrupt('return', base.models || []);

            case 4:
              _context8.prev = 4;
              _context8.t0 = _context8['catch'](0);
              throw _context8.t0;

            case 7:
            case 'end':
              return _context8.stop();
          }
        }
      }, _callee8, this, [[0, 4]]);
    }));

    function fetchModelList(_x10) {
      return _ref8.apply(this, arguments);
    }

    return fetchModelList;
  }()
};

var jsonOperator = {
  fetchApiList: function () {
    var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9() {
      var serverInfo, status, source;
      return _regenerator2.default.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              serverInfo = global.serverInfo;
              status = serverInfo.status;
              source = serverInfo.option.source || {};

              if (!status.isNewest) {
                _context9.next = 5;
                break;
              }

              return _context9.abrupt('return');

            case 5:

              this.isFetching = true;
              status.isNewest = true;
              serverInfo.apiList = source.jsonData || [];

            case 8:
            case 'end':
              return _context9.stop();
          }
        }
      }, _callee9, this);
    }));

    function fetchApiList() {
      return _ref9.apply(this, arguments);
    }

    return fetchApiList;
  }()
};

function getFinalData(_ref10) {
  var _ref10$sourceModel = _ref10.sourceModel,
      sourceModel = _ref10$sourceModel === undefined ? {} : _ref10$sourceModel,
      base = _ref10.base,
      oriParams = _ref10.oriParams,
      parsedParams = _ref10.parsedParams,
      ctx = _ref10.ctx;

  var params = parsedParams;
  if (!params) {
    params = _.cloneDeep(oriParams);
    var schema = sourceModel.inputParam || base.inputParam;
    if (schema && Object.keys(schema).length) {
      createSchema(schema).format(params);
    }
  }

  var mockData = sourceModel.data || base.data;
  if (typeof mockData === 'string') {
    try {
      mockData = JSON.parse(mockData);
    } catch (e) {
      console.log('数据转换为JSON出错', mockData);
    }
  }

  var data = (typeof mockData === 'undefined' ? 'undefined' : (0, _typeof3.default)(mockData)) === 'object' && mockData != null ? _.cloneDeep(mockData) : mockData;

  var afterFunc = (sourceModel.afterFunc || base.afterFunc || '').trim();
  if (afterFunc) {
    var dealedResult = execFunc(ctx, afterFunc, { params: params, data: data });
    if ((typeof dealedResult === 'undefined' ? 'undefined' : (0, _typeof3.default)(dealedResult)) === 'object') data = dealedResult;
  }

  return { data: data, params: params };
}

function delay(time) {
  time = Number(time) || 0;
  if (!time) return Promise.resolve();
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

function bindAllKeys(obj) {
  Object.keys(obj).forEach(function (key) {
    if (typeof obj[key] === 'function') obj[key] = obj[key].bind(obj);
  });
  return obj;
}

function convertStrToJSON(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}

var operators = {
  database: bindAllKeys(Object.assign({}, common, databaseOperator)),
  jsonfile: bindAllKeys(Object.assign({}, common, jsonfileOperator)),
  json: bindAllKeys(Object.assign({}, common, jsonfileOperator, jsonOperator))
};

module.exports = operators;