/**
 * application controller
*/
const spawn = require('child_process').spawn
const path = require('path')
const WebSocket = require('ws')

class Mocker {
  constructor (options) {
    this.option = Object.assign({}, options)
    this._uid = 1
    this.reqList = []
    // 0 exit 1 error 2 waiting 3 success
    this.status = 2
  }
  start (log) {
    this._log = log
    let dir = resolve('./app')
    let startArgs = [`"${dir}"`, `--option="${convertCode(JSON.stringify(this.option))}"`]
    return new Promise((resolve, reject) => {
      let server = spawn('node', startArgs, {
        shell: true,
      })

      server.stderr.on('data', e => {
        console.error(e.toString())
      })
      server.on('exit', (code, signal) => {
        if (code !== 0) {
          this.status = 1
          reject({code, signal, option: this.option})
        }
      })

      server.stdout.on('data', data => {
        data = data.toString()
        if (/^finish::/.test(data)) {
          data = JSON.parse(data.slice(8))
          this._port = data.port
          // connect to client by websocket
          const ws = new WebSocket(`ws://localhost:${this._port}/owners`)

          ws.on('message', this._dealWsMsg.bind(this))

          ws.on('open', () => {
            this.ws = ws
            resolve(data)
          })
          ws.on('error', (e) => {
            reject(e)
          })
          ws.on('close', (e) => {
            console.log('maybe something is wrong...', e)
            this._reConnectSocket()
          })

          return
        }
        console.log(data)
      })
      this.server = server
    })
  }
  _dealWsMsg (req) {
    try {
      req = JSON.parse(req)
    } catch (e) {
      console.log(e)
      return
    }
    if (req._uid) {
      return this._reqHandler(req)
    }

    if (req.action === 'console') {
      return console.log(req)
    }
    if (req.action === 'log' && this._log) {
      this._log(req)
    }
  }
  _reConnectSocket () {
    const ws = new WebSocket(`ws://localhost:${this._port}/owners`)

    ws.on('message', this._dealWsMsg.bind(this))

    ws.on('open', () => {
      this.ws = ws
    })
    ws.on('close', (e) => {
      setTimeout(this._reConnectSocket.bind(this), 1000)
    })
    ws.on('error', (e) => {
      console.log(e)
    })
  }
  _reqHandler (msg) {
    if (msg._uid) {
      let reqIndex = this.reqList.findIndex(item => item._uid === msg._uid)
      if (~reqIndex) {
        let req = this.reqList.splice(reqIndex, 1)[0]
        if (msg.status === 0) {
          req.resolve(msg)
        } else {
          req.reject(msg)
        }
      }
    }
  }
  _send (action, data) {
    if (!this.server) throw new Error('server has not started!')
    let msg = { action, data, _uid: this._uid++ }
    this.ws.send(JSON.stringify(msg))
    return new Promise((resolve, reject) => {
      this.reqList.push({_uid: msg._uid, resolve, reject})
    })
  }
  reconfig (option) {
    return this._send('reconfig', option)
  }
  refresh (option) {
    return this._send('refresh', option)
  }
  setLinkViews (option) {
    return this._send('setLinkViews', option)
  }
  setApiReturn (option) {
    return this._send('setApiReturn', option)
  }
  getApiReturns (option) {
    return this._send('getApiReturns', option)
  }
  setProxyMode (option) {
    return this._send('setProxyMode', option)
  }
  reloadApis (option) {
    return this._send('reloadApis', option)
  }
  exit (option) {
    if (!this.server) return Promise.reject('server has not started!')
    return new Promise((resolve, reject) => {
      this.server.on('exit', (code, signal) => {
        delete this.server
        this.status = 0
        resolve(this)
      })
      this._send('exit', option)
    })
  }
  restart (option) {
    return this._send('restart', option)
  }
}

function resolve (dir) {
  return path.join(__dirname, dir)
}

function convertCode (param) {
  let p = param || ''
  return encodeURIComponent(p)
}

module.exports = Mocker
