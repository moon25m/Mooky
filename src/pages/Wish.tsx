import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import toast, { Toaster } from 'react-hot-toast';
import { avatarUrl, linkifyText, MAX_LEN, sanitizeMessage, timeago, BAD_WORDS } from '../lib/wish-utils';
import '../styles/wishes-pro.css';

export type WishItem = { id: string; name: string; message: string; createdAt: number };
type WishWithFlash = WishItem & { __flash?: boolean };

export default function Wish() {
  const [wishes, setWishes] = useState<WishWithFlash[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const knownIds = useRef<Set<string>>(new Set());
  const remaining = MAX_LEN - message.length;
  const PINNED: WishItem = {
    id: 'pinned-drakon',
    name: 'Drakon',
    message: 'Happy Birthday, Mooky❤️',
    createdAt: Date.now()
  };

  const hasBadWord = (s: string) => {
    try { return BAD_WORDS.some(w => new RegExp(`\\b${w}\\b`, 'i').test(s)); } catch { return false; }
  };

  // Prime from cache fast
  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('mooky:wishes') || '[]') as WishItem[];
      if (cached?.length) {
        cached.sort((a,b)=>b.createdAt - a.createdAt);
        knownIds.current = new Set(cached.map(w=>w.id));
        setWishes(cached);
      }
    } catch {}
  }, []);

  // Normalize server wish objects (supports snake_case created_at or camelCase createdAt)
  function normalizeWish(w: any): WishItem {
    const created = (w && (w.createdAt ?? w.created_at)) as any;
    let ts: number;
    if (typeof created === 'number') ts = created;
    else if (typeof created === 'string') ts = new Date(created).getTime();
    else ts = Date.now();
    return {
      id: String(w.id),
      name: String(w.name || ''),
      message: String(w.message || ''),
      createdAt: ts
    };
  }

  function normalizeList(arr: any[]): WishItem[] {
    return (Array.isArray(arr) ? arr : []).map(normalizeWish);
  }

  // Initial snapshot via REST (authoritative) with robust fallback
  useEffect(() => {
    (async () => {
      let list: WishItem[] = [];
      let usedSeed = false;
      try {
        const res = await fetch('/api/wishes', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          list = normalizeList(data?.wishes).filter((w: WishItem) => !hasBadWord(w.message));
        }
      } catch {
        // ignore and try fallback
      }

  // Fallback: if API is empty or failed, load seed file from public assets
      if (!list.length) {
        try {
          const sres = await fetch('/assets/wishes.seed.json', { cache: 'no-store' });
          if (sres.ok) {
            const seeds = await sres.json().catch(() => []);
            const seeded = normalizeList(seeds).filter((w: WishItem) => !hasBadWord(w.message));
            if (seeded.length) { list = seeded; usedSeed = true; }
          }
        } catch {
          // still nothing; leave list empty
        }
      }

      // If we had to use seeds but there's cached wishes (e.g., recent sends), merge and prefer cached
      try {
        if (usedSeed) {
          const cached = JSON.parse(localStorage.getItem('mooky:wishes') || '[]') as WishItem[];
          if (Array.isArray(cached) && cached.length) {
            const map = new Map<string, WishItem>();
            for (const w of list) map.set(w.id, w);
            for (const w of cached) map.set(w.id, w); // cached wins
            list = Array.from(map.values());
          }
        }
      } catch {}

      list.sort((a,b)=>b.createdAt - a.createdAt);
      knownIds.current = new Set(list.map(w=>w.id));
      setWishes(list);
      setTotalCount(list.length);
      localStorage.setItem('mooky:wishes', JSON.stringify(list));
      setLoading(false);
    })();
  }, []);

  // SSE live updates + highlight
  useEffect(() => {
    const es = new EventSource('/api/wishes/stream');
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'snapshot') {
          const list: WishItem[] = normalizeList(data?.wishes).filter((w: WishItem) => !hasBadWord(w.message));
          // If the DB snapshot is empty, keep whatever we already have (e.g., static fallback)
          if (list.length) {
            list.sort((a,b)=>b.createdAt - a.createdAt);
            knownIds.current = new Set(list.map(w=>w.id));
            setWishes(list);
            setTotalCount(typeof data.count === 'number' ? data.count : list.length);
            localStorage.setItem('mooky:wishes', JSON.stringify(list));
          } else if (typeof data.count === 'number') {
            setTotalCount(data.count);
          }
        }
        if (data.type === 'wish') {
          const w: WishItem = normalizeWish(data.wish);
          if (hasBadWord(w.message)) return; // drop inappropriate wishes client-side as a safeguard
          if (knownIds.current.has(w.id)) return; // dedupe
          knownIds.current.add(w.id);
          setWishes(prev => {
            const next = [{ ...w, __flash: true }, ...prev].sort((a,b)=>b.createdAt - a.createdAt);
            localStorage.setItem('mooky:wishes', JSON.stringify(next));
            return next;
          });
          setTotalCount(c => c + 1);
          setTimeout(() => {
            setWishes(prev => prev.map(x => ({ ...x, __flash: false })) as WishWithFlash[]);
          }, 1200);
        }
        if (data.type === 'stats' && typeof data.count === 'number') {
          setTotalCount(data.count);
        }
      } catch { /* ignore */ }
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
  const clean = sanitizeMessage(message);
  if (!clean) return toast.error('Write something sweet ✨');
  if (hasBadWord(clean)) return toast.error('Inappropriate language is not allowed.');
    setSending(true);
    try {
      const res = await fetch('/api/wish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), message: clean })
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.error || 'Request failed');
      }
      // Optimistic update so the new wish appears instantly; SSE will reconcile
      const body = await res.json().catch(() => ({}));
      const newId = body?.id || `tmp-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;
      const optimistic: WishItem = { id: String(newId), name: name.trim() || 'Anonymous', message: clean, createdAt: Date.now() };
      knownIds.current.add(optimistic.id);
      setWishes(prev => {
        const next = [{ ...optimistic, __flash: true }, ...prev].sort((a,b)=>b.createdAt - a.createdAt);
        localStorage.setItem('mooky:wishes', JSON.stringify(next));
        return next;
      });
      setTotalCount(c => c + 1);
      setTimeout(() => setWishes(prev => prev.map(x => ({ ...x, __flash: false })) as WishWithFlash[]), 1200);
      setMessage('');
      toast.success('Wish sent!');
      confetti({ particleCount: 90, spread: 65, origin: { y: 0.25 } });
    } catch (err) {
  toast.error((err as Error)?.message || 'Could not send your wish. Try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="wish-shell">
      <Toaster position="top-center" />

      {/* HERO */}
      <section className="wish-hero">
        <div className="wish-hero-inner">
          <h1>Birthday Wishes <span className="live-dot" aria-label="live" title="live"/></h1>
          <p>
            Leave a message — it appears live on this wall.
            <span className="count">{totalCount + 1} wishes</span>
            <span className="live-pill"><span className="live-dot" aria-label="live" title="Live"/> Live</span>
          </p>
          <div className="surprise-cta">
            <a href="/surprise" className="btn-primary surprise-link">Surprise ✨</a>
          </div>
        </div>
      </section>

      {/* COMPOSER */}
      <section className="composer">
        <form onSubmit={submit} className="composer-form" aria-label="Send a birthday wish">
          <div className="row">
            <input
              className="name"
              placeholder="Your name (optional)"
              value={name}
              onChange={e=>setName(e.target.value)}
              maxLength={80}
              aria-label="Your name"
            />
          </div>
          <div className="row">
            <textarea
              className="msg"
              placeholder="Write your wish…"
              value={message}
              onChange={e=>setMessage(e.target.value)}
              maxLength={MAX_LEN}
              rows={3}
              aria-label="Wish message"
            />
          </div>
          <div className="bar">
            <span className={`counter ${remaining < 0 ? 'bad' : ''}`}>{remaining}</span>
            <button className="btn-primary" disabled={sending || message.trim().length === 0}>
              {sending ? 'Sending…' : 'Send Wish'}
            </button>
          </div>
        </form>
      </section>

      {/* FEED */}
      <section className="feed">
        {loading && <div className="skeleton">Loading wishes…</div>}
        {!loading && wishes.length === 0 && (
          <div className="empty">No wishes yet — be the first ✨</div>
        )}
        {/* Pinned */}
        <article key={PINNED.id} className="wish-card pinned">
          <img className="avatar" src={avatarUrl(PINNED.name)} alt="" />
          <div className="content">
            <header className="meta">
              <b className="who">{PINNED.name}</b>
              <time title={new Date(PINNED.createdAt).toLocaleString()}>{timeago(PINNED.createdAt)}</time>
              <span className="pill">Pinned</span>
            </header>
            <p className="text" dangerouslySetInnerHTML={{ __html: linkifyText(PINNED.message) }} />
          </div>
        </article>

        {wishes.map(w => (
          <article key={w.id} className={`wish-card ${w.__flash ? 'flash' : ''}`}>
            <img className="avatar" src={avatarUrl(w.name)} alt="" />
            <div className="content">
              <header className="meta">
                <b className="who">{w.name || 'Anonymous'}</b>
                <time title={new Date(w.createdAt).toLocaleString()}>{timeago(w.createdAt)}</time>
              </header>
              <p className="text" dangerouslySetInnerHTML={{ __html: linkifyText(w.message) }} />
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
