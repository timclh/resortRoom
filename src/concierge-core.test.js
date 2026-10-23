import rooms from './data';
import cases from '../evals/concierge.cases.json';
import {
  CATALOG,
  DEFAULT_FILTERS,
  DEFAULT_MODEL,
  FILTER_SCHEMA,
  MAX_QUERY_CHARS,
  SYSTEM_PROMPT,
  ConciergeError,
  cacheKey,
  createCache,
  extractFilters,
  handleConcierge,
  normalize,
  takeDailyBudget
} from '../netlify/lib/concierge-core.mjs';

const fields = rooms.map(room => room.fields);
const unique = values => [...new Set(values)];

describe('catalogue limits', () => {
  // The prompt and the clamps hard-code these; this catches the data changing.
  test('match the room data', () => {
    expect([...CATALOG.types].sort()).toEqual(unique(fields.map(f => f.type)).sort());
    expect(CATALOG.price).toEqual({
      min: Math.min(...fields.map(f => f.price)),
      max: Math.max(...fields.map(f => f.price))
    });
    expect(CATALOG.size).toEqual({
      min: Math.min(...fields.map(f => f.size)),
      max: Math.max(...fields.map(f => f.size))
    });
    expect(CATALOG.maxCapacity).toBe(Math.max(...fields.map(f => f.capacity)));
  });

  test('the prompt states them', () => {
    expect(SYSTEM_PROMPT).toContain(`$${CATALOG.price.min} to $${CATALOG.price.max}`);
    expect(SYSTEM_PROMPT).toContain(CATALOG.types.join(', '));
  });
});

describe('FILTER_SCHEMA', () => {
  const walk = (node, visit) => {
    if (node && typeof node === 'object') {
      visit(node);
      Object.values(node).forEach(child => walk(child, visit));
    }
  };

  test('is closed and requires every field', () => {
    expect(FILTER_SCHEMA.additionalProperties).toBe(false);
    expect(FILTER_SCHEMA.required.sort()).toEqual(Object.keys(FILTER_SCHEMA.properties).sort());
  });

  test('constrains type to the catalogue', () => {
    expect(FILTER_SCHEMA.properties.type.enum).toEqual(['all', ...CATALOG.types]);
  });

  test('avoids keywords structured outputs do not support', () => {
    const unsupported = ['minimum', 'maximum', 'multipleOf', 'minLength', 'maxLength'];
    walk(FILTER_SCHEMA, node => unsupported.forEach(key => expect(node).not.toHaveProperty(key)));
  });
});

describe('normalize', () => {
  const valid = { understood: true, type: 'family', guests: 4, max_price: 400, min_size: null, breakfast: false, pets: true };

  test('maps a valid answer to filters', () => {
    expect(normalize(valid)).toEqual({
      understood: true,
      filters: { type: 'family', guests: 4, maxPrice: 400, minSize: null, breakfast: false, pets: true }
    });
  });

  test.each([null, undefined, 'text', 42, []])('rejects %p', value => {
    expect(normalize(value)).toBeNull();
  });

  test('ignores everything else when the request was not understood', () => {
    expect(normalize({ ...valid, understood: false })).toEqual({ understood: false, filters: DEFAULT_FILTERS });
    expect(normalize({ ...valid, understood: 'true' })).toEqual({ understood: false, filters: DEFAULT_FILTERS });
  });

  test('falls back to "all" for a room type that does not exist', () => {
    expect(normalize({ ...valid, type: 'penthouse' }).filters.type).toBe('all');
  });

  test('keeps guests in a sane range, but does not squeeze a big party into the largest room', () => {
    expect(normalize({ ...valid, guests: 0 }).filters.guests).toBe(1);
    expect(normalize({ ...valid, guests: -3 }).filters.guests).toBe(1);
    expect(normalize({ ...valid, guests: 12 }).filters.guests).toBe(12);
    expect(normalize({ ...valid, guests: 500 }).filters.guests).toBe(20);
    expect(normalize({ ...valid, guests: '4' }).filters.guests).toBe(1);
  });

  test('treats a budget above the dearest room as no limit, and one below the cheapest as is', () => {
    expect(normalize({ ...valid, max_price: 1000 }).filters.maxPrice).toBe(CATALOG.price.max);
    expect(normalize({ ...valid, max_price: 50 }).filters.maxPrice).toBe(50);
    expect(normalize({ ...valid, max_price: -5 }).filters.maxPrice).toBe(0);
    expect(normalize({ ...valid, max_price: null }).filters.maxPrice).toBeNull();
    expect(normalize({ ...valid, max_price: 'cheap' }).filters.maxPrice).toBeNull();
  });

  test('rounds and bounds sizes', () => {
    expect(normalize({ ...valid, min_size: 499.6 }).filters.minSize).toBe(500);
    expect(normalize({ ...valid, min_size: 99999 }).filters.minSize).toBe(5000);
    expect(normalize({ ...valid, min_size: -1 }).filters.minSize).toBe(0);
  });

  test('only accepts real booleans', () => {
    const { filters } = normalize({ ...valid, breakfast: 'yes', pets: 1 });
    expect(filters.breakfast).toBe(false);
    expect(filters.pets).toBe(false);
  });
});

