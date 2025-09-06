// /lib/mongodb.ts
import { MongoClient } from "mongodb";

// Keep one promise across hot reloads in dev
let cachedPromise: Promise<MongoClient> | null = null;

export default function getMongoClientPromise(): Promise<MongoClient> {
  if (cachedPromise) return cachedPromise;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set (check Vercel Project → Settings → Environment Variables)."
    );
  }

  const client = new MongoClient(uri);

  if (process.env.NODE_ENV === "development") {
    // @ts-expect-error attach to global for dev to avoid re-connecting on HMR
    if (!global._mongoClientPromise) {
      // @ts-expect-error
      global._mongoClientPromise = client.connect();
    }
    // @ts-expect-error
    cachedPromise = global._mongoClientPromise as Promise<MongoClient>;
  } else {
    cachedPromise = client.connect();
  }

  return cachedPromise;
}
