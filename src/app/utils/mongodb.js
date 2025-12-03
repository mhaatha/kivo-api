import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('error: MONGODB_URI is not defined');
}

// Create one MongoClient instance only
const client = new MongoClient(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
});

// We DO NOT call client.connect() here.

const db = client.db();

export { client, db };
