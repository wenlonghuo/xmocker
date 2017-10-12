'use strict'

const serverInfo = global.serverInfo
let wsctrl
const inject = require('./controller.inject')
const db = require('../database')

let actions = {
  init () {
    wsctrl = require('./controller.ws')
  },
  response: function (uid, data) {
    wsctrl.broadToOwner({_uid: uid, status: 0, data: data})
  },
  error: function (uid, data, status) {
    wsctrl.broadToOwner({_uid: uid, status: status || 1, data: data})
  },
  reconfig: function (msg) {
    Object.assign(serverInfo.option, msg.data)
    inject.setLinkData()
    this.response(msg._uid, serverInfo.option)
  },
  refresh: function (msg) {
    wsctrl.broadcast({ action: 'reload', pages: msg.data.pages })
    this.response(msg._uid, serverInfo.option)
  },
  setLinkViews: function (msg) {
    if (Array.isArray(msg.data)) {
      serverInfo.option.linkViews = msg.data
      inject.setLinkData()
      this.response(msg._uid, serverInfo.option)
    } else {
      this.error(msg._uid, 'linkViews must be an array')
    }
  },
  setApiReturn: function (msg) {
    if (msg.data && msg.data.api) {
      serverInfo.fixedApis[msg.data.api] = msg.data.type ? msg.data : undefined
      this.response(msg._uid, serverInfo.fixedApis)
    } else {
      this.error(msg._uid, 'set Api is not legal')
    }
  },
  getApiReturns: function (msg) {
    this.response(msg._uid, serverInfo.fixedApis)
  },
  setProxyMode: function (msg) {
    let code = parseInt(msg.data)
    if (code >= 0 && code < 3) {
      serverInfo.option.proxyMode = code
      this.response(msg._uid, serverInfo.option)
    } else {
      this.error(msg._uid, 'ProxyMode is not exist')
    }
  },
  reloadApis: function (msg) {
    let data = msg.data || []
    serverInfo.apiList = []
    if (!data.length) {
      Object.keys(db.dbs).forEach((key) => {
        if (db.dbs[key]) db.dbs[key].loadDatabase()
      })
    } else {
      data.forEach(function (name) {
        if (db.dbs[name]) db.dbs[name].loadDatabase()
      })
    }
    serverInfo.status.isNewest = true
    this.response(msg._uid, serverInfo.fixedApis)
  },
  exit: function (msg) {
    process.exit(0)
  },
}

module.exports = actions
