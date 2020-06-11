'use strict'

module.exports = async function execFunction (ctx, condition = '', params = {}) {
  if (condition.indexOf('return') < 0) condition = 'return ' + condition
  let keys = Object.keys(params)
  let values = keys.map(key => params[key])
  let func

  keys.push(condition)
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
  try {
    func = new AsyncFunction(...keys)
  } catch (e) {
    throw new Error(`分支判断函数不合法${e.message}`)
  }
  ctx.require = require
  // 调用函数
  try {
    return await func.apply(ctx, values)
  } catch (e) {
    throw new Error(`api分支执行判断条件的函数时出现错误：${e.message}`)
  }
}
