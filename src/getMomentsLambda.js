//getMomentsLambda.js

console.log('Loading function');

// const doc = require('dynamodb-doc');

// const dynamo = new doc.DynamoDB();

exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const res = {
    result: "Hi Don",
    calculation: 5
  }
  
  callback(null, res);
  // {
  //     // statusCode: err ? '400' : '200',
  //     // body: err ? err.message : JSON.stringify(res),
  //     // headers: {
  //     //     'Content-Type': 'application/json',
  //     // },
  // }
  // );
};