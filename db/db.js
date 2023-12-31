const mongodb = require('mongodb');
const dbName = 'CRM-app';
require('dotenv').config();
const db_url = `${process.env.DB_URL}/${dbName}`;
const MongoClient = mongodb.MongoClient;
module.exports = { mongodb, dbName, db_url, MongoClient };