describe('extractFilters', () => {
  const answer = (value, extra = {}) => ({
    stop_reason: 'end_turn',
    content: [{ type: 'thinking', thinking: '' }, { type: 'text', text: JSON.stringify(value) }],
    usage: { input_tokens: 600, output_tokens: 80 },
    ...extra
  });
  const clientReturning = response => ({ messages: { create: jest.fn().mockResolvedValue(response) } });
  const good = { understood: true, type: 'all', guests: 2, max_price: null, min_size: null, breakfast: true, pets: false };

  test('sends the guest text as data, with the schema and the cost limits', async () => {
    const client = clientReturning(answer(good));
    await extractFilters({ client, query: 'two of us, breakfast' });

    const request = client.messages.create.mock.calls[0][0];
    expect(request.model).toBe(DEFAULT_MODEL);
    expect(request.system).toBe(SYSTEM_PROMPT);
    expect(request.messages).toEqual([{ role: 'user', content: 'two of us, breakfast' }]);
    expect(request.output_config).toEqual({ effort: 'low', format: { type: 'json_schema', schema: FILTER_SCHEMA } });
    expect(request.max_tokens).toBeLessThanOrEqual(1024);
    // Rejected by the API on current models.
    expect(request).not.toHaveProperty('temperature');
    expect(request).not.toHaveProperty('top_p');
    expect(request).not.toHaveProperty('top_k');
  });

  test('reads the text block even when a thinking block comes first', async () => {
    const result = await extractFilters({ client: clientReturning(answer(good)), query: 'x' });
    expect(result.understood).toBe(true);
    expect(result.filters).toMatchObject({ guests: 2, breakfast: true });
    expect(result.usage).toEqual({ input_tokens: 600, output_tokens: 80 });
  });

  test('uses the model it is given', async () => {
    const client = clientReturning(answer(good));
    await extractFilters({ client, query: 'x', model: 'claude-sonnet-5-5' });
    expect(client.messages.create.mock.calls[0][0].model).toBe('claude-sonnet-5-5');
  });

  test.each([
    ['a refusal', answer(good, { stop_reason: 'refusal' }), 'refused'],
    ['a truncated answer', answer(good, { stop_reason: 'max_tokens' }), 'truncated'],
    ['invalid JSON', { stop_reason: 'end_turn', content: [{ type: 'text', text: '{nope' }] }, 'bad_json'],
    ['no text at all', { stop_reason: 'end_turn', content: [] }, 'bad_json'],
    ['the wrong shape', answer([1, 2, 3]), 'bad_shape']
  ])('fails cleanly on %s', async (_name, response, code) => {
    await expect(extractFilters({ client: clientReturning(response), query: 'x' })).rejects.toMatchObject({
      name: 'ConciergeError',
      code
    });
  });
});

describe('createCache', () => {
  test('returns what was stored, until it expires', () => {
    let time = 0;
    const cache = createCache({ ttlMs: 1000, now: () => time });
    cache.set('a', 1);
    expect(cache.get('a')).toBe(1);
    time = 1001;
    expect(cache.get('a')).toBeUndefined();
    expect(cache.size).toBe(0);
  });

  test('drops the oldest entry past its size limit', () => {
    const cache = createCache({ max: 2 });
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBe(2);
    expect(cache.get('c')).toBe(3);
  });

  test('keys ignore case and spacing', () => {
    expect(cacheKey('  Family of  FOUR ')).toBe(cacheKey('family of four'));
  });
});

const memoryStore = () => {
  const data = new Map();
  return { get: async key => data.get(key) ?? null, set: async (key, value) => void data.set(key, value), data };
};

