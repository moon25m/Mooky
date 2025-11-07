const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

/** @typedef {{ id:string, name:string, message:string, createdAt:number }} Wish */

const bus = new EventEmitter();

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'wishes.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

// Optional limits/backups via env (loaded in index.js)
const CAP = Math.max(0, parseInt(process.env.WISHES_MAX || '0', 10) || 0); // 0 = unlimited
const MAX_MB = Math.max(0, parseFloat(process.env.WISHES_MAX_MB || '1.5') || 0);
const MAX_BYTES = Math.floor(MAX_MB * 1024 * 1024);
const KEEP_BACKUPS = Math.max(0, parseInt(process.env.WISHES_BACKUP_KEEP || '5', 10) || 0);

/** @type {Wish[]} */
let wishes = [];

function ensureDataFile(){
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
  if (!fs.existsSync(DATA_FILE)) {
    try { fs.writeFileSync(DATA_FILE, '[]', 'utf8'); } catch {}
  }
  try { if (KEEP_BACKUPS > 0) fs.mkdirSync(BACKUP_DIR, { recursive: true }); } catch {}
}

function load(){
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      wishes = arr.filter(x => x && typeof x.id === 'string');
    }
  } catch {
    wishes = [];
  }
}

function persist(){
  try {
    // Optional cap of number of wishes (keep most recent)
    if (CAP > 0 && wishes.length > CAP) {
      wishes = wishes
        .slice()
        .sort((a,b)=> b.createdAt - a.createdAt)
        .slice(0, CAP)
        .reverse() // keep older-first in file for append-like readability
        .reverse(); // neutralize to avoid eslint nit; intent is to keep copy stable
    }

    // Rotate backup if file grows beyond threshold
    if (KEEP_BACKUPS > 0 && MAX_BYTES > 0 && fs.existsSync(DATA_FILE)) {
      try {
        const { size } = fs.statSync(DATA_FILE);
        if (size > MAX_BYTES) {
          const stamp = new Date().toISOString().replace(/[:.]/g, '-');
          const backupPath = path.join(BACKUP_DIR, `wishes-${stamp}.json`);
          fs.copyFileSync(DATA_FILE, backupPath);
          // Trim old backups beyond KEEP_BACKUPS
          const files = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.startsWith('wishes-') && f.endsWith('.json'))
            .map(f => ({ f, t: fs.statSync(path.join(BACKUP_DIR, f)).mtimeMs }))
            .sort((a,b)=> b.t - a.t);
          files.slice(KEEP_BACKUPS).forEach(({ f }) => {
            try { fs.unlinkSync(path.join(BACKUP_DIR, f)); } catch {}
          });
        }
      } catch (e) {
        console.error('[wishesStore] backup rotation failed', e);
      }
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(wishes, null, 2), 'utf8');
  } catch (e) {
    console.error('[wishesStore] persist failed', e);
  }
}

load();

exports.wishesStore = {
  all(){ return wishes.slice().sort((a,b)=> b.createdAt - a.createdAt); },
  push(w){ wishes.push(w); persist(); bus.emit('wish', w); },
  // Delete a wish by id. Returns true if deleted.
  delete(id){
    // Accept exact id or an 8-char hex short id (prefix).
    try {
      const sid = String(id || '');
      // exact match first
      let idx = wishes.findIndex(x => String(x.id) === sid);
      // if not found and sid looks like an 8-hex, match by prefix
      if (idx === -1 && /^[0-9a-f]{8}$/i.test(sid)) {
        idx = wishes.findIndex(x => String(x.id).slice(0,8).toLowerCase() === sid.toLowerCase());
      }
      if (idx === -1) return false;
      const [removed] = wishes.splice(idx, 1);
      try { persist(); } catch (e) { console.error('[wishesStore] persist on delete failed', e); }
      // emit a delete event in case listeners want to react
      try { bus.emit('wish:deleted', removed); } catch {}
      return true;
    } catch (e) {
      console.error('[wishesStore] delete error', e);
      return false;
    }
  },
  // Async count of wishes (reads file for authoritative value)
  async count() {
    try {
      ensureDataFile();
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const arr = JSON.parse(raw || '[]');
      return Array.isArray(arr) ? arr.filter(x => x && typeof x.id === 'string').length : 0;
    } catch (e) {
      try { return wishes.length; } catch { return 0; }
    }
  },
  onWish(fn){ bus.on('wish', fn); },
  offWish(fn){ bus.off('wish', fn); },
};
