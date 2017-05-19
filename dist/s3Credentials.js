'use strict';

var _amazonCredentials = require('./amazonCredentials');

var _usersDb = require('./usersDb');

var _usersDb2 = _interopRequireDefault(_usersDb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } //s3Credentials.js

//const usersDb = require('./usersDb');

const btoa = require('btoa');
const Crypto = require('crypto-js');

const AccessKeyID = _amazonCredentials.s3.AccessKeyID;
const regionName = _amazonCredentials.s3.regionName;
const secretAccessKey = _amazonCredentials.s3.secretAccessKey;

function todayAsYyyymmdd() {
  var date = new Date().toISOString();
  return date.substr(0, 4) + date.substr(5, 2) + date.substr(8, 2);
}

function getSignature(policy164) {

  var kDate = Crypto.HmacSHA256(todayAsYyyymmdd(), "AWS4" + secretAccessKey);
  var kRegion = Crypto.HmacSHA256(regionName, kDate);
  //console.log(newRegionName);
  var kService = Crypto.HmacSHA256("s3", kRegion);
  var kSigning = Crypto.HmacSHA256("aws4_request", kService);
  const signature = Crypto.HmacSHA256(policy164, kSigning).toString();
  return signature;
}

function getPolicy() {

  const currentYear = new Date().toISOString().substring(0, 4);

  const today = todayAsYyyymmdd();
  const policy2 = {
    "expiration": `${currentYear}-12-30T12:00:00.000Z`,
    "conditions": [{ "bucket": _amazonCredentials.s3.bucketName }, ["starts-with", "$key", "uploads/"], { "acl": "public-read" }, ["starts-with", "$Content-Type", "image/"], ["x-amz-meta-Cache-Control", "max-age=31557600"], { "x-amz-credential": `${AccessKeyID}/${today}/us-east-2/s3/aws4_request` }, { "x-amz-algorithm": "AWS4-HMAC-SHA256" }, { "x-amz-date": `${today}T000000Z` }]
  };
  return policy2;
}

const checkUser = (() => {
  var _ref = _asyncToGenerator(function* (req) {
    const userId = req.query.userId;
    if (!userId) {
      return false;
    }
    try {
      const userDoc = yield _usersDb2.default.get(userId);
      console.log("userDoc ", userDoc);
      return true;
    } catch (err) {
      console.log("userDoc2 ");
      return false;
    }
  });

  return function checkUser(_x) {
    return _ref.apply(this, arguments);
  };
})();

const getCredentials = (() => {
  var _ref2 = _asyncToGenerator(function* (req, res) {

    console.log("got a get at /credentials");
    console.log("here's the params ", req.query);
    const isUserOk = yield checkUser(req);
    if (!isUserOk) {
      res.send(JSON.stringify({ result: "error2" }));
      return;
    }
    const policy = getPolicy();
    const policy164 = btoa(JSON.stringify(policy));
    const signature = getSignature(policy164);
    const credential = `${AccessKeyID}/${todayAsYyyymmdd()}/${regionName}/s3/aws4_request`;
    const credentials = {
      policy: policy164,
      signature,
      credential
    };

    res.send(JSON.stringify(credentials));
  });

  return function getCredentials(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
})();

module.exports = getCredentials;