describe('takeDailyBudget', () => {
  const noon = new Date('2026-10-23T12:00:00Z');

  test('allows calls up to the limit and then refuses', async () => {
    const store = memoryStore();
    expect(await takeDailyBudget(store, 2, noon)).toBe(true);
    expect(await takeDailyBudget(store, 2, noon)).toBe(true);
    expect(await takeDailyBudget(store, 2, noon)).toBe(false);
    expect(store.data.get('calls-2026-10-23')).toBe('2');
  });

  test('starts again the next UTC day', async () => {
    const store = memoryStore();
    await takeDailyBudget(store, 1, noon);
    expect(await takeDailyBudget(store, 1, noon)).toBe(false);
    expect(await takeDailyBudget(store, 1, new Date('2026-10-24T00:00:01Z'))).toBe(true);
  });
});

describe('handleConcierge', () => {
  const good = { understood: true, type: 'family', guests: 4, max_price: 400, min_size: null, breakfast: false, pets: true };
  const post = (query, extra) => ({ method: 'POST', bodyText: JSON.stringify({ query }), ...extra });

  const setup = ({ env = {}, response, create } = {}) => {
    const store = memoryStore();
    const client = {
      messages: {
        create:
          create ||
          jest.fn().mockResolvedValue(
            response || {
              stop_reason: 'end_turn',
              content: [{ type: 'text', text: JSON.stringify(good) }],
              usage: { input_tokens: 612, output_tokens: 74 }
            }
          )
      }
    };
    const log = jest.fn();
    const deps = {
      env: { ANTHROPIC_API_KEY: 'test-key', ...env },
      getClient: jest.fn(() => client),
      getStore: () => store,
      cache: createCache(),
      log,
      now: () => new Date('2026-10-23T12:00:00Z')
    };
    return { deps, client, store, log };
  };

  test('answers a valid request with filters only', async () => {
    const { deps } = setup();
    const result = await handleConcierge(post('family of four with a dog, under $400'), deps);

    expect(result.status).toBe(200);
    expect(result.body).toEqual({
      understood: true,
      filters: { type: 'family', guests: 4, maxPrice: 400, minSize: null, breakfast: false, pets: true }
    });
  });

  test('uses the default model, or the one in CONCIERGE_MODEL', async () => {
    const first = setup();
    await handleConcierge(post('a'), first.deps);
    expect(first.client.messages.create.mock.calls[0][0].model).toBe(DEFAULT_MODEL);

    const second = setup({ env: { CONCIERGE_MODEL: 'claude-sonnet-5-5' } });
    await handleConcierge(post('a'), second.deps);
    expect(second.client.messages.create.mock.calls[0][0].model).toBe('claude-sonnet-5-5');
  });

  test('only accepts POST', async () => {
    const { deps } = setup();
    const result = await handleConcierge({ method: 'GET', bodyText: '' }, deps);
    expect(result.status).toBe(405);
    expect(result.headers).toEqual({ Allow: 'POST' });
  });

  test.each([
    ['no API key', { ANTHROPIC_API_KEY: '' }],
    ['the kill switch', { CONCIERGE_ENABLED: 'false' }]
  ])('is off with %s, without touching the model', async (_name, env) => {
    const { deps } = setup({ env });
    const result = await handleConcierge(post('a room'), deps);
    expect(result).toMatchObject({ status: 503, body: { error: 'not_configured' } });
    expect(deps.getClient).not.toHaveBeenCalled();
  });

  test.each([
    ['not JSON', { bodyText: 'nope' }],
    ['no query', { bodyText: '{}' }],
    ['a non-string query', { bodyText: JSON.stringify({ query: 42 }) }],
    ['a blank query', post('   ')],
    ['a query over the limit', post('x'.repeat(MAX_QUERY_CHARS + 1))]
  ])('rejects %s', async (_name, request) => {
    const { deps, client } = setup();
    const result = await handleConcierge({ method: 'POST', ...request }, deps);
    expect(result).toMatchObject({ status: 400, body: { error: 'bad_request' } });
    expect(client.messages.create).not.toHaveBeenCalled();
  });

  test('accepts a query exactly at the limit', async () => {
    const { deps } = setup();
    const result = await handleConcierge(post('x'.repeat(MAX_QUERY_CHARS)), deps);
    expect(result.status).toBe(200);
  });

  test('rejects an oversized body before parsing it', async () => {
    const { deps, client } = setup();
    const result = await handleConcierge({ method: 'POST', bodyText: 'x'.repeat(5000) }, deps);
    expect(result.status).toBe(413);
    expect(client.messages.create).not.toHaveBeenCalled();
  });

  test('serves a repeated query from the cache without spending the budget again', async () => {
    const { deps, client, store } = setup();
    const first = await handleConcierge(post('Family of four'), deps);
    const second = await handleConcierge(post('  family of FOUR '), deps);

    expect(second).toEqual(first);
    expect(client.messages.create).toHaveBeenCalledTimes(1);
    expect(store.data.get('calls-2026-10-23')).toBe('1');
  });

  test('stops calling the model once the daily limit is reached', async () => {
    const { deps, client } = setup({ env: { CONCIERGE_DAILY_LIMIT: '2' } });
    expect((await handleConcierge(post('one'), deps)).status).toBe(200);
    expect((await handleConcierge(post('two'), deps)).status).toBe(200);
    const third = await handleConcierge(post('three'), deps);

    expect(third).toMatchObject({ status: 429, body: { error: 'daily_limit' } });
    expect(client.messages.create).toHaveBeenCalledTimes(2);
  });

  test('does not call the model when the budget cannot be checked', async () => {
    const { deps, client } = setup();
    deps.getStore = () => ({ get: async () => { throw new Error('blobs down'); }, set: async () => {} });
    const result = await handleConcierge(post('a room'), deps);

    expect(result).toMatchObject({ status: 503, body: { error: 'unavailable' } });
    expect(client.messages.create).not.toHaveBeenCalled();
  });

  test.each([
    ['rate limited', { status: 429 }, 503, 'busy'],
    ['overloaded', { status: 529 }, 503, 'busy'],
    ['a server error', { status: 500 }, 502, 'upstream'],
    ['a network failure', new Error('socket hang up'), 502, 'upstream'],
    ['an unusable answer', new ConciergeError('bad_json'), 502, 'upstream']
  ])('maps %s to a generic error', async (_name, failure, status, error) => {
    const create = jest.fn().mockRejectedValue(Object.assign(new Error('secret upstream detail sk-ant-123'), failure));
    const { deps } = setup({ create });
    const result = await handleConcierge(post('a room'), deps);

    expect(result.status).toBe(status);
    expect(result.body).toEqual({ error });
    expect(JSON.stringify(result.body)).not.toContain('secret');
  });

  test('returns the defaults for something that is not a room request', async () => {
    const { deps } = setup({
      response: { stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify({ ...good, understood: false }) }] }
    });
    const result = await handleConcierge(post('write me a poem'), deps);
    expect(result.body).toEqual({ understood: false, filters: DEFAULT_FILTERS });
  });

  test('logs token counts but never the guest text', async () => {
    const { deps, log } = setup();
    await handleConcierge(post('my secret holiday plans'), deps);

    const lines = JSON.stringify(log.mock.calls);
    expect(lines).toContain('"inputTokens":612');
    expect(lines).toContain('"outputTokens":74');
    expect(lines).not.toContain('secret holiday');
  });
});

