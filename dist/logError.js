'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _amazonCredentials = require('./amazonCredentials');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//errorHandling.js

const sns = new _awsSdk2.default.SNS({
  region: "us-east-1",
  accessKeyId: _amazonCredentials.gehc125MiddleIAM.AccessKeyID,
  secretAccessKey: _amazonCredentials.gehc125MiddleIAM.secretAccessKey
});

const logError = err => {
  const params = {
    Message: 'Middle Tier Error ' + JSON.stringify(err),
    //   MessageAttributes: {
    //     'error': {
    //       DataType: 'String', /* required */
    //       StringValue: JSON.stringify(err)
    //   },
    // },
    TopicArn: 'arn:aws:sns:us-east-1:472594667306:middleTierErrors'
  };

  console.log(err);
  sns.publish(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else console.log(data); // successful response
  });
};

exports.default = logError;