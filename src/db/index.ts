import "dotenv/config"
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
const connString = process.env.DATABASE_URL!

if (!connString) {
    throw new Error("DATABASE URL IS MISSING")
}
const sql = neon(connString);
export const db = drizzle(sql, { schema });

export type DB = typeof db;
