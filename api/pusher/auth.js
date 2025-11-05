// Node.js Serverless Function to authenticate Pusher private/presence channels
// Endpoint: POST /api/pusher/auth

const { randomUUID } = require('crypto');
const { pusher } = require('../_lib/pusher');

function send(res, status, body) {
  res.status(status).setHeader('content-type', 'application/json').send(JSON.stringify(body));
}

async function readRawBody(req) {
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buf = Buffer.isBuffer(chunks[0]) ? Buffer.concat(chunks) : Buffer.from(chunks.join(''));
    return buf.toString('utf8');
  } catch {
    return '';
  }
}

function parseBody(raw) {
  // Accept both JSON and x-www-form-urlencoded
  try {
    return JSON.parse(raw);
  } catch {}
  const out = {};
  raw.split('&').forEach(pair => {
    const [k,v] = pair.split('=');
    if (!k) return;
    out[decodeURIComponent(k)] = decodeURIComponent((v||'').replace(/\+/g,' '));
  });
  return out;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'Method not allowed' });
  try {
    if (!pusher) return send(res, 503, { ok: false, error: 'pusher-not-configured' });

    let params = req.body;
    if (!params || typeof params !== 'object') {
      const raw = await readRawBody(req);
      params = parseBody(raw || '');
    }

    const socketId = String(params.socket_id || params.socketId || '').trim();
    const channelName = String(params.channel_name || params.channelName || '').trim();
    const name = String(params.name || 'Guest');

    if (!socketId || !channelName) return send(res, 400, { ok: false, error: 'missing-params' });

    const userId = 'user-' + (randomUUID ? randomUUID() : Math.random().toString(36).slice(2));
    const presenceData = { user_id: userId, user_info: { name } };

    const auth = pusher.authenticate(socketId, channelName, presenceData);
    return send(res, 200, auth);
  } catch (e) {
    console.error('[pusher-auth] failed', e);
    return send(res, 500, { ok: false, error: 'auth-failed' });
  }
};
