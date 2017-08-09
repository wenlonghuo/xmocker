/**
 * application controller
*/
const spawn = require('child_process').spawn
const path = require('path')

class Mocker {
  constructor (options) {
    this.option = Object.assign({}, options)
    this._uid = 0
    this.reqList = []
  }
  start () {
    let dir = resolve('./app')
    let startArgs = [`"${dir}"`, `--option="${convertCode(JSON.stringify(this.option))}"`]
    return new Promise((resolve, reject) => {
      let server = spawn('node', startArgs, {
        stdio: ['pipe', 'ipc', 'pipe'],
        shell: true,
      })

      server.stderr.on('data', e => {
        console.error(e.toString())
      })
      server.on('exit', (code, signal) => {
        reject({code, signal, option: this.option})
      })

      server.on('message', msg => {
        if (typeof msg === 'object') {
          if (msg.type === 'finish') {
            resolve(msg.data)
          } else if (msg.type === 'console') {
            console.log(msg)
          } else if (msg.type === 'log') {
            this.emit('log', msg)
          } else {
            this.reqHandler(msg)
          }
        }
      })
      this.server = server
    })
  }
  reqHandler (msg) {
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
  send (action, data) {
    if (!this.server) throw new Error('server has not started!')
    let msg = { action, data, _uid: this._uid++ }
    this.server.send(msg)
    return new Promise((resolve, reject) => {
      this.reqList.push({_uid: msg._uid, resolve, reject})
    })
  }
  reconfig (option) {

  }
  refresh (option) {
    this.send('refresh', option)
  }
  setLinkViews (option) {
    this.send('setLinkViews', option)
  }
  setApiReturn (option) {
    this.send('setApiReturn', option)
  }
  getApiReturns (option) {
    this.send('getApiReturns', option)
  }
  setProxyMode (option) {
    this.send('setProxyMode', option)
  }
  reloadApis (option) {
    this.send('reloadApis', option)
  }
  exit (option) {
    this.send('exit', option)
  }
  restart (option) {
    this.send('restart', option)
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