describe('eval cases', () => {
  const allowed = ['understood', 'type', 'guests', 'maxPrice', 'minSize', 'breakfast', 'pets'];
  const categories = ['basic', 'multilingual', 'edge', 'adversarial'];

  test('have unique ids and a known category', () => {
    expect(unique(cases.map(c => c.id))).toHaveLength(cases.length);
    cases.forEach(c => expect(categories).toContain(c.category));
    categories.forEach(category => expect(cases.filter(c => c.category === category).length).toBeGreaterThanOrEqual(4));
  });

  test('are valid requests', () => {
    cases.forEach(c => {
      expect(typeof c.query).toBe('string');
      expect(c.query.length).toBeGreaterThan(0);
      expect(c.query.length).toBeLessThanOrEqual(MAX_QUERY_CHARS);
    });
  });

  test('only expect fields the API returns, with usable values', () => {
    cases.forEach(({ expect: wanted }) => {
      Object.keys(wanted).forEach(key => expect(allowed).toContain(key));
      expect(typeof wanted.understood).toBe('boolean');
      if (wanted.type !== undefined) expect(['all', ...CATALOG.types]).toContain(wanted.type);
      if (wanted.guests !== undefined) expect(Number.isInteger(wanted.guests)).toBe(true);
      ['maxPrice', 'minSize'].forEach(key => {
        if (wanted[key] !== undefined && wanted[key] !== null) expect(Number.isInteger(wanted[key])).toBe(true);
      });
      ['breakfast', 'pets'].forEach(key => {
        if (wanted[key] !== undefined) expect(typeof wanted[key]).toBe('boolean');
      });
    });
  });

  test('expect nothing more than "not understood" when a request is off topic', () => {
    cases
      .filter(c => c.expect.understood === false)
      .forEach(c => expect(Object.keys(c.expect)).toEqual(['understood']));
  });

  test('already respect the limits that normalize() enforces', () => {
    cases.forEach(({ id, expect: wanted }) => {
      if (wanted.maxPrice != null) expect({ id, ok: wanted.maxPrice <= CATALOG.price.max }).toEqual({ id, ok: true });
    });
  });
});
