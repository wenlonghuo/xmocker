'use strict'
const Datastore = require('nedb-promise')
const join = require('path').join
const userDirectory = join(process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'], '.mocker/v1/db')

function createDatabase (dir, name) {
  return new Datastore({ filename: join(dir, name), autoload: true })
}

module.exports = {
  init: function init (option) {
    let dir = (option.source || {}).location || userDirectory
    let createDb = createDatabase.bind(null, dir)

    // api 基础数据
    const apiBase = createDb('/apiBase')

    // mock用于显示数据
    const apiModel = createDb('/apiModel')

    // 基础配置
    const appBase = createDb('/appBase')

    // 项目信息
    const project = createDb('/project')

    const Lib = createDb('/lib')

    this.dbs = {
      apiBase,
      apiModel,
      appBase,
      project,
      Lib,
    }
    return this
  },
}
