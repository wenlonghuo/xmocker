'use strict';

var Datastore = require('nedb-promise');
var join = require('path').join;
var userDirectory = join(process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'], '.mocker/v1/db');

function createDatabase(dir, name) {
  return new Datastore({ filename: join(dir, name), autoload: true });
}

module.exports = {
  init: function init(option) {
    var dir = (option.source || {}).location || userDirectory;
    var createDb = createDatabase.bind(null, dir);

    var apiBase = createDb('/apiBase');

    var apiModel = createDb('/apiModel');

    var appBase = createDb('/appBase');

    var project = createDb('/project');

    var Lib = createDb('/lib');

    this.dbs = {
      apiBase: apiBase,
      apiModel: apiModel,
      appBase: appBase,
      project: project,
      Lib: Lib
    };
    return this;
  }
};