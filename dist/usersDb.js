'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cloudantCredentials = require('./cloudantCredentials');

var _pouchdb = require('pouchdb');

var _pouchdb2 = _interopRequireDefault(_pouchdb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//usersDb.js

const usersDb = new _pouchdb2.default("https://dwoodlock.cloudant.com/gehc125users", { auth: _cloudantCredentials.userDbAuth });

exports.default = usersDb;