'use strict'
const Koa = require('koa')
const app = new Koa()
const minimist = require('minimist')
const bodyParser = require('koa-bodyparser')

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

app.use(bodyParser({
  formLimit: '10mb',
  jsonLimit: '10mb'
}))

// const actions = require('./controller/controller.comm')
const start = require('./controller/controller.start')

if (option.source) {
  let starter = option.source.type === 'database' ? start.startServerByDataBase(app, option) : start.startServerByOption(app, option)
  starter.then(data => {
    let serverOption = JSON.stringify(global.serverInfo.option)
    process.stdout.write(`finish::${serverOption}`)
  })
}

process.on('unhandledRejection', function (e) {
  throw e
})
