'use strict'

const fs = require('fs')
const parseURL = require('../util/url-params')
const jsonGate = require('../plugin/json-gate/json-gate')
const createSchema = jsonGate.createSchema
const execFunc = require('../util/exec-func')
const db = require('../database/')

const common = {
  findApi: async function findApi (ctx, next) {
    const serverInfo = global.serverInfo
    // if only server, continue
    if (~~serverInfo.option.proxyMode === 1) return

    try {
      await this.fetchApiList()
    } catch (e) {
      return ctx.toError('获取API列表失败', {e})
    }

    let api, base
    let apiList = serverInfo.apiList
    // 查询api
    let params = Object.assign({}, ctx.query || {}, ctx.request.body)

    // find api from apiList
    for (let i = 0; i < apiList.length; i++) {
      api = apiList[i]
      // 判断  method 是否相等
      if (api.method.toUpperCase() !== ctx.method) continue
      // 判断 url 是否相等,并取出参数
      let urlParam = parseURL(api.url, ctx.path)
      if (!urlParam) continue
      // 判断二级路径是否相等
      if (api.path) {
        if (params[api.path] !== api.pathEqual) continue
      }
      base = api
      Object.assign(params, urlParam)
      break
    }

    if (!base) return

    ctx.matchedApi = { base, params }

    return next()
  },
  findModel: async function findModel (ctx, next) {
    if (!ctx.matchedApi) return next()

    let { base, params } = ctx.matchedApi

    let models
    try {
      models = await this.fetchModelList(base)
    } catch (e) {
      return ctx.toError('查询分支失败', { e })
    }

    let model, targetModel

    // 获取不同条件的api
    for (let i = 0; i < models.length; i++) {
      model = models[i]
      let condition = model.condition || ''
      condition = condition.trim()
      // 条件为空时设置为默认值
      if (condition === '') {
        targetModel = model
        continue
      }
      // 格式化输入参数
      try {
        let inputParam = model.inputParam || base.inputParam
        if (inputParam && Object.keys(inputParam).length) {
          createSchema(inputParam).format(params)
        }
        if (execFunc(ctx, condition, params)) {
          targetModel = model
          break
        }
      } catch (e) {
        return ctx.toError(e, { base, model, params, e })
      }
    }

    if (!targetModel && base.data == null) return ctx.toError('该API暂无数据', { base, params })
    let sourceModel = targetModel || base

    let data = sourceModel.data || base.data
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data)
      } catch (e) {
        console.log('数据转换为JSON出错', data)
      }
    }

    let afterFunc = (sourceModel.afterFunc || base.afterFunc || '').trim()
    if (afterFunc) {
      try {
        let dealedResult = execFunc(ctx, afterFunc, { params, data })
        if (typeof dealedResult === 'object') data = dealedResult
      } catch (e) {
        return ctx.toError(e, { base, model: targetModel, params, e })
      }
    }
    ctx.log('获取api数据成功：' + base.name, { base, model: targetModel, params, res: data })

    await delay(base.delay)
    ctx.body = data
    return next()
  },
}

/**
 * database type handler
 */
