const express = require('express');
const cors = require('cors');
const path = require('path');
const { randomUUID } = require('crypto');
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });
const { wishesStore } = require('./wishesStore');
const { sendWishEmail } = require('./mailer2');

const app = express();
const PORT = process.env.PORT || process.env.API_PORT || 4000;

app.use(cors());
app.use(express.json());

// Simple profanity list – extend as needed
const BAD_WORDS = ['fuck', 'shit', 'bitch'];
function containsBadWords(text = '') {
  try {
    const s = String(text || '');
    return BAD_WORDS.some(w => new RegExp(`\\b${w}\\b`, 'i').test(s));
  } catch {
    return false;
  }
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/wishes', (_req, res) => {
  res.json({ wishes: wishesStore.all() });
});

app.post('/api/wishes', async (req, res) => {
  try {
    const { name, message } = req.body || {};
    const cleanName = String(name || '').slice(0, 80).trim();
    const cleanMsg = String(message || '').slice(0, 1000).trim();
    if (!cleanMsg) return res.status(400).json({ ok: false, error: 'Message required' });
    if (containsBadWords(cleanMsg)) {
      return res.status(400).json({ ok: false, error: 'Inappropriate language is not allowed.' });
    }

    const wish = { id: randomUUID(), name: cleanName || 'Anonymous', message: cleanMsg, createdAt: Date.now() };
    wishesStore.push(wish);

    // fire-and-forget email
    sendWishEmail(wish.name, wish.message).catch(err => console.error('[mailer]', err));

    res.json({ ok: true, wish });
  } catch (e) {
    res.status(400).json({ ok: false, error: 'Invalid request' });
  }
});

app.get('/api/wishes/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  // initial snapshot
  send({ type: 'snapshot', wishes: wishesStore.all() });

  const onWish = (w) => send({ type: 'wish', wish: w });
  wishesStore.onWish(onWish);

  const keepAlive = setInterval(() => res.write(':keepalive\n\n'), 30000);

  req.on('close', () => {
    clearInterval(keepAlive);
    wishesStore.offWish(onWish);
    res.end();
  });
});

// Admin-only delete endpoint for dev server (file-backed store)
app.delete('/api/messages/:id', (req, res) => {
  try {
    const id = String(req.params.id || '');
    if (!id) return res.status(400).json({ ok: false, error: 'Missing id' });

    const headerPass = String(req.headers['x-admin-pass'] || '');
    const cookieFlag = String(req.cookies?.mooky_admin || req.headers.cookie?.includes('mooky_admin=1') ? '1' : '') || '';
    const expected = process.env.MOOKY_ADMIN_PASS || process.env.NEXT_PUBLIC_MOOKY_ADMIN_PASS || '';
    if (!(expected && headerPass === expected) && cookieFlag !== '1') {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    const ok = wishesStore.delete(id);
    if (!ok) return res.status(404).json({ ok: false, error: 'Not found' });
    // return remaining count
    try {
      const remaining = await (wishesStore.count ? wishesStore.count() : Promise.resolve(wishesStore.all().length));
      return res.json({ ok: true, remaining });
    } catch (e) {
      return res.json({ ok: true });
    }
  } catch (e) {
    console.error('[server] delete failed', e);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Count endpoint for dev
app.get('/api/wishes/count', async (_req, res) => {
  try {
    const count = await (wishesStore.count ? wishesStore.count() : Promise.resolve(wishesStore.all().length));
    return res.json({ count });
  } catch (e) {
    console.error('[server] count failed', e);
    return res.status(500).json({ count: 0 });
  }
});

// In production, serve the React build as static files from the same server
// This lets us deploy a single service (API + frontend) to hosts like Render/Railway.
if (process.env.NODE_ENV === 'production' || process.env.SERVE_STATIC === '1') {
  const clientBuild = path.resolve(__dirname, '../build');
  try {
    app.use(express.static(clientBuild));
    // Fallback to index.html for client-side routing, but avoid intercepting API routes
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(clientBuild, 'index.html'));
    });
  } catch (e) {
    console.warn('[server] static serving not enabled:', e?.message);
  }
}

app.listen(PORT, () => {
  console.log(`[wishes-api] listening on http://localhost:${PORT}`);
});
