'use strict'
function incoming (msg) {
  try {
    msg = JSON.parse(msg)
  } catch (e) {
    return
  }
}

const ws = {
  init: function (hd) {
    hd.on('connection', this.wsConnect)
    this.wss = hd
    this.broadcast = this.broadcast.bind(this)
    this.wsConnect = this.wsConnect.bind(this)
  },
  broadcast: function broadcast (data) {
    if (!this.wss) {
      return
    }
    if (typeof data !== 'string') data = JSON.stringify(data)
    this.wss.clients.forEach(function (client) {
      if (client.readyState === 1) {
        client.send(data)
      }
    })
  },
  // websocket 初始连接函数
  wsConnect: function wsConnect (wsClient) {
    wsClient.on('message', incoming)
  },
}

module.exports = ws
