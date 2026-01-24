# Resort Room Web Optimization Plan

## Executive Summary

This document outlines a comprehensive optimization strategy for the Resort Room React application. The current application has significant performance improvement opportunities, particularly around image handling, code splitting, and bundle optimization.

**Current State Assessment:**
- Bundle size: ~2.5 MB (including 2.0 MB of unoptimized images)
- React version: 16.13.1 (outdated)
- No code splitting or lazy loading
- Service worker available but unused
- No image optimization strategy

**Expected Improvements:**
- 60-70% reduction in initial load time
- 50%+ reduction in total bundle size
- Improved Core Web Vitals (LCP, FID, CLS)

---

## Priority 1: Image Optimization (High Impact)

### Problem
- 18 JPEG images totaling 2.0 MB loaded synchronously
- No responsive images (srcset/picture elements)
- No lazy loading for below-the-fold images
- No modern formats (WebP, AVIF)

### Solutions

#### 1.1 Convert Images to Modern Formats
```bash
# Install sharp-cli for conversion
npm install -D sharp-cli

# Convert to WebP (80% quality)
npx sharp -i src/images/*.jpeg -o src/images/webp/ -f webp -q 80

# Convert to AVIF (modern browsers)
npx sharp -i src/images/*.jpeg -o src/images/avif/ -f avif -q 65
```

#### 1.2 Implement Lazy Loading
```jsx
// Create a LazyImage component
// src/components/LazyImage.js

import React, { useState, useRef, useEffect } from 'react';

const LazyImage = ({ src, alt, className, placeholder }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={className}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
        />
      )}
      {!isLoaded && placeholder}
    </div>
  );
};

export default LazyImage;
```

#### 1.3 Use Native Loading Attribute
```jsx
// Quick win - add loading="lazy" to all images
<img src={image} alt={name} loading="lazy" />
```

#### 1.4 Responsive Images with srcset
```jsx
// In Room.js component
<picture>
  <source srcset={`${imageAvif} 1x, ${imageAvif2x} 2x`} type="image/avif" />
  <source srcset={`${imageWebp} 1x, ${imageWebp2x} 2x`} type="image/webp" />
  <img
    src={imageJpeg}
    srcset={`${imageJpeg} 1x, ${imageJpeg2x} 2x`}
    alt={name}
    loading="lazy"
  />
</picture>
```

---

## Priority 2: Code Splitting & Lazy Loading (High Impact)

### Problem
- Entire app bundled into single chunk
- All routes loaded on initial visit
- No dynamic imports

### Solutions

#### 2.1 Route-Based Code Splitting
```jsx
// src/App.js - Updated with lazy loading
import React, { Suspense, lazy } from 'react';
import { Switch, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Loading from './components/Loading';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Rooms = lazy(() => import('./pages/Rooms'));
const SingleRoom = lazy(() => import('./pages/SingleRoom'));
const Error = lazy(() => import('./pages/Error'));

function App() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<Loading />}>
        <Switch>
          <Route exact path='/' component={Home} />
          <Route exact path='/rooms' component={Rooms} />
          <Route exact path='/rooms/:slug' component={SingleRoom} />
          <Route component={Error} />
        </Switch>
      </Suspense>
    </>
  );
}

export default App;
```

#### 2.2 Component-Level Code Splitting
```jsx
// Lazy load heavy components
const RoomsFilter = lazy(() => import('./components/RoomsFilter'));
const FeaturedRooms = lazy(() => import('./components/FeaturedRooms'));
```

---

## Priority 3: Dependency Updates (Medium Impact)

### Problem
- React 16.13.1 lacks concurrent features
- react-scripts 3.4.3 has older webpack/babel
- Several outdated dependencies

### Solutions

#### 3.1 Upgrade React to v18
```bash
# Upgrade React and React DOM
npm install react@18 react-dom@18

# Update react-scripts
npm install react-scripts@5

# Update testing libraries
npm install @testing-library/react@latest
```

#### 3.2 Update index.js for React 18
```jsx
// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { RoomProvider } from './context';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <RoomProvider>
      <Router>
        <App />
      </Router>
    </RoomProvider>
  </React.StrictMode>
);
```

#### 3.3 Remove Unused Dependencies
```bash
# Remove 'save' package (unclear purpose)
npm uninstall save

# Remove contentful if not using CMS
npm uninstall contentful
```

---

## Priority 4: Build Optimization (Medium Impact)

### Problem
- CRA defaults lack advanced optimization
- No compression configuration
- No bundle analysis

### Solutions

#### 4.1 Add Bundle Analyzer
```bash
npm install -D source-map-explorer

# Add to package.json scripts
"analyze": "source-map-explorer 'build/static/js/*.js'"
```

#### 4.2 Enable Compression (Deployment)
```nginx
# Nginx configuration
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript
           application/x-javascript application/xml application/javascript;

# Enable Brotli (better compression)
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/javascript application/json;
```

#### 4.3 Consider Vite Migration
```bash
# For faster builds and better optimization
npm create vite@latest resort-room-vite -- --template react
```

Vite benefits:
- 10-100x faster dev server
- Better tree-shaking
- Native ES modules
- Built-in optimization

---

## Priority 5: Caching Strategy (Medium Impact)

### Problem
- Service worker available but not registered
- No caching strategy implemented

