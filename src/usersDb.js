//usersDb.js

import {userDbAuth} from './cloudantCredentials';
import PouchDB from 'pouchdb';

const usersDb = new PouchDB(
  "https://dwoodlock.cloudant.com/gehc125users", 
  {auth: userDbAuth});

export default usersDb;
