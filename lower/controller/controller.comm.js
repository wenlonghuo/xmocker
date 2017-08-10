'use strict';

var serverInfo = global.serverInfo;
var wsctrl = require('./controller.ws');
var inject = require('./controller.inject');
var db = require('../database');

var actions = {
  response: function response(uid, data) {
    process.send({ _uid: uid, status: 0, data: data });
  },
  error: function error(uid, data, status) {
    process.send({ _uid: uid, status: status || 1, data: data });
  },
  reconfig: function reconfig(msg) {
    Object.assign(serverInfo.option, msg.data);
    inject.setLinkData();
    this.response(msg._uid, serverInfo.option);
  },
  refresh: function refresh(msg) {
    wsctrl.broadcast({ action: 'reload', pages: msg.data.pages });
    this.response(msg._uid, serverInfo.option);
  },
  setLinkViews: function setLinkViews(msg) {
    if (Array.isArray(msg.data)) {
      serverInfo.option.linkViews = msg.data;
      inject.setLinkData();
      this.response(msg._uid, serverInfo.option);
    } else {
      this.error(msg._uid, 'linkViews must be an array');
    }
  },
  setApiReturn: function setApiReturn(msg) {
    if (msg.data && msg.data.api) {
      serverInfo.fixedApis[msg.data.api] = msg.data.type ? msg.data : undefined;
      this.response(msg._uid, serverInfo.fixedApis);
    } else {
      this.error(msg._uid, 'set Api is not legal');
    }
  },
  getApiReturns: function getApiReturns(msg) {
    this.response(msg._uid, serverInfo.fixedApis);
  },
  setProxyMode: function setProxyMode(msg) {
    var code = parseInt(msg.data);
    if (code >= 0 && code < 3) {
      serverInfo.option.proxyMode = code;
      this.response(msg._uid, serverInfo.option);
    } else {
      this.error(msg._uid, 'ProxyMode is not exist');
    }
  },
  reloadApis: function reloadApis(msg) {
    var data = msg.data || [];
    serverInfo.apiList = [];
    if (!data.length) {
      Object.keys(db.dbs).forEach(function (key) {
        if (db.dbs[key]) db.dbs[key].loadDatabase();
      });
    } else {
      data.forEach(function (name) {
        if (db.dbs[name]) db.dbs[name].loadDatabase();
      });
    }
    serverInfo.status.isNewest = true;
    this.response(msg._uid, serverInfo.fixedApis);
  },
  exit: function exit(msg) {
    process.exit(0);
  }
};

module.exports = actions;