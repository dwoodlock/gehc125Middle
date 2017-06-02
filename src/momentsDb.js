//momentsDb.js

import {momentsDbAuth} from './cloudantCredentials';
import PouchDB from 'pouchdb';

const momentsDb = new PouchDB(
  "https://dwoodlock.cloudant.com/gehc_moments", 
  {auth: momentsDbAuth});

export default momentsDb;

