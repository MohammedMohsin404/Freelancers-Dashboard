// /lib/mongodb.ts
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error(
    "MONGODB_URI is not set (check Vercel Project → Settings → Environment Variables)."
  );
}

// Reuse the client across hot reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In prod, always create a new client
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;

// (Optional) helper if you want easy DB access elsewhere
export async function getDb(name = process.env.MONGODB_DB || "freelancers-dashboard") {
  const c = await clientPromise;
  return c.db(name);
}
