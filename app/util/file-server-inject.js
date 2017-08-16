/**
** 注入插件
 */
'use strict'
const path = require('path')
const extname = path.extname
const fs = require('mz/fs')
const template = require('lodash').template
const clientInject = fs.readFileSync(path.join(__dirname, '../tmpl/clientInject.tmpl'), {encoding: 'utf-8'})
/**
 * Expose `send()`.
 */
let sys = require('./getLocalInfo')

module.exports = async function ({ctx, path, stats}, opts) {
  let serverOption = global.serverInfo.option
  if (extname(path) === '.html' && serverOption.inject) {
    let html = fs.readFileSync(path, {encoding: 'utf-8'})
    let tmpl = clientInject
    if (typeof serverOption.inject !== 'boolean') {
      tmpl = fs.readFileSync(serverOption.inject, { encoding: 'utf-8' })
    }
    let complied = template(tmpl)
    let inj = complied({ port: serverOption.port, mainPort: serverOption.mainPort || 6001, ip: sys.ip })
    html = html.replace('</head>', inj + '</head>')
    ctx.body = html
  } else {
    ctx.body = fs.createReadStream(path)
  }
  return true
}
