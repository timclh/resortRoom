import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { RoomProvider } from '../context';
import { describeFilters } from './Concierge';

const ENDPOINT = '/.netlify/functions/concierge';

const renderRooms = async () => {
  render(
    <RoomProvider>
      <MemoryRouter initialEntries={['/rooms']}>
        <App />
      </MemoryRouter>
    </RoomProvider>
  );
  await screen.findByLabelText(/describe your stay/i);
};

const filters = (over = {}) => ({
  type: 'all',
  guests: 1,
  maxPrice: null,
  minSize: null,
  breakfast: false,
  pets: false,
  ...over
});

const reply = (body, { ok = true, status = 200 } = {}) =>
  jest.fn().mockResolvedValue({ ok, status, json: async () => body });

const cards = () => screen.getAllByRole('article');
const cardNames = () => cards().map(card => within(card).getByText(/^[a-z ]+$/, { selector: '.room-info' }).textContent);

// The status region is on the page from the start (so screen readers announce
// changes to it), so wait for its text instead of reading it once.
const expectStatus = matcher =>
  waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(matcher));

const ask = text => {
  fireEvent.change(screen.getByLabelText(/describe your stay/i), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: /find rooms/i }));
};

afterEach(() => {
  delete global.fetch;
});

describe('describeFilters', () => {
  test('lists only what narrows the search', () => {
    expect(describeFilters(filters())).toBe('all rooms');
    expect(
      describeFilters(filters({ type: 'family', guests: 4, maxPrice: 400, minSize: 500, breakfast: true, pets: true }))
    ).toBe('family rooms · sleeps 4+ · up to $400 a night · at least 500 sq ft · breakfast included · pets allowed');
  });
});

describe('ask the concierge', () => {
  test('sends the request and narrows the room list to the answer', async () => {
    global.fetch = reply({ understood: true, filters: filters({ guests: 4, maxPrice: 400, pets: true }) });
    await renderRooms();
    expect(cards()).toHaveLength(13);

    ask('Family of four with a dog, under $400');

    await waitFor(() => expect(cards()).toHaveLength(1));
    expect(cardNames()).toEqual(['family standard']);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe(ENDPOINT);
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ query: 'Family of four with a dog, under $400' });

    // The result is visible in the filter controls the guest can still adjust.
    expect(screen.getByRole('status')).toHaveTextContent('Showing: sleeps 4+ · up to $400 a night · pets allowed.');
    expect(screen.getByLabelText('pets')).toBeChecked();
    expect(screen.getByLabelText(/guests/i)).toHaveValue('4');
    expect(screen.getByText(/room price \$400/i)).toBeInTheDocument();
  });

  test('applies a type and a minimum size', async () => {
    global.fetch = reply({ understood: true, filters: filters({ type: 'family', minSize: 600 }) });
    await renderRooms();

    ask('a big family room');

    await waitFor(() => expect(cardNames()).toEqual(['family standard', 'family deluxe']));
    expect(screen.getByLabelText(/room type/i)).toHaveValue('family');
  });

  test('rounds a party size up to a size that exists', async () => {
    global.fetch = reply({ understood: true, filters: filters({ guests: 7 }) });
    await renderRooms();

    ask('seven of us');

    // Only the presidential suite sleeps more than six.
    await waitFor(() => expect(cardNames()).toEqual(['presidential']));
    expect(screen.getByLabelText(/guests/i)).toHaveValue('10');
  });

  test('shows no rooms, rather than a wrong one, for a party bigger than any room', async () => {
    global.fetch = reply({ understood: true, filters: filters({ guests: 12 }) });
    await renderRooms();

    ask('a room for 12');

    expect(await screen.findByText(/no rooms matched your search/i)).toBeInTheDocument();
  });

  test('Clear brings every room back', async () => {
    global.fetch = reply({ understood: true, filters: filters({ type: 'single', pets: true }) });
    await renderRooms();
    ask('a single room, I have a dog');
    await waitFor(() => expect(cards().length).toBeLessThan(13));

    fireEvent.click(screen.getByRole('button', { name: /clear/i }));

    await waitFor(() => expect(cards()).toHaveLength(13));
    expect(screen.getByLabelText('pets')).not.toBeChecked();
    expect(screen.getByLabelText(/describe your stay/i)).toHaveValue('');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  test('an example asks straight away', async () => {
    global.fetch = reply({ understood: true, filters: filters({ breakfast: true }) });
    await renderRooms();

    fireEvent.click(screen.getByRole('button', { name: /two of us, breakfast included/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    expect(JSON.parse(global.fetch.mock.calls[0][1].body).query).toBe('Two of us, breakfast included, under $350');
    expect(screen.getByLabelText(/describe your stay/i)).toHaveValue('Two of us, breakfast included, under $350');
  });

  test('cannot be submitted empty', async () => {
    global.fetch = jest.fn();
    await renderRooms();

    expect(screen.getByRole('button', { name: /find rooms/i })).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/describe your stay/i), { target: { value: '   ' } });
    expect(screen.getByRole('button', { name: /find rooms/i })).toBeDisabled();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('when the AI search cannot help', () => {
  const unchanged = () => expect(cards()).toHaveLength(13);

  test('says so for something that is not a room request', async () => {
    global.fetch = reply({ understood: false, filters: filters() });
    await renderRooms();

    ask('write me a poem');

    await expectStatus(/only help you choose a room/i);
    unchanged();
  });

  test.each([
    ['is not configured', { error: 'not_configured' }, 503, /unavailable right now/i],
    ['is out of daily budget', { error: 'daily_limit' }, 429, /daily limit/i],
    ['is busy', { error: 'busy' }, 503, /busy/i],
    ['fails upstream', { error: 'upstream' }, 502, /unavailable right now/i]
  ])('explains it when the service %s', async (_name, body, status, message) => {
    global.fetch = reply(body, { ok: false, status });
    await renderRooms();

    ask('a room please');

    await expectStatus(message);
    expect(screen.getByRole('status')).toHaveTextContent(/filters below/i);
    unchanged();
  });

  test('copes with a network failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    await renderRooms();

    ask('a room please');

    await expectStatus(/unavailable right now/i);
    unchanged();
  });

  test('copes with a reply that is not JSON, such as an HTML page', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Unexpected token <');
      }
    });
    await renderRooms();

    ask('a room please');

    await expectStatus(/unavailable right now/i);
    unchanged();
  });

  test.each([
    ['without filters', { understood: true }],
    ['with the wrong types', { understood: true, filters: { type: 'family', guests: '4' } }],
    ['without a verdict', { filters: filters() }]
  ])('ignores an answer %s', async (_name, body) => {
    global.fetch = reply(body);
    await renderRooms();

    ask('a room please');

    await expectStatus(/unavailable right now/i);
    unchanged();
  });

  test('can be retried after a failure', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({ error: 'busy' }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ understood: true, filters: filters({ type: 'presidential' }) }) });
    await renderRooms();

    ask('the best suite');
    await expectStatus(/busy/i);

    fireEvent.click(screen.getByRole('button', { name: /find rooms/i }));
    await waitFor(() => expect(cardNames()).toEqual(['presidential']));
  });
});
