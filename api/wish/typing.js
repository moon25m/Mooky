// Node.js Serverless Function to broadcast typing state via Pusher
// Endpoint: POST /api/wish/typing

const { pusher, CHANNEL, EVENTS } = require('../../api/_lib/pusher');

function send(res, status, body) {
  res.status(status).setHeader('content-type', 'application/json').send(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'Method not allowed' });
  try {
    const { name, typing } = typeof req.body === 'object' ? req.body : {};
    const payload = { name: String(name || 'Someone').slice(0, 30), at: Date.now() };
    if (!pusher) return send(res, 200, { ok: true, skipped: 'pusher-not-configured' });
    await pusher.trigger(CHANNEL, typing ? EVENTS.TYPING_START : EVENTS.TYPING_STOP, payload);
    return send(res, 200, { ok: true });
  } catch (e) {
    console.error('POST /api/wish/typing', e);
    return send(res, 500, { ok: false });
  }
};
