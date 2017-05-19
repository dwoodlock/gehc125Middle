//postMoment.js

import {momentsDbAuth} from './cloudantCredentials';
const setItem = require('./localPouch').setItem;
import PouchDB from 'pouchdb';
import logError from './logError';

const momentsDb = new PouchDB(
  "https://dwoodlock.cloudant.com/gehc_moments", 
  {auth: momentsDbAuth});

/* 
params
postId,
imageUri,
text
userId
clientTimestamp


*/



const handlePostMoment = async (req, res) => {
  try {
    const body = req.body;
    const id = body.timestamp + "-" + body.postId; 
    const info = await setItem(momentsDb, id, body);    
    console.log("successfully saved moment ", info);
    res.send(JSON.stringify(info)); 
  }
  catch(err) { //not rethrowing
    logError("error saving to moments db " + JSON.stringify(err));
    res.send(JSON.stringify(err)); 
  }  
}

export default handlePostMoment;


