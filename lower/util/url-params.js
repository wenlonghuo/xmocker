'use strict';

function getMatchName(str) {
  var key = str[0] === ':' && str.slice(1);
  if (!key) return;
  return (/\?$/.test(key) ? { key: key.slice(0, key.length - 1) } : { key: key, need: true }
  );
}

function removeLastSlash(url) {
  return url.replace(/\/$/, '');
}

module.exports = function extractURLParams() {
  var testURL = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var url = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  if (typeof testURL !== 'string' || typeof url !== 'string') return;
  testURL = removeLastSlash(testURL);
  url = removeLastSlash(url);
  var testArr = testURL.split('/').slice(1);
  var urlArr = url.split('/').slice(1);

  if (urlArr.length > testArr.length) return;
  var params = {};
  for (var i = 0; i < testArr.length; i++) {
    var t = testArr[i];
    var u = urlArr[i];
    var stat = getMatchName(t);

    if (!stat && t !== u) return;
    if (stat) {
      if (stat.need && u === undefined) return;
      if (u !== undefined) params[stat.key] = u;
    }
  }
  return params;
};