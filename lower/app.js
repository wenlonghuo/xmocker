'use strict';

var Koa = require('koa');
var app = new Koa();
var minimist = require('minimist');
var bodyParser = require('koa-bodyparser')();

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

var start = require('./controller/controller.start');

if (option.source) {
  var starter = option.source.type === 'database' ? start.startServerByDataBase(app, option) : start.startServerByOption(app, option);
  starter.then(function (data) {
    var serverOption = JSON.stringify(global.serverInfo.option);
    process.stdout.write('finish::' + serverOption);
  });
}

process.on('unhandledRejection', function (e) {
  throw e;
});