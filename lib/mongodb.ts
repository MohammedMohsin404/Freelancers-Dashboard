// lib/mongodb.ts
import { MongoClient } from "mongodb";

let _clientPromise: Promise<MongoClient> | null = null;

export default function getMongoClientPromise(): Promise<MongoClient> {
  if (_clientPromise) return _clientPromise;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set (check Vercel Project → Settings → Environment Variables)."
    );
  }

  const client = new MongoClient(uri);

  if (process.env.NODE_ENV === "development") {
    // @ts-expect-error dev global cache
    global._mongoClientPromise = global._mongoClientPromise || client.connect();
    // @ts-expect-error read cached promise
    _clientPromise = global._mongoClientPromise as Promise<MongoClient>;
  } else {
    _clientPromise = client.connect();
  }

  return _clientPromise;
}
