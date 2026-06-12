type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();
const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX = 5;
let lastPurge = 0;

function purge(now: number) {
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) store.delete(key);
  }
}

export function checkRateLimit(
  key: string,
  max = DEFAULT_MAX,
  windowMs = DEFAULT_WINDOW_MS
): { allowed: boolean; retryAfter: number } {
  const now = Date.now();

  if (now - lastPurge > DEFAULT_WINDOW_MS) {
    purge(now);
    lastPurge = now;
  }

  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  if (entry.count >= max) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { allowed: true, retryAfter: 0 };
}
