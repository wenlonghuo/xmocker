'use strict'
const assert = require('assert')
const path = require('path')
const Mocker = require('../')
const WebSocket = require('ws')
const axios = require('axios')
const sourceDir = path.join(__dirname, 'source')
const pageDir = path.join(sourceDir, 'page')

describe('server by json type', function () {
  const json = require('./source/json/onApi.json')
  let serverjson
  before('start up', async function () {
    this.timeout(10000)
    serverjson = new Mocker({ source: { type: 'json', jsonData: json }, root: pageDir, port: 9000 })
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
})
