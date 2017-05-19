'use strict';

var _postMoment = require('./postMoment');

var _postMoment2 = _interopRequireDefault(_postMoment);

var _getMoments = require('./getMoments');

var _getMoments2 = _interopRequireDefault(_getMoments);

var _usersDb = require('./usersDb');

var _usersDb2 = _interopRequireDefault(_usersDb);

var _logError = require('./logError');

var _logError2 = _interopRequireDefault(_logError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//app.js


var port = process.env.PORT || 5000;
var express = require('express');
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');
var setItem = require('./localPouch').setItem;
var PouchDB = require('pouchdb');
var immutable = require('immutable');
var admin = require("firebase-admin");
var cloudantCredentials = require('./cloudantCredentials');
var handleS3Credentials = require('./s3Credentials');


// var serviceAccount = require("../../nonjs/gehc125-firebase-adminsdk-wnyyt-187283aae4.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://gehc125.firebaseio.com"
// });

// eslint-disable-next-line no-undef
const version = 1495237406198;
const html = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"> <html lang="en"> <head> <meta http-equiv="content-type" content="text/html; charset=utf-8"> <title>Title Goes Here</title> </head> <body> <p>This is version ${new Date(version).toLocaleString()} at %TIME%</p> </body> </html>`;

const gameDB = new PouchDB("https://dwoodlock.cloudant.com/gehc125games", {
  auth: cloudantCredentials.gamesDbAuth
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  const datedHtml = html.replace("%TIME%", Date.now());
  console.log("got a get at /");
  res.send(datedHtml);
});

app.get('/users', function (req, res) {
  console.log("got a get at /users");
  _usersDb2.default.allDocs({ include_docs: true }).then(docs => docs.rows).then(rows => rows.map(r => r.doc)).then(actualDocs => {
    res.send(JSON.stringify(actualDocs));
  });
});

app.post('/user', function (req, res) {
  console.log("got a post at /user");
  console.log("here's the body: ", req.body);
  const user = req.body;
  setItem(_usersDb2.default, user.userId, user).then(info => console.log("success posting to users database ", info)).catch(err => {
    (0, _logError2.default)("error posting to users database " + JSON.stringify(err));
  }).then(() => {
    res.send('Hello World2!');
  });
});

function getDeviceToken(userId) {
  return _usersDb2.default.get(userId).then(doc => doc.deviceToken);
}

function pushToChallengee3(deviceToken, challenger, badge) {
  if (!deviceToken) return;
  const payload = {
    notification: {
      title: "You've been Challenged!",
      body: `${challenger.get("first")} has challenged you to the 125 Year quiz`,
      badge: badge.toString(),
      sound: "Enabled"
    }
  };

  return admin.messaging().sendToDevice(deviceToken, payload).then(function (response) {
    console.log("Successfully sent message:", response);
  }).catch(function (error) {
    (0, _logError2.default)("Error sending message: " + JSON.stringify(error));
  });
}

function getBadge(challengeeId) {
  return getChallenges(challengeeId).then(challenges => {
    const badge = challenges.length;
    return badge;
  });
}

function getUser(id) {
  return _usersDb2.default.get(id).then(doc => {
    return immutable.Map(doc);
  }).catch(err => {
    (0, _logError2.default)("error getting the user " + JSON.stringify(id));
    return Promise.reject(err);
  });
}

function pushToChallengee(gameResult) {
  const challengeeId = gameResult.get("challengee");
  if (!challengeeId) return;
  const userId = gameResult.get("userId");
  const p1 = getDeviceToken(challengeeId);
  const p2 = getUser(userId);
  const p3 = getBadge(challengeeId);

  Promise.all([p1, p2, p3]).then(([deviceToken, challenger, badge]) => {
    pushToChallengee3(deviceToken, challenger, badge);
  }).catch(err => (0, _logError2.default)("error sending push notification " + JSON.stringify(err)));
}

function resolveChallenge(game) {
  const challengeGameId = game.get("challengeGameId");
  if (!challengeGameId) return;
  return gameDB.get(challengeGameId).then(doc => Object.assign({ status: "closed" }, doc)).then(newDoc => gameDB.put(newDoc)).then(() => console.log("update to status was successful ")).catch(err => (0, _logError2.default)("some error in updating the status " + JSON.stringify(err)));
}

app.post('/gameresults', function (req, res) {
  const doc = Object.assign({}, req.body, { timestamp: Date.now() });
  const game = immutable.Map(doc);
  setItem(gameDB, doc.gameId, doc).then(() => console.log("game results post was successful")).then(() => pushToChallengee(game)).then(() => resolveChallenge(game)).catch(err => (0, _logError2.default)("game results POST error " + JSON.stringify(err)));
  res.send("hey");
});

app.post('/post', _postMoment2.default);
app.get('/moments', _getMoments2.default);

app.get("/s3Credentials", handleS3Credentials);

function sortByDate(a, b) {
  return a.timestamp - b.timestamp;
}

function getChallenges(userId) {
  return gameDB.allDocs({ include_docs: true }).then(docs => {
    const rows = docs.rows;
    const actualDocs = rows.map(r => r.doc);
    const docsForThisUser = actualDocs.filter(d => d.challengee === userId);
    const challengesStillOpen = docsForThisUser.filter(d => d.status !== "closed");
    const sortedChallenges = challengesStillOpen.sort(sortByDate);
    return sortedChallenges;
  });
}

app.get('/challenges', function (req, res) {
  console.log("got a get at challenges");
  console.log("params ", req.query);
  res.setHeader('Content-Type', 'application/json');
  getChallenges(req.query.userId).then(docs => {
    res.send(JSON.stringify(docs));
  }).catch(err => {
    res.send(JSON.stringify({ err }));
  });
});

app.listen(port, function () {
  console.log('Example app listening on port ' + port + '!');
});