const databaseOperator = {
  findFix: async function findFix (ctx, next) {
    let { base } = ctx.matchedApi
    let fixedApis = global.serverInfo.fixedApis

    let fixData = fixedApis[base._id]
    if (!fixData) return next()
    let type = ~~fixData.type
    if (type === 1) {
      // lib id
      try {
        let data = await db.dbs.Lib.cfindOne({ _id: fixData.id }).exec()
        if (!data) return next()
        ctx.body = data.model
      } catch (e) {
        return ctx.toError('指定的模板值不存在！', {e})
      }
    } else if (type === 2) {
      // ctx throw, 401， 502 etc.
      ctx.throw(fixData.data.code, fixData.data.message)
    } else if (type === 3) {
      // models
      try {
        let model = await db.dbs.apiModel.cfindOne({ _id: fixData.id }).exec()
        if (!model) return ctx.toError('指定的分支不存在！')
        ctx.body = model.data
      } catch (e) {
        return ctx.toError('指定的分支不存在！', {e})
      }
    } else {
      return next()
    }
  },

  fetchApiList: async function fetchApiList () {
    const serverInfo = global.serverInfo
    const status = serverInfo.status
    const source = serverInfo.option.source || {}
    if (status.isNewest && serverInfo.apiList.length) return

    this.isFetching = true
    status.isNewest = true
    try {
      let currentList, commonList
      currentList = await db.dbs.apiBase.cfind({ project: source.projectId }).sort({ name: 1 }).exec() || []
      if (source.commonProjs && source.commonProjs.length) {
        commonList = await db.dbs.apiBase.cfind({ project: { $in: source.commonProjs } }).sort({ name: 1 }).exec()
      }
      commonList = commonList || []
      serverInfo.apiList.splice(0, serverInfo.apiList.length, ...currentList, ...commonList)
      this.isFetching = false
    } catch (e) {
      this.isFetching = false
      throw e
    }
  },
  fetchModelList: async function fetchModelList (base) {
    try {
      return await db.dbs.apiModel.cfind({ baseid: base._id }).exec()
    } catch (e) {
      throw e
    }
  },
}
/**
 * jsonfile type dealer
 * format: [
 *   {
 *     url: '/api',
 *     name: '',
 *     method: 'GET',
 *     path: 'func',
 *     pathEqual: '',
 *     delay: 0,
 *     description: '',
 *     _uid: '',
 *     models: [
 *       _uid: '',
 *       name: '',
 *       condition: '',
 *       afterFunc: '',
 *       inputParam: {},
 *       outputParam: {},
 *       data: {}
 *     ]
 *   }
 * ]
 */
const jsonfileOperator = {
  findFix: async function findFix (ctx, next) {
    let { base } = ctx.matchedApi
    let fixedApis = global.serverInfo.fixedApis

    let fixData = fixedApis[base._id]
    if (!fixData) return next()
    let type = ~~fixData.type
    if (type === 1) {
      // lib id
      ctx.body = fixData.data
    } else if (type === 2) {
      // ctx throw, 401， 502 etc.
      ctx.throw(fixData.data.code, fixData.data.message)
    } else if (type === 3) {
      // models
      let model = base.models.find(item => item._uid === fixData.id)
      if (!model) return next()
      ctx.body = model.data
    } else {
      return next()
    }
  },
  fetchApiList: async function fetchApiList () {
    const serverInfo = global.serverInfo
    const status = serverInfo.status
    const source = serverInfo.option.source || {}
    if (status.isNewest || !source.location) return

    this.isFetching = true
    status.isNewest = true
    try {
      let str = fs.readFileSync(source.location, 'utf-8')
      serverInfo.apiList = JSON.parse(str) || []
    } catch (e) {
      throw e
    }
  },
  fetchModelList: async function fetchModelList (base) {
    try {
      return base.models || []
    } catch (e) {
      throw e
    }
  },
}

/**
 * json type dealer
 * same with jsonfile
 */
const jsonOperator = {
  fetchApiList: async function fetchApiList () {
    const serverInfo = global.serverInfo
    const status = serverInfo.status
    const source = serverInfo.option.source || {}
    if (status.isNewest) return

    this.isFetching = true
    status.isNewest = true
    serverInfo.apiList = source.jsonData || []
  },
}

function delay (time) {
  return new Promise(resolve => {
    setTimeout(resolve, Number(time) || 0)
  })
}

function bindAllKeys (obj) {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'function') obj[key] = obj[key].bind(obj)
  })
  return obj
}

const operators = {
  database: bindAllKeys(Object.assign({}, common, databaseOperator)),
  jsonfile: bindAllKeys(Object.assign({}, common, jsonfileOperator)),
  json: bindAllKeys(Object.assign({}, common, jsonfileOperator, jsonOperator)),
}

module.exports = operators
