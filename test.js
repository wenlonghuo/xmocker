'use strict'
const Mocker = require('./')
// const server = new Mocker({ source: { projectId: 'xLFFDZ2NVnKCBhdo', type: 'database' } })
// console.time('启动数据库时间')
// server.start().catch(e => console.log(e)).then(data => { console.log(data); console.timeEnd('启动数据库时间') })

const serverjson = new Mocker({ source: { type: 'json' }, root: 'D:\\project\\02_天桃', port: 9000 })
console.time('启动json时间')
serverjson.start().catch(e => console.log(e)).then(data => { console.log(data); console.timeEnd('启动json时间') })
