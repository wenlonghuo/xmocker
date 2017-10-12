'use strict'
const dbData = require('./source/json/onApi.json')
const project = require('./source//json/project.json')
const path = require('path')
const fs = require('fs')

function resolve (name) {
  return path.join(__dirname, './source/db/v1', name)
}

function genDb () {
  // write project file
  project.staticPath.push(path.join(__dirname, 'source/page'))

  fs.writeFileSync(resolve('project'), JSON.stringify(project))
  let projectId = project._id
  let baseData = dbData.map(api => {
    return JSON.stringify(Object.assign({}, api, {
      models: undefined,
      project: projectId,
    }))
  })

  fs.writeFileSync(resolve('apiBase'), baseData.join('\n'))

  let modelData = []
  dbData.forEach(api => {
    let models = api.models
    models.forEach(model => {
      modelData.push(JSON.stringify(model))
    })
  })
  fs.writeFileSync(resolve('apiModel'), modelData.join('\n'))

  return project
}

module.exports = genDb
