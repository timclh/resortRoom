import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { RoomProvider } from './context';

const renderAt = path =>
  render(
    <RoomProvider>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </RoomProvider>
  );

// Room cards are the only <article> elements on the rooms page.
const roomCards = () => screen.getAllByRole('article');

describe('home page', () => {
  test('shows the hero and the three featured rooms', async () => {
    renderAt('/');

    expect(
      await screen.findByRole('heading', { level: 1, name: /luxurious rooms/i })
    ).toBeInTheDocument();
    expect(await screen.findAllByRole('link', { name: /features/i })).toHaveLength(3);
    expect(screen.getByText('presidential')).toBeInTheDocument();
  });
});

describe('rooms page', () => {
  test('lists every room and sets the page title', async () => {
    renderAt('/rooms');

    await screen.findByLabelText(/room type/i);
    expect(roomCards()).toHaveLength(13);
    await waitFor(() => expect(document.title).toBe('Our Rooms | Beach Resort'));
  });

  test('filters by room type', async () => {
    renderAt('/rooms');

    fireEvent.change(await screen.findByLabelText(/room type/i), {
      target: { name: 'type', value: 'family' }
    });

    await waitFor(() => expect(roomCards()).toHaveLength(4));
  });

  test('breakfast and pets are separate filters', async () => {
    renderAt('/rooms');
    await screen.findByLabelText(/room type/i);

    // Clicking the "pets" label used to toggle breakfast instead.
    fireEvent.click(screen.getByText('pets'));

    expect(screen.getByLabelText('pets')).toBeChecked();
    expect(screen.getByLabelText('breakfast')).not.toBeChecked();
    await waitFor(() => expect(roomCards()).toHaveLength(7));

    fireEvent.click(screen.getByLabelText('breakfast'));
    await waitFor(() => expect(roomCards()).toHaveLength(4));
  });

  test('says so when nothing matches', async () => {
    renderAt('/rooms');

    fireEvent.change(await screen.findByLabelText(/room type/i), {
      target: { name: 'type', value: 'single' }
    });
    fireEvent.change(screen.getByLabelText(/guests/i), {
      target: { name: 'capacity', value: '10' }
    });

    expect(
      await screen.findByText(/no rooms matched your search/i)
    ).toBeInTheDocument();
  });
});

describe('single room page', () => {
  test('shows the room and sets the page title', async () => {
    renderAt('/rooms/presidential-room');

    expect(
      await screen.findByRole('heading', { level: 1, name: /presidential room/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Presidential Suite represents/i)).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe('presidential | Beach Resort'));
  });

  test('handles an unknown room', async () => {
    renderAt('/rooms/does-not-exist');

    expect(await screen.findByText(/no such room could be found/i)).toBeInTheDocument();
  });
});

describe('404 page', () => {
  test('is shown for unknown routes', async () => {
    renderAt('/nowhere');

    expect(await screen.findByRole('heading', { level: 1, name: '404' })).toBeInTheDocument();
  });
});

describe('contact form', () => {
  const fill = () => {
    fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: 'Ada Lovelace' } });
    fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText(/^message/i), { target: { value: 'Hello there' } });
  };
  const submit = () => fireEvent.click(screen.getByRole('button', { name: /send message/i }));

  afterEach(() => {
    delete global.fetch;
  });

  test('validates before sending anything', async () => {
    global.fetch = jest.fn();
    renderAt('/contact');
    await screen.findByRole('heading', { level: 3, name: /send us a message/i });

    submit();
    expect(await screen.findByRole('alert')).toHaveTextContent('Please enter your name');

    fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: 'Ada' } });
    fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: 'not-an-email' } });
    submit();
    expect(await screen.findByRole('alert')).toHaveTextContent('valid email');

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('posts to Netlify Forms and confirms', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    renderAt('/contact');
    await screen.findByRole('heading', { level: 3, name: /send us a message/i });

    fill();
    submit();

    expect(await screen.findByRole('alert')).toHaveTextContent(/has been sent/i);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe('/');
    expect(options.method).toBe('POST');
    const body = new URLSearchParams(options.body);
    expect(body.get('form-name')).toBe('contact');
    expect(body.get('name')).toBe('Ada Lovelace');
    expect(body.get('message')).toBe('Hello there');
    // The form is cleared after a successful send.
    expect(screen.getByLabelText(/^name/i)).toHaveValue('');
  });

  test('reports a failed send instead of claiming success', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
    renderAt('/contact');
    await screen.findByRole('heading', { level: 3, name: /send us a message/i });

    fill();
    submit();

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not be sent/i);
    // What the visitor typed is kept so they can retry.
    expect(screen.getByLabelText(/^name/i)).toHaveValue('Ada Lovelace');
  });
});
