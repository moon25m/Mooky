// Node.js Serverless Function for getting the total wish count (CommonJS)
// Endpoint: GET /api/wish/count

const { neon } = require('@neondatabase/serverless');

function send(res, status, body) {
  res.status(status).setHeader('content-type', 'application/json').send(JSON.stringify(body));
}

function sanitizeDbUrl(raw) {
  if (!raw) return '';
  let s = String(raw).trim();
  s = s.replace(/^psql\s+/, '');
  s = s.replace(/^['"]|['"]$/g, '');
  return s;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return send(res, 405, { ok: false, error: 'Method not allowed' });
  }
  try {
    const url = sanitizeDbUrl(process.env.DATABASE_URL);
    if (!url || !/^postgres(ql)?:\/\//i.test(url)) {
      return send(res, 503, { ok: false, error: 'DATABASE_URL not configured' });
    }
    const sql = neon(url);
    const rows = await sql`select count(*)::int as count from wishes`;
    res.setHeader('cache-control', 'no-store, no-cache, must-revalidate');
    const count = Array.isArray(rows) && rows[0] && typeof rows[0].count !== 'undefined' ? rows[0].count : 0;
    return send(res, 200, { count });
  } catch (err) {
    return send(res, 500, { ok: false, error: err?.message || 'failed' });
  }
};
