/* global describe, it, before, after */
'use strict'
const assert = require('assert')
const path = require('path')
const Mocker = require('../')
const WebSocket = require('ws')
const axios = require('axios')
const sourceDir = path.join(__dirname, 'source')
const pageDir = path.join(sourceDir, 'page')
const genDb = require('./genDb')

describe('server by json type', function () {
  const dir = path.join(__dirname, './source/json/onApi.json')
  let serverjson
  before('start up', async function () {
    this.timeout(10000)
    serverjson = new Mocker({ source: { type: 'jsonfile', location: dir }, root: pageDir, port: 9000 })
    await serverjson.start()
  })

  require('./testApi')

  describe('test interface', function () {
    it('reconfig', async function () {
      await serverjson.reconfig({
        inject: true,
      })
      let data = await axios.get('http://localhost:9000')
      assert.notEqual(data.data, '<html><head></head></head></html>')
    })

    it('refresh', function (done) {
      const ws = new WebSocket('ws://localhost:9000/webClient')
      ws.on('message', data => {
        data = JSON.parse(data)
        assert.equal(data.action, 'reload')
        ws.close()
        done()
      })
      serverjson.refresh({})
    })
  })

  after('stop', async function () {
    await serverjson.exit()
  })
})

describe('server by db', function () {
  let serverjson
  const dir = path.join(__dirname, './source/db/v1')

  let project = genDb()
  const serverUrl = 'http://localhost:' + project.port

  before('start up', async function () {
    this.timeout(10000)
    serverjson = new Mocker({ source: { type: 'database', location: dir, projectId: project._id } })
    await serverjson.start()
  })

  // require('./testApi')

  describe('test interface', function () {
    this.timeout(10000)
    it('reconfig', async function () {
      await serverjson.reconfig({
        inject: false,
      })
      let data = await axios.get(serverUrl)
      assert.equal(data.data, '<html><head></head></head></html>')

      await serverjson.reconfig({
        inject: true,
      })
      let res = await axios.get(serverUrl)
      assert.notEqual(res.data, '<html><head></head></head></html>')
    })

    it('refresh', function (done) {
      const ws = new WebSocket('ws://localhost:' + project.port + '/webClient')
      ws.on('message', data => {
        data = JSON.parse(data)
        assert.equal(data.action, 'reload')
        ws.close()
        done()
      })
      ws.on('open', data => {
        serverjson.refresh({})
      })
    })
  })

  after('stop', async function () {
    await serverjson.exit()
  })
})
