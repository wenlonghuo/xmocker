'use strict'
const Mocker = require('./app')
const server = new Mocker({ source: { projectId: 'xLFFDZ2NVnKCBhdo', type: 'database' } })
console.time('启动时间')
server.start().catch(e => console.log(e)).then(data => { console.timeEnd('启动时间') })
