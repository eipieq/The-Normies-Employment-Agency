import type {
  AgentInfo,
  CanvasDiff,
  CanvasInfo,
  Holdings,
  Owner,
  Traits,
  Version,
} from "./types";

const BASE = "https://api.normies.art";

// next's fetch cache hints. ignored outside the next runtime (e.g. when run from a node script).
type FetchOpts = { revalidate?: number; tags?: string[] };

export class NormiesApiError extends Error {
  constructor(public status: number, public path: string) {
    super(`normies api ${status} for ${path}`);
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// retry on 5xx (transient upstream failures). 3 attempts, ~300ms / ~600ms backoff.
async function fetchWithRetry(url: string, init: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, init);
    if (res.ok || res.status < 500) return res;
    if (i < retries - 1) await sleep(300 * 2 ** i);
  }
  return fetch(url, init);
}

async function getJson<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const res = await fetchWithRetry(`${BASE}${path}`, {
    next: { revalidate: opts.revalidate ?? 300, tags: opts.tags ?? [] },
  });
  if (!res.ok) throw new NormiesApiError(res.status, path);
  return res.json() as Promise<T>;
}

async function getText(path: string, opts: FetchOpts = {}): Promise<string> {
  const res = await fetchWithRetry(`${BASE}${path}`, {
    next: { revalidate: opts.revalidate ?? 300, tags: opts.tags ?? [] },
  });
  if (!res.ok) throw new NormiesApiError(res.status, path);
  return res.text();
}

const tag = (id: number) => [`normie:${id}`];

export const normies = {
  pixels: (id: number) => getText(`/normie/${id}/pixels`, { tags: tag(id) }),

  traits: (id: number) =>
    getJson<Traits>(`/normie/${id}/traits`, { tags: tag(id) }),

  canvasInfo: (id: number) =>
    getJson<CanvasInfo>(`/normie/${id}/canvas/info`, { tags: tag(id) }),

  canvasDiff: (id: number) =>
    getJson<CanvasDiff>(`/normie/${id}/canvas/diff`, { tags: tag(id) }),

  versions: (id: number) =>
    getJson<Version[]>(`/history/normie/${id}/versions`, { tags: tag(id) }),

  // owner moves on transfer. short revalidate so the ownership gate stays honest.
  owner: (id: number) =>
    getJson<Owner>(`/normie/${id}/owner`, { tags: tag(id), revalidate: 30 }),

  // most normies are not erc-8004 registered. null on 404, propagate other errors.
  agentInfo: async (id: number): Promise<AgentInfo | null> => {
    try {
      return await getJson<AgentInfo>(`/agents/info/${id}`, { tags: tag(id) });
    } catch (e) {
      if (e instanceof NormiesApiError && e.status === 404) return null;
      throw e;
    }
  },

  holdings: (address: string) =>
    getJson<Holdings>(`/holders/${address}`, {
      tags: [`holders:${address.toLowerCase()}`],
      revalidate: 60,
    }),
};
