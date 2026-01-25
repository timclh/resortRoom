import React, { Suspense, lazy } from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Loading from './components/Loading';
import ErrorBoundary from './components/ErrorBoundary';
import SkipLink from './components/SkipLink';
import CookieConsent from './components/CookieConsent';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Rooms = lazy(() => import('./pages/Rooms'));
const SingleRoom = lazy(() => import('./pages/SingleRoom'));
const Contact = lazy(() => import('./pages/Contact'));
const Error = lazy(() => import('./pages/Error'));

function App() {
  return (
    <ErrorBoundary>
      <SkipLink />
      <Navbar />
      <main id="main-content">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/rooms' element={<Rooms />} />
            <Route path='/rooms/:slug' element={<SingleRoom />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='*' element={<Error />} />
          </Routes>
        </Suspense>
      </main>
      <CookieConsent />
    </ErrorBoundary>
  );
}

export default App;
