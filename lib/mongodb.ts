import mongoose from "mongoose";

const DEFAULT_MONGODB_URI =
  "mongodb://127.0.0.1:27017/learning_management_system";

type MongoConnectionCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  mongoConnectionCache?: MongoConnectionCache;
};

const cache = globalForMongoose.mongoConnectionCache ?? {
  connection: null,
  promise: null,
};

globalForMongoose.mongoConnectionCache = cache;

export async function connectMongoDB() {
  if (cache.connection) {
    return cache.connection;
  }

  const uri = process.env.MONGODB_URI ?? DEFAULT_MONGODB_URI;

  cache.promise ??= mongoose.connect(uri, {
    bufferCommands: false,
  });

  try {
    cache.connection = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }

  return cache.connection;
}