### Solutions

#### 5.1 Enable Service Worker
```jsx
// src/index.js - Change last line
import * as serviceWorker from './serviceWorker';

// Change from:
serviceWorker.unregister();

// To:
serviceWorker.register();
```

#### 5.2 Implement Workbox for Advanced Caching
```bash
npm install workbox-webpack-plugin
```

```javascript
// Custom service worker with Workbox
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache images with CacheFirst strategy
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache API responses with StaleWhileRevalidate
registerRoute(
  ({ url }) => url.pathname.startsWith('/api'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
  })
);
```

---

## Priority 6: Component Optimization (Low-Medium Impact)

### Problem
- Only Room component uses React.memo
- Context changes cause unnecessary re-renders
- No useMemo/useCallback optimization

### Solutions

#### 6.1 Memoize Components
```jsx
// src/components/RoomsList.js
import React, { memo } from 'react';
import Room from './Room';

const RoomsList = memo(({ rooms }) => {
  return (
    <section className='roomslist'>
      <div className='roomslist-center'>
        {rooms.map(room => (
          <Room key={room.id} room={room} />
        ))}
      </div>
    </section>
  );
});

export default RoomsList;
```

#### 6.2 Optimize Context
```jsx
// src/context.js - Split context to prevent unnecessary re-renders
const RoomStateContext = React.createContext();
const RoomDispatchContext = React.createContext();

// Use separate contexts for state and actions
export const useRoomState = () => useContext(RoomStateContext);
export const useRoomDispatch = () => useContext(RoomDispatchContext);
```

#### 6.3 Use useMemo for Filtered Data
```jsx
// In RoomsFilter or context
const sortedRooms = useMemo(() => {
  return rooms.filter(room => {
    // filter logic
  }).sort((a, b) => a.price - b.price);
}, [rooms, type, capacity, price, minSize, maxSize, breakfast, pets]);
```

---

## Priority 7: CSS Optimization (Low Impact)

### Problem
- Single 513-line CSS file
- No critical CSS extraction
- Unused styles not removed

### Solutions

#### 7.1 Extract Critical CSS
```bash
npm install -D critters-webpack-plugin
```

#### 7.2 PurgeCSS for Production
```bash
npm install -D @fullhuman/postcss-purgecss
```

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('@fullhuman/postcss-purgecss')({
      content: ['./src/**/*.js', './public/index.html'],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
    })
  ]
};
```

#### 7.3 CSS-in-JS Consistency
Consider migrating fully to styled-components or CSS Modules for better tree-shaking:

```jsx
// Convert App.css classes to styled-components
// src/components/Room.styles.js
import styled from 'styled-components';

export const RoomCard = styled.article`
  box-shadow: var(--lightShadow);
  transition: var(--mainTransition);

  &:hover {
    box-shadow: var(--darkShadow);
  }
`;
```

---

## Priority 8: Performance Monitoring (Ongoing)

### Solutions

#### 8.1 Add Web Vitals Tracking
```jsx
// src/reportWebVitals.js
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }
};

export default reportWebVitals;
```

#### 8.2 Add Performance Budget
```json
// package.json
{
  "bundlesize": [
    {
      "path": "./build/static/js/*.js",
      "maxSize": "150 kB"
    },
    {
      "path": "./build/static/css/*.css",
      "maxSize": "20 kB"
    }
  ]
}
```

---

## Implementation Roadmap

### Phase 1: Quick Wins (Day 1)
- [ ] Add `loading="lazy"` to all images
- [ ] Enable service worker registration
- [ ] Implement route-based code splitting
- [ ] Remove unused dependencies

### Phase 2: Image Optimization (Days 2-3)
- [ ] Convert images to WebP format
- [ ] Implement LazyImage component
- [ ] Add responsive image srcsets
- [ ] Compress existing JPEGs

### Phase 3: Dependency Updates (Days 4-5)
- [ ] Upgrade to React 18
- [ ] Update react-scripts to v5
- [ ] Update all dependencies
- [ ] Fix any breaking changes

### Phase 4: Build & Caching (Days 6-7)
- [ ] Add bundle analyzer
- [ ] Configure compression
- [ ] Implement Workbox caching
- [ ] Add performance monitoring

### Phase 5: Component Optimization (Days 8-10)
- [ ] Memoize all list components
- [ ] Split context for state/dispatch
- [ ] Add useMemo/useCallback optimizations
- [ ] Implement CSS optimization

---

## Expected Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Initial Bundle | ~2.5 MB | ~500 KB | 80% smaller |
| LCP (Largest Contentful Paint) | ~4s | ~1.5s | 62% faster |
| FID (First Input Delay) | ~100ms | ~50ms | 50% faster |
| TTI (Time to Interactive) | ~5s | ~2s | 60% faster |
| Lighthouse Score | ~50 | ~90+ | 80% improvement |

---

## Tools & Resources

- **Bundle Analyzer:** https://github.com/danvk/source-map-explorer
- **Image Optimization:** https://squoosh.app/ (manual) or sharp-cli
- **Web Vitals:** https://web.dev/vitals/
- **Lighthouse:** Chrome DevTools > Lighthouse tab
- **Workbox:** https://developers.google.com/web/tools/workbox

---

*Generated for Resort Room React Application*
*Last Updated: January 2026*
