import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

interface MongoClientCache {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
}

// Use global variable to preserve connection across hot reloads in development
const globalWithMongo = globalThis as typeof globalThis & {
  _mongoClientCache?: MongoClientCache;
};

if (!globalWithMongo._mongoClientCache) {
  globalWithMongo._mongoClientCache = { client: null, promise: null };
}

const cache = globalWithMongo._mongoClientCache;

export async function getMongoClient(): Promise<MongoClient> {
  if (cache.client) {
    return cache.client;
  }

  if (!cache.promise) {
    cache.promise = MongoClient.connect(MONGODB_URI!).then((client) => {
      cache.client = client;
      return client;
    });
  }

  return cache.promise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db();
}
