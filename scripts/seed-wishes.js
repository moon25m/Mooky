/*
  Seed Neon wishes table from a local JSON file.

  Usage:
    DATABASE_URL=postgres://... node scripts/seed-wishes.js [path/to/wishes.json]

  JSON shape (array of objects):
    [
      { "id": "optional-uuid", "name": "Alice", "message": "Happy Birthday!", "createdAt": 1730784000000 }
    ]
*/
const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

async function main() {
  const file = process.argv[2] || path.join(process.cwd(), 'seeds', 'wishes.json');
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL env var is required');
    process.exit(1);
  }
  if (!fs.existsSync(file)) {
    console.error(`Seed file not found: ${file}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(file, 'utf8');
  let arr;
  try { arr = JSON.parse(raw); } catch (e) { console.error('Invalid JSON:', e.message); process.exit(1); }
  if (!Array.isArray(arr)) { console.error('Seed file must be a JSON array'); process.exit(1); }

  const sql = neon(url);
  // ensure schema
  await sql`create table if not exists wishes (
    id text primary key,
    name text not null,
    message text not null,
    created_at timestamptz not null default now()
  )`;

  let inserted = 0, skipped = 0;
  for (const w of arr) {
    const id = String(w.id || crypto.randomUUID());
    const name = String(w.name || 'Anonymous');
    const message = String(w.message || '').slice(0, 1000);
    if (!message) { skipped++; continue; }
    // createdAt may be ms number or ISO string
    let createdAt;
    if (typeof w.createdAt === 'number') createdAt = new Date(w.createdAt).toISOString();
    else if (typeof w.createdAt === 'string') createdAt = new Date(w.createdAt).toISOString();
    else createdAt = new Date().toISOString();

    await sql`insert into wishes (id, name, message, created_at)
      values (${id}, ${name}, ${message}, ${createdAt})
      on conflict (id) do nothing`;
    inserted++;
  }
  console.log(`Seed complete. Inserted ${inserted}, skipped ${skipped}.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
