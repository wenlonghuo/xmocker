'use strict';

var WebSocket = require('ws');
var commAction = void 0;

var wsState = {
  clients: {
    owners: [],
    webClient: []
  }
};

function init(httpServer) {
  wsState.wss = new WebSocket.Server({ server: httpServer });
  wsState.wss.on('connection', wsConnect);
}

function broadcast(data) {
  sendDataToClient(wsState.clients.webClient, data);
}

function broadToOwner(data) {
  sendDataToClient(wsState.clients.owners, data);
}

function wsConnect(wsClient) {
  var type = (wsClient.upgradeReq.url || '/').slice(1);
  if (wsState.clients[type]) {
    wsClient.clientReqType = type;
    wsState.clients[type].push(wsClient);
  }
  wsClient.on('message', incoming);
  wsClient.on('long', function () {
    this.isAlive = true;
  });
}

function incoming(msg) {
  if (!commAction) {
    commAction = require('./controller.comm');
    commAction.init();
  }
  try {
    msg = JSON.parse(msg);

    var action = msg.action || '';
    if (commAction[action]) {
      commAction[action](msg);
    } else {
      commAction.error(msg._uid, 'not found function');
    }
  } catch (e) {
    return;
  }
}

function sendDataToClient(arr, data) {
  if (typeof data !== 'string') data = JSON.stringify(data);
  arr.forEach(function (ws) {
    if (ws.readyState === 1) {
      try {
        ws.send(data);
      } catch (e) {}
    }
  });
}

module.exports = {
  init: init,
  broadcast: broadcast,
  broadToOwner: broadToOwner
};