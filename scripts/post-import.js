/*
  Post wishes JSON to deployed import endpoint.

  Usage:
    SEED_TOKEN=... DEPLOY_URL=https://your-app.vercel.app \
    node scripts/post-import.js path/to/wishes.json
*/
const fs = require('fs');
const path = require('path');

async function main() {
  const file = process.argv[2];
  const token = process.env.SEED_TOKEN || '';
  const base = process.env.DEPLOY_URL || '';
  if (!file) { console.error('Usage: node scripts/post-import.js path/to/wishes.json'); process.exit(1); }
  if (!token) { console.error('SEED_TOKEN env var is required'); process.exit(1); }
  if (!base) { console.error('DEPLOY_URL env var is required'); process.exit(1); }
  if (!fs.existsSync(file)) { console.error('File not found:', file); process.exit(1); }
  const wishes = JSON.parse(fs.readFileSync(file, 'utf8'));
  const url = base.replace(/\/$/, '') + '/api/wishes/import';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-seed-token': token },
    body: JSON.stringify({ wishes })
  });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) {
    console.error('Import failed:', res.status, data);
    process.exit(1);
  }
  console.log('Import result:', data);
}

main().catch(e => { console.error(e); process.exit(1); });
