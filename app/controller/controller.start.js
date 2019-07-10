'use strict'
const assert = require('assert')
const path = require('path')
const http = require('http')
const sendFile = require('../plugin/file-server')
const htmlInject = require('../util/file-server-inject')
const log = require('../middleware/log')
const wsctrl = require('./controller.ws.js')
const cors = require('@koa/cors')

module.exports = {
  startServerByDataBase,
  startServerByOption,
}
async function findAppBase (db) {
  try {
    return await db.appBase.cfindOne({}).exec()
  } catch (e) {
    console.log(e)
    return
  }
}

async function findProjectById (db, projectId) {
  try {
    return await db.project.cfindOne({ _id: projectId }).exec()
  } catch (e) {
    console.log(e)
    return
  }
}

async function startServerByDataBase (app, option) {
  assert(option.source.projectId, 'projectId must be provided')

  const db = require('../database').init(option).dbs
  let appConfig = await findAppBase(db) || {}
  let proj = await findProjectById(db, option.source.projectId)
  assert(proj, 'project is not found: ' + option.source.projectId)

  if (option.source && option.source.common && option.source.common.length > 3) {
    process.emitWarning('common db too much will cause slow reaction and higher memory used')
  }

  const gInfo = global.serverInfo
  let finalOption = getOptionFromProj(proj)
  finalOption.mainPort = appConfig.mainPort || 6001
  Object.assign(gInfo.option, finalOption, option)
  gInfo.option.commonProjs = gInfo.option.commonProjs || []
  if (proj.parentId) gInfo.option.commonProjs.unshift(proj.parentId)

  gInfo.option.source.projectName = proj.name
  let server = await startupServer(app, option)
  return server
}

async function startServerByOption (app, option = {}) {
  let defaultOption = {
    port: 6000,
    inject: false,
    linkViews: true,
    linkParams: {},
  }
  option = Object.assign({}, defaultOption, option)
  if (option.root) {
    option.staticPaths = option.staticPaths || []
    option.staticPaths.unshift(option.root)
  }

  option.inject = evalStringBool(option.inject)
  option.history = evalStringBool(option.history)
  Object.assign(global.serverInfo.option, option)
  let server = await startupServer(app, option)
  return server
}

async function startupServer (app, option = {}) {
  return new Promise((resolve, reject) => {
    app.use(log())

    app.use(cors({
      allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
      credentials: true,
    }))

    // proxy
    app.use(require('../middleware/proxyTo').proxyToGlobal({
      status: 404,
      error: log.toError,
      deal: log.logProxy,
    }))

    // proxy
    app.use(require('../middleware/proxyTo').setProxyGlobal({
      status: 404,
      error: log.toError,
      deal: log.logProxy,
    }))

    // history 模式
    if (option.history) {
      const redirectPath = typeof option.history === 'boolean' ? '/' : option.history
      app.use(async function (ctx, next) {
        return next().then(async function () {
          let accept = ctx.headers['accept']
          if (ctx.status !== 404 || !~accept.indexOf('text/html')) return
          const sendAsync = sendFile(ctx, redirectPath, {
            root: option.root,
            index: 'index.html',
            serverOption: option,
            plugin: htmlInject,
          })

          await sendAsync()
        })
      })
    }

    // static server
    if (option.staticPaths) {
      option.staticPaths.forEach((dir) => {
        let absDir = dir.trim()
        if (option.root && !path.isAbsolute(absDir)) {
          absDir = path.join(option.root, absDir)
        }

        app.use(async function (ctx, next) {
          return next().then(sendFile(ctx, ctx.path, {
            root: absDir,
            index: 'index.html',
            serverOption: option,
            plugin: htmlInject,
          }))
        })
      })
    }

    app.use(require('../router.js')(option).routes())

    // 建立是的监听及server
    const httpServer = http.createServer(app.callback())

    // 建立 websocket 服务
    wsctrl.init(httpServer)

    httpServer.listen(option.port, function (e) {
      resolve()
    })
    global.serverInfo.server = httpServer
    // setting dafault link
    require('./controller.inject').setLinkData()
    return httpServer
  })
}

function getOptionFromProj (proj, source = {}) {
  let op = {
    port: proj.port,
    root: (proj.path || '').trim(),
    proxy404: proj.proxyTo,
    proxyMode: proj.proxyType || 0,
    linkViews: proj.urls,
    inject: proj.injectHtml,
    staticPaths: proj.staticPath || [],
    proxyTable: proj.proxyTable || [],
  }

  // add default static path
  if (op.root) {
    let gulp = proj.gulp || {}
    let gulpPath = (gulp.buildPath || '').trim()
    if (gulpPath) {
      op.staticPaths.unshift(path.join(op.root, gulpPath))
    } else {
      op.staticPaths.unshift(op.root)
    }
  }

  return op
}

function evalStringBool (str) {
  if (str === 'true' || str === 'false') {
    return JSON.parse(str)
  }
  return str
}
