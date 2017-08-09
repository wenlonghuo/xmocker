'use strict'

function nodeVersion () {
  return parseFloat(process.versions.node) || 0
}

module.exports = nodeVersion() > 7.6 ? require('./app') : require('./lower')
