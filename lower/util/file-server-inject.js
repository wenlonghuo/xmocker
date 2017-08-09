
'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var path = require('path');
var extname = path.extname;
var fs = require('mz/fs');
var template = require('lodash').template;
var clientInject = fs.readFileSync(path.join(__dirname, '../tmpl/clientInject.tmpl'), { encoding: 'utf-8' });

var sys = require('./getLocalInfo');

module.exports = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(_ref2, opts) {
    var ctx = _ref2.ctx,
        path = _ref2.path,
        stats = _ref2.stats;
    var serverOption, html, tmpl, complied, inj;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            serverOption = global.serverInfo.option;

            if (extname(path) === '.html' && serverOption.inject) {
              html = fs.readFileSync(path, { encoding: 'utf-8' });
              tmpl = clientInject;

              if (typeof serverOption.inject !== 'boolean') {
                tmpl = fs.readFileSync(serverOption.inject, { encoding: 'utf-8' });
              }
              complied = template(tmpl);
              inj = complied({ port: serverOption.port, mainPort: serverOption.mainPort, ip: sys.ip });

              html = html.replace('</head>', inj + '</head>');
              ctx.body = html;
            } else {
              ctx.body = fs.createReadStream(path);
            }
            return _context.abrupt('return', true);

          case 3:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();