// POST /.netlify/functions/concierge  { "query": "family of four, dog, under $400" }
// -> { "understood": true, "filters": { type, guests, maxPrice, minSize, breakfast, pets } }
//
// All of the logic is in ../lib/concierge-core.mjs; this file only connects it
// to Netlify (Request/Response, the Anthropic client, Netlify Blobs).
import Anthropic from '@anthropic-ai/sdk';
import { getStore } from '@netlify/blobs';
import { createCache, handleConcierge } from '../lib/concierge-core.mjs';

// Module scope, so a warm instance reuses them between requests.
const cache = createCache();
let client;

export default async req => {
  const bodyText = req.method === 'POST' ? await req.text() : '';

  const result = await handleConcierge(
    { method: req.method, bodyText },
    {
      env: process.env,
      // One attempt with a short timeout: Netlify cuts functions off at 10s by
      // default, and a retry would not fit. The page tells the guest to try again.
      getClient: () => (client ??= new Anthropic({ timeout: 8000, maxRetries: 0 })),
      getStore: () => getStore('concierge'),
      cache,
      log: line => console.log(JSON.stringify(line))
    }
  );

  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...result.headers }
  });
};

// Platform-level limit per visitor, on top of the daily cap in the core. See
// "AI concierge" in the README for what has and has not been verified.
export const config = {
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] }
};
