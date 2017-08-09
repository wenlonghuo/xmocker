'use strict'
const fs = require('fs')
const url = require('url')
const path = require('path')

var _ = require('lodash')
const template = _.template
const serverInfo = global.serverInfo

const LINK = {
  localAddr: 'http://' + serverInfo.local.ip + ':' + serverInfo.option.port,
  list: [],
  urls: [],
  configList: [],
  configNoList: [],
  unconfigList: [],
}

function combineUrl (arr, commonParams) {
  if (!Array.isArray(arr)) arr = []
  let urlArr = []
  arr.forEach((item) => {
    if (item.list) {
      urlArr.push(...combineUrl(item.list, commonParams))
      return
    }
    if (item.path) {
      item._path = item.path.replace(/index.html$/, '').replace(/\/|\\/g, '')
      let urlObj = url.parse(item.path)
      let params = Object.assign({}, item.params, commonParams)
      let arr = []
      Object.keys(params).forEach((key) => {
        arr.push(key + '=' + params[key])
      })
      urlObj.search += '&' + arr.join('&')
      item._url = url.format(urlObj)
    } else {
      item._url = item.url
    }
    urlArr.push(item)
  })
  return urlArr
}

function setLinkData () {
  LINK.configList = []
  LINK.configNoList = []
  LINK.unconfigList = []
  const option = serverInfo.option

  let linkViews = combineUrl(option.linkViews, option.linkParams)
  let storeList = combineUrl(LINK.list, option.linkParams)
  LINK.urls = linkViews
  LINK.list = storeList

  linkViews.forEach((item) => {
    var exist = storeList.find((link) => { return item._path === link._path })
    if (exist) {
      LINK.configList.push(item)
    } else {
      LINK.configNoList.push(item)
    }
  })

  storeList.forEach((link) => {
    if (!linkViews.find((item) => { return item._path === link._path })) {
      LINK.unconfigList.push(link)
    }
  })
}

// 刷新页面接口
const wsctrl = require('./controller.ws')
async function refresh (ctx, next) {
  if (wsctrl.wss) {
    let pages = ctx.query.pages
    wsctrl.broadcast({action: 'reload', pages: pages})
  }
  ctx.body = 'ok'
}

async function storePageList (ctx, next) {
  let param = ctx.request.body

  if (!param) return
  let pages = param.html || []
  LINK.list = pages.map((url) => {
    return {
      _path: url.replace(/index.html$/, '').replace(/\/|\\/g, ''),
      path: url.replace(/index.html$/, '').replace(/\/|\\/g, ''),
      url: url,
    }
  })
  setLinkData()
  ctx.body = 'ok'
}

async function serveView (ctx, next) {
  var query = ctx.query
  var htmlStr = fs.readFileSync(path.join(__dirname, '../tmpl/link.tmpl'), {encoding: 'utf-8'})
  let info = Object.assign({}, LINK, query)
  let complied = template(htmlStr)
  ctx.body = complied(info)
}

module.exports = {
  setLinkData,
  serveView,
  storePageList,
  refresh,
}
