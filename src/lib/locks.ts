import { ProfileType } from "../types";

const LOCAL_KEY = 'mooky:profile:unlocked';
const SESSION_KEY = 'mooky:profile:unlocked:session';

// Backward-compatible storage: either a boolean or an object with value and optional expiry
type StoredEntry = boolean | { v: boolean; exp?: number };
type UnlockMap = Partial<Record<ProfileType, StoredEntry>>;

function readMap(storage: Storage, key: string): UnlockMap {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeMap(storage: Storage, key: string, map: UnlockMap) {
  try {
    storage.setItem(key, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function normalize(entry: StoredEntry | undefined): { value: boolean; expired: boolean } {
  if (entry === undefined) return { value: false, expired: false };
  if (typeof entry === 'boolean') return { value: entry, expired: false };
  const now = Date.now();
  const exp = entry.exp ?? undefined;
  const expired = !!(exp && now > exp);
  return { value: !!entry.v && !expired, expired };
}

export function isUnlocked(p: ProfileType): boolean {
  // Prefer session unlocks first
  const sMap = readMap(sessionStorage, SESSION_KEY);
  const { value: sVal, expired: sExpired } = normalize(sMap[p]);
  if (sExpired) {
    delete sMap[p];
    writeMap(sessionStorage, SESSION_KEY, sMap);
  }
  if (sVal) return true;

  // Fallback to persistent unlocks
  const lMap = readMap(localStorage, LOCAL_KEY);
  const { value: lVal, expired: lExpired } = normalize(lMap[p]);
  if (lExpired) {
    delete lMap[p];
    writeMap(localStorage, LOCAL_KEY, lMap);
  }
  return lVal;
}

export function setUnlocked(
  p: ProfileType,
  val: boolean,
  options?: { session?: boolean; ttlMs?: number }
) {
  const targetStorage = options?.session ? sessionStorage : localStorage;
  const targetKey = options?.session ? SESSION_KEY : LOCAL_KEY;
  const map = readMap(targetStorage, targetKey);

  if (!val) {
    // Clear both storages for safety
    const sMap = readMap(sessionStorage, SESSION_KEY);
    delete sMap[p];
    writeMap(sessionStorage, SESSION_KEY, sMap);
    const lMap = readMap(localStorage, LOCAL_KEY);
    delete lMap[p];
    writeMap(localStorage, LOCAL_KEY, lMap);
    return;
  }

  const exp = options?.ttlMs ? Date.now() + Math.max(0, options.ttlMs) : undefined;
  map[p] = exp ? { v: true, exp } : true;
  writeMap(targetStorage, targetKey, map);
}
