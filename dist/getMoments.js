'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pouchdb = require('pouchdb');

var _pouchdb2 = _interopRequireDefault(_pouchdb);

var _cloudantCredentials = require('./cloudantCredentials');

var _omit = require('lodash/omit');

var _omit2 = _interopRequireDefault(_omit);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _logError = require('./logError');

var _logError2 = _interopRequireDefault(_logError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } //getMoments.js
//


const momentsDb = new _pouchdb2.default("https://dwoodlock.cloudant.com/gehc_moments", { auth: _cloudantCredentials.momentsDbAuth });

const usersDb = new _pouchdb2.default("https://dwoodlock.cloudant.com/gehc125users", { auth: _cloudantCredentials.userDbAuth });

const getMoments = (() => {
  var _ref = _asyncToGenerator(function* (req, res) {
    console.log("got a get at /moments");

    try {
      const allDocs = yield momentsDb.allDocs({
        include_docs: true,
        descending: true
      });
      const rows = allDocs.rows;
      const actualDocs = rows.map(function (r) {
        return r.doc;
      });
      const docsWithoutExtras = actualDocs.map(function (d) {
        return (0, _omit2.default)(d, ["_id", "_rev"]);
      });
      const userIds = docsWithoutExtras.reduce(function (acc, value) {
        return acc.add(value.userId);
      }, _immutable2.default.Set());

      const users = yield Promise.all(userIds.map(function (id) {
        return usersDb.get(id);
      }));
      const result = {
        moments: docsWithoutExtras,
        users: users
      };
      res.send(JSON.stringify(result));
    } catch (err) {
      (0, _logError2.default)("error reading from momentsDB ", err);
    }
  });

  return function getMoments(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

exports.default = getMoments;