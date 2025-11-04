import * as linkify from 'linkifyjs';
import { format } from 'timeago.js';


export const MAX_LEN = 280;
export const BAD_WORDS = ['fuck','shit','bitch']; // extend later

export function sanitizeMessage(s: string) {
  let msg = (s || '').trim().slice(0, MAX_LEN);
  BAD_WORDS.forEach(w => {
    const re = new RegExp(`\\b${w}\\b`, 'gi');
    msg = msg.replace(re, '•••');
  });
  return msg;
}

// Minimal linkify that preserves newlines and turns URLs/hashtags/mentions into links
export function linkifyText(t: string) {
  const original = String(t || '');
  // Escape regex metachars for safe replace
  const escapeRe = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let out = original.replace(/\n/g, '<br/>');
  try {
    const matches = linkify.find(original);
    for (const m of matches) {
      const val = escapeRe(m.value);
      out = out.replace(new RegExp(val, 'g'), `<a href="${m.href}" target="_blank" rel="noopener noreferrer">${m.value}</a>`);
    }
  } catch {}
  return out;
}

export function timeago(ts: number) { return format(ts); }

export function avatarUrl(name: string) {
  const n = (name || 'Anonymous').trim() || 'Anonymous';
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(n)}&backgroundType=gradientLinear`;
}
