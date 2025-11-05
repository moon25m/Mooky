// DB client for server-side code (Neon via DATABASE_URL)
// Throws a helpful error if the env var is missing.
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is missing. Set it in Vercel → Settings → Environment Variables.');

export const sql = neon(url);
