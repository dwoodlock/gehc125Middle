'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cloudantCredentials = require('./cloudantCredentials');

var _pouchdb = require('pouchdb');

var _pouchdb2 = _interopRequireDefault(_pouchdb);

var _logError = require('./logError');

var _logError2 = _interopRequireDefault(_logError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } //postMoment.js

const setItem = require('./localPouch').setItem;


const momentsDb = new _pouchdb2.default("https://dwoodlock.cloudant.com/gehc_moments", { auth: _cloudantCredentials.momentsDbAuth });

/* 
params
postId,
imageUri,
text
userId
clientTimestamp


*/

const handlePostMoment = (() => {
  var _ref = _asyncToGenerator(function* (req, res) {
    try {
      const body = req.body;
      const id = body.timestamp + "-" + body.postId;
      const info = yield setItem(momentsDb, id, body);
      console.log("successfully saved moment ", info);
      res.send(JSON.stringify(info));
    } catch (err) {
      //not rethrowing
      (0, _logError2.default)("error saving to moments db " + JSON.stringify(err));
      res.send(JSON.stringify(err));
    }
  });

  return function handlePostMoment(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

exports.default = handlePostMoment;