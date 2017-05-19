//s3Credentials.js

import {s3} from './amazonCredentials';
import usersDb from './usersDb';
//const usersDb = require('./usersDb');

const btoa = require('btoa');
const Crypto = require('crypto-js');


const AccessKeyID = s3.AccessKeyID;
const regionName = s3.regionName;
const secretAccessKey = s3.secretAccessKey; 

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

  const currentYear = (new Date()).toISOString().substring(0, 4);

  const today = todayAsYyyymmdd();
  const policy2 = { 
    "expiration": `${currentYear}-12-30T12:00:00.000Z`,
    "conditions": [
      {"bucket": s3.bucketName},
      ["starts-with", "$key", "uploads/"],
      {"acl": "public-read"},
      ["starts-with", "$Content-Type", "image/"],
      ["x-amz-meta-Cache-Control", "max-age=31557600"],
      {"x-amz-credential": `${AccessKeyID}/${today}/us-east-2/s3/aws4_request`},
      {"x-amz-algorithm": "AWS4-HMAC-SHA256"},
      {"x-amz-date": `${today}T000000Z` }
    ]
  };  
  return policy2
}

const checkUser = async (req) => {
  const userId = req.query.userId
  if (!userId) {
    return false;
  }
  try {
    const userDoc = await usersDb.get(userId);
    console.log("userDoc ", userDoc);
    return true;    
  }
  catch(err) {
    console.log("userDoc2 ");
    return false;
  }

}


const getCredentials = async (req, res) => {

  console.log("got a get at /credentials");
  console.log("here's the params ", req.query);
  const isUserOk = await checkUser(req);
  if (!isUserOk) {
    res.send(JSON.stringify({result: "error2"}));
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
  }

  res.send(JSON.stringify(credentials));
}



module.exports = getCredentials;