/**
 * Shared Resilient HTTP Helper with Polite Rate Limiting & Retry
 * Inspired by OpenScience's polite connector architecture.
 */

interface HostRateLimiter {
  lastRequestTime: number;
  minIntervalMs: number;
}

const hostLimiters: Map<string, HostRateLimiter> = new Map();

// Configure host-specific polite rate limits
const HOST_POLITENESS: Record<string, number> = {
  'eutils.ncbi.nlm.nih.gov': 350, // NCBI max 3 req/s without key
  'pubchem.ncbi.nlm.nih.gov': 350,
  'rest.uniprot.org': 200,
  'www.ebi.ac.uk': 200,
  'search.rcsb.org': 200,
  'data.rcsb.org': 200,
  'clinicaltrials.gov': 250,
  'api.fda.gov': 250,
  'rxnav.nlm.nih.gov': 200,
  'dailymed.nlm.nih.gov': 200,
  'connect.medlineplus.gov': 200,
};

async function throttleHost(hostname: string): Promise<void> {
  const minInterval = HOST_POLITENESS[hostname] || 50;
  let limiter = hostLimiters.get(hostname);
  if (!limiter) {
    limiter = { lastRequestTime: 0, minIntervalMs: minInterval };
    hostLimiters.set(hostname, limiter);
  }

  const now = Date.now();
  const elapsed = now - limiter.lastRequestTime;
  if (elapsed < limiter.minIntervalMs) {
    const delay = limiter.minIntervalMs - elapsed;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  limiter.lastRequestTime = Date.now();
}

export interface ResilientHttpOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
}

export async function resilientFetch(url: string, options: ResilientHttpOptions = {}): Promise<Response> {
  const timeoutMs = options.timeoutMs || 15000;
  const maxRetries = options.retries ?? 2;
  const parsedUrl = new URL(url);

  let attempt = 0;
  while (attempt <= maxRetries) {
    attempt++;
    await throttleHost(parsedUrl.hostname);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'JunScience-Agent/1.0 (Scientific Research Assistant)',
          'Accept': 'application/json, text/plain, */*',
          ...(options.headers || {}),
        },
        signal: options.signal || controller.signal,
      });

      clearTimeout(timer);

      // Retry on 429 (Too Many Requests) or 503 (Service Unavailable)
      if ((res.status === 429 || res.status === 503) && attempt <= maxRetries) {
        const backoff = attempt * 1000;
        await new Promise((resolve) => setTimeout(resolve, backoff));
        continue;
      }

      return res;
    } catch (err: any) {
      clearTimeout(timer);
      if (attempt > maxRetries) {
        throw err;
      }
      const backoff = attempt * 800;
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }

  throw new Error(`Request to ${url} failed after ${maxRetries} retries`);
}

export async function getJson<T = any>(url: string, options: ResilientHttpOptions = {}): Promise<T> {
  const res = await resilientFetch(url, options);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} from ${url}`);
  }
  return (await res.json()) as T;
}

export async function getText(url: string, options: ResilientHttpOptions = {}): Promise<string> {
  const res = await resilientFetch(url, options);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} from ${url}`);
  }
  return await res.text();
}
