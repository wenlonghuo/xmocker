'use strict'
const Koa = require('koa')
const app = new Koa()
const minimist = require('minimist')
const bodyParser = require('koa-bodyparser')()

console.log = function log (...args) {
  args = args.map(item => {
    if (item instanceof Error) {
      item = { err: item.message, stack: item.stack }
    }
    return item
  })

  let msg = {
    type: 'console',
    time: +new Date(),
    data: args,
  }
  process.send(msg)
}
// 全局变量定义区，待后续可改为配置
var args = minimist(process.argv.slice(2))
const option = args.option ? JSON.parse(decodeURIComponent(args.option)) : {}

global.serverInfo = {
  option,
  apiList: [],
  status: {},
  fixedApis: {},
  local: require('./util/getLocalInfo'),
}

app.use(bodyParser)

const actions = require('./controller/controller.comm')
const start = require('./controller/controller.start')

if (option.source) {
  let starter = option.source.type === 'database' ? start.startServerByDataBase(app, option) : start.startServerByOption(app, option)
  starter.then(data => {
    process.send({ type: 'finish', data: global.serverInfo.option })
  })
}

process.on('message', function (msg) {
  if (typeof msg !== 'object') return
  if (msg.action) {
    if (actions[msg.action]) {
      actions[msg.action](msg)
    } else {
      actions.error(msg._uid, 'not found function')
    }
  }
})
process.on('unhandledRejection', function (e) {
  throw e
})
