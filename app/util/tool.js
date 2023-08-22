const axios = require('axios')
const faker = require('@faker-js/faker').faker

function timeStampToISOString (time, noHour = false) {
  let date = new Date(time)
  if (isNaN(date.getTime())) {
    return '-'
  }
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  let str = date.toISOString()
  return noHour
    ? `${str.slice(0, 10)}`
    : `${str.slice(0, 10)} ${str.slice(11, 19)}`
}

function getDateRangeBefore (day = 0, time) {
  const date = time ? new Date(time) : new Date()
  const lastDate = new Date(date)
  lastDate.setDate(lastDate.getDate() - day + 1)
  return [lastDate, date]
}

module.exports = {
  axios,
  faker,
  randomInt (range = 100) {
    return Math.floor(Math.random() * range)
  },
  randomObjKeys (obj, keys = []) {
    keys.forEach(key => {
      if (!isNaN(+obj[key])) {
        obj[key] = Math.random() * obj[key]
      }
    })
  },
  timeStampToISOString: timeStampToISOString,
  getDateRangeBefore,
}
