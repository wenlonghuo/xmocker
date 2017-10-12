'use strict'
const WebSocket = require('ws')
let commAction = require('./controller.comm')

const wsState = {
  clients: {
    owners: [],
    webClient: [],
  },
}

function init (httpServer) {
  wsState.wss = new WebSocket.Server({ server: httpServer })
  wsState.wss.on('connection', wsConnect)
}

function broadcast (data) {
  sendDataToClient(wsState.clients.webClient, data)
}

function broadToOwner (data) {
  sendDataToClient(wsState.clients.owners, data)
}

/**
 * 客户端连接
 * @param {*} wsClient
 */
function wsConnect (wsClient) {
  let type = (wsClient.upgradeReq.url || '/').slice(1)
  if (wsState.clients[type]) {
    wsClient.clientReqType = type
    wsState.clients[type].push(wsClient)
  }
  wsClient.on('message', incoming)
  wsClient.on('long', function () {
    this.isAlive = true
  })
}

/**
 * 消息传入
 * @param {*} msg
 */
function incoming (msg) {
  try {
    msg = JSON.parse(msg)
    // deal income action
    const action = msg.action || ''
    if (commAction[action]) {
      commAction[action](msg)
    } else {
      commAction.error(msg._uid, 'not found function')
    }
  } catch (e) {
    return
  }
}

/**
 * 发送数据至客户端列表
 * @param {*} arr
 * @param {*} data
 */
function sendDataToClient (arr, data) {
  if (typeof data !== 'string') data = JSON.stringify(data)
  arr.forEach(function (ws) {
    if (ws.readyState === 1) {
      try {
        ws.send(data)
      } catch (e) {

      }
    }
  })
}

/**
 * 检测客户端状态
 */
setInterval(function ping () {
  wsState.wss.clients.forEach(function (ws) {
    if (ws.isAlive === false) {
      let arr = wsState.clients[ws.clientReqType]
      if (arr) {
        let index = arr.findIndex(item => item === ws)
        if (~index) {
          arr.splice(index, 1)
        }
      }
      return ws.terminate()
    }
    ws.isAlive = false
    ws.ping('', false, true)
  })
}, 30000)

module.exports = {
  init,
  broadcast,
  broadToOwner,
}

commAction.init()
