//errorHandling.js

import AWS from 'aws-sdk';
import {gehc125MiddleIAM} from './amazonCredentials';

const sns = new AWS.SNS({
  region: "us-east-1",
  accessKeyId : gehc125MiddleIAM.AccessKeyID,
  secretAccessKey : gehc125MiddleIAM.secretAccessKey  
});


const logError = (err) => {
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
  sns.publish(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
}

export default logError;