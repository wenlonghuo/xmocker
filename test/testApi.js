'use strict'
const assert = require('assert')
const path = require('path')
const Mocker = require('../')
const WebSocket = require('ws')
const axios = require('axios')

describe('test api', function () {
  it('file server started', async function () {
    let data = await axios.get('http://localhost:9000')
    assert.equal(data.data, '<html><head></head></head></html>')
  })

  it('no found', async function () {
    let status
    try {
      await axios.get('http://localhost:9000/noexistapi')
    } catch (e) {
      status = e.response.status
    }
    assert.equal(status, 404)
  })

  it('get api with no model', async function () {
    let data = await axios.get('http://localhost:9000/apione/nomodel')
    assert.deepEqual(data.data, {
      'code': 0,
      'data': 'one api base',
    })
  })

  it('post api with no model', async function () {
    let data = await axios.post('http://localhost:9000/apione/nomodel')
    assert.deepEqual(data.data, {
      'code': 0,
      'data': 'one api base, post',
    })
  })

  it('post api with second path', async function () {
    let data = await axios.post('http://localhost:9000/api', { func: 'secondPath' })
    assert.deepEqual(data.data, {
      'code': 0,
      'data': 'secondPath',
    })
  })

  it('api with model condition empty', async function () {
    let data = await axios.post('http://localhost:9000/api')
    assert.deepEqual(data.data, {
      'code': 0,
      'data': 'on default model',
    })
  })

  it('api with model condition', async function () {
    let data = await axios.post('http://localhost:9000/apimulti', {a: 1})
    assert.deepEqual(data.data, {
      'code': 0,
      'data': 'on condition',
    })
  })

  it('api fallback to base when model test false', async function () {
    let data = await axios.post('http://localhost:9000/apifallback')
    assert.deepEqual(data.data, {
      'code': 0,
      'data': 'on base',
    })
  })

})
