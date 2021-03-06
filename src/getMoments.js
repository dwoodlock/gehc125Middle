//getMoments.js
//
import PouchDB from 'pouchdb';
import {userDbAuth} from './cloudantCredentials';
import omit from 'lodash/omit';
import immutable from 'immutable';
import logError from './logError';
import momentsDb from './momentsDb';

const usersDb = new PouchDB(
  "https://dwoodlock.cloudant.com/gehc125users", 
  {auth: userDbAuth});

const getMoments = async (req, res) => {
  console.log("got a get at /moments");

  try {
    const allDocs = await momentsDb.allDocs({
      include_docs: true,
      descending: true
    });
    const rows = allDocs.rows;
    const actualDocs = rows.map((r) => r.doc);
    const docsWithoutExtras = actualDocs.map((d) => omit(d, ["_id", "_rev"]));
    const userIds = docsWithoutExtras.reduce((acc, value) => {
      return acc.add(value.userId)
    }, immutable.Set());

    const users = await Promise.all(userIds.map((id) => {
      return usersDb.get(id)
    }));
    const usersWithoutExtras = users.map((u) => omit(u, ["_id", "_rev"]));
    const result = {
      moments: docsWithoutExtras,
      users: usersWithoutExtras      
    }
    res.send(JSON.stringify(result));   
   
  }
  catch(err) {
    logError("error reading from momentsDB ", err);
  }

}

export default getMoments;

