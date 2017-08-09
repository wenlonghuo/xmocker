'use strict';

var os = require('os');
function getIp() {
  var netInfo = os.networkInterfaces();
  var localIp = 'localhost';
  if (netInfo) {
    var keys = Object.keys(netInfo);
    keys.filter(function (key) {
      var list = netInfo[key];
      list.forEach(function (info) {
        if (/^[\d]{1,3}\./.test(info.address)) {
          if (!/^127\./.test(info.address)) {
            localIp = info.address;
          }
        }
      });
    });
  }
  return localIp;
}
var ip = getIp();

module.exports = {
  ip: ip
};