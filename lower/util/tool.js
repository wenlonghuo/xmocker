'use strict';

var axios = require('axios');

function timeStampToISOString(time) {
  var noHour = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var date = new Date(time);
  if (isNaN(date.getTime())) {
    return '-';
  }
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  var str = date.toISOString();
  return noHour ? '' + str.slice(0, 10) : str.slice(0, 10) + ' ' + str.slice(11, 19);
}

function getDateRangeBefore() {
  var day = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var time = arguments[1];

  var date = time ? new Date(time) : new Date();
  var lastDate = new Date(date);
  lastDate.setDate(lastDate.getDate() - day + 1);
  return [lastDate, date];
}

module.exports = {
  axios: axios,
  randomInt: function randomInt() {
    var range = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;

    return Math.floor(Math.random() * range);
  },
  randomObjKeys: function randomObjKeys(obj) {
    var keys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    keys.forEach(function (key) {
      if (!isNaN(+obj[key])) {
        obj[key] = Math.random() * obj[key];
      }
    });
  },

  timeStampToISOString: timeStampToISOString,
  getDateRangeBefore: getDateRangeBefore
};