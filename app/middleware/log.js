'use strict'
/**
 * 日志记录。包含内容
 * _type: 'out'
 * level: 10 日志等级
 * time: 时间戳
 * data: 内容
 * project: project名称
 * api： api名称
 * apiModel： 分支名称
 * projectId: 项目id
 * apiId: 接口Id
 * apiModelId: 分支id
 * req: 请求入参
 * reqParse: 转换后入参
 * res: 输出参数
 * args: process的启动参数
 * err: 错误详细信息
 * additional: 其他参数
 */
let errorExp = /\$\{msg\}/gi
let uaParser = require('ua-parser-js')
const serverInfo = global.serverInfo

function formatParam (ctx, message, option = {}) {
  const source = serverInfo.option.source
  let base = option.base || {}
  let model = option.model || {}
  let e = option.e
  let ua = uaParser(ctx.headers['user-agent'])
  ua.ip = ctx.ip

  let msg = {
    action: 'log',
    time: timer(),
    args: {
      port: serverInfo.option.port,
      fsPath: source.root,
    },
    projectId: source._id,
    project: option.projectName,
    message: message,
    apiId: base._id,
    api: base.name,
    apiModelId: model._id,
    apiModel: model.name,
    req: {
      params: option.params,
      url: ctx.url,
      method: ctx.method,
    },
    reqParsed: option.dealedParams,
    res: option.res || ctx.body,
    ip: ctx.ip,
    client: ua,
    additional: option.additional,
  }
  if (e) {
    msg.err = {
      msg: e.message,
      stack: e.stack,
    }
  }
  return msg
}

function logError (ctx, msg, option = {}) {
  let data = formatParam(ctx, msg, option)
  data.type = 'error'
  process.send(data)
}

function toError (ctx, msg, option = {}) {
  let errorModel = JSON.stringify(serverInfo.option.errorTmpl) || '{"code": -1, "codeDesc":"${msg}", "codeDescUser":"${msg}"}'
  ctx.logE(msg, option)
  ctx.body = formatError(errorModel, msg)
}

function logHis (ctx, msg, option = {}) {
  let data = formatParam(ctx, msg, option)
  data.type = 'his'
  process.send(data)
}

function logProxy (ctx, msg, option = {}) {
  let data = formatParam(ctx, msg, option)
  data.type = 'proxy'
  process.send(data)
}

module.exports = function () {
  return async function logBind (ctx, next) {
    ctx.logE = logError.bind(null, ctx)
    ctx.toError = toError.bind(null, ctx)
    ctx.log = logHis.bind(null, ctx)

    return next()
  }
}

module.exports.logError = logError
module.exports.toError = toError
module.exports.logHis = logHis
module.exports.logProxy = logProxy

function formatError (model, msg) {
  let str = model.replace(errorExp, msg)
  let obj
  try {
    obj = JSON.parse(str)
  } catch (e) {
    console.log('项目中错误串无法转换为obj。')
  }
  return obj
}

function timer (date) {
  if (typeof date !== 'object') date = date == null ? new Date() : new Date(date)
  if (isNaN(date.getTime())) date = new Date()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  let str = date.toISOString()
  return str.slice(0, 10) + ' ' + str.slice(11, 23)
}
