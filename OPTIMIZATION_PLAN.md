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

### Phase 6: Content & SEO Optimization (Days 11-14)
- [ ] Replace all placeholder/Lorem ipsum text
- [ ] Write unique descriptions for all 13 rooms
- [ ] Update Services component with meaningful content
- [ ] Update index.html with SEO meta tags
- [ ] Add Open Graph and Twitter card meta tags
- [ ] Create centralized content/strings file
- [ ] Implement dynamic page titles
- [ ] (Optional) Set up i18n for multi-language support

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

---

## Priority 9: Static Content & SEO Optimization (Medium Impact)

### Problems Identified

#### 9.1 Placeholder/Lorem Ipsum Content
**Location:** `src/data.js` and `src/components/Services.js`

All 13 room descriptions use identical "hipster ipsum" placeholder text:
```
"Street art edison bulb gluten-free, tofu try-hard lumbersexual brooklyn..."
```

All 4 service descriptions use identical Lorem ipsum:
```
"Lorem ipsum, dolor sit amet consectetur adipisicing elit. Alias molestias eius libero?"
```

**Impact:**
- Poor SEO (duplicate/meaningless content)
- Unprofessional appearance
- Missed keyword opportunities

#### 9.2 Missing/Generic Meta Tags
**Location:** `public/index.html`

Current meta description is generic CRA default:
```html
<meta name="description" content="Web site created using create-react-app" />
```

Missing important meta tags for SEO and social sharing.

#### 9.3 Hardcoded Strings in Components
Static text scattered across components makes:
- Content updates difficult
- Internationalization (i18n) impossible
- A/B testing challenging

### Solutions

#### 9.1 Create Unique Room Descriptions
```javascript
// src/content/roomDescriptions.js
export const ROOM_DESCRIPTIONS = {
  "single-economy": {
    short: "Cozy and affordable room perfect for solo travelers.",
    full: "Our Single Economy room offers everything you need for a comfortable stay. Featuring a plush queen-sized bed, modern amenities, and a peaceful atmosphere, this room is ideal for business travelers or solo adventurers seeking quality accommodation at an affordable price. Enjoy complimentary Wi-Fi, a work desk, and access to our fitness center."
  },
  "single-basic": {
    short: "Comfortable single room with essential amenities.",
    full: "Step into comfort with our Single Basic room. This thoughtfully designed space features premium bedding, a spacious bathroom with rain shower, and a cozy seating area. Perfect for guests who appreciate simplicity without compromising on quality. Wake up refreshed and ready to explore with our complimentary continental breakfast."
  },
  "single-standard": {
    short: "Upgraded single room with extra space and amenities.",
    full: "Experience elevated comfort in our Single Standard room. Enjoy additional living space, a luxurious king-sized bed, and a private balcony with stunning views. This pet-friendly room includes a mini-bar, smart TV with streaming services, and premium toiletries. The perfect retreat after a day of adventure."
  },
  "single-deluxe": {
    short: "Premium single room with luxury touches throughout.",
    full: "Indulge in our Single Deluxe room, where luxury meets comfort. This spacious retreat features a pillow-top king bed, spa-inspired bathroom with soaking tub, and exclusive access to our executive lounge. Complimentary breakfast, evening turndown service, and premium amenities ensure an unforgettable stay."
  },
  "double-economy": {
    short: "Affordable double room ideal for couples or friends.",
    full: "Our Double Economy room provides excellent value for couples or traveling companions. Featuring two comfortable beds or one queen bed, ample closet space, and a functional workspace, this room delivers comfort without breaking the bank. Enjoy free parking and complimentary morning coffee."
  },
  "double-basic": {
    short: "Spacious double room with modern conveniences.",
    full: "The Double Basic room offers generous space and modern comforts for two guests. Relax on premium mattresses, enjoy the large flat-screen TV, and freshen up in the beautifully appointed bathroom. Ideal for weekend getaways or extended stays with friends."
  },
  "double-standard": {
    short: "Enhanced double room with upgraded amenities and views.",
    full: "Discover the perfect blend of space and style in our Double Standard room. This pet-friendly accommodation features a sitting area, work desk, and panoramic windows showcasing beautiful surroundings. Two queen beds ensure restful sleep, while modern amenities keep you connected."
  },
  "double-deluxe": {
    short: "Luxurious double room with premium features and breakfast.",
    full: "Our Double Deluxe room redefines comfort for two. Sink into plush king beds, enjoy the spacious living area, and pamper yourself in the marble bathroom with dual vanities. Complimentary gourmet breakfast, evening appetizers, and concierge service make this the ultimate couples' retreat."
  },
  "family-economy": {
    short: "Budget-friendly room perfect for families.",
    full: "Create family memories without stretching your budget in our Family Economy room. Designed with families in mind, this room features flexible sleeping arrangements for up to 3 guests, a mini-refrigerator, and kid-friendly amenities. Enjoy easy access to our pool and playground areas."
  },
  "family-basic": {
    short: "Comfortable family room with space for everyone.",
    full: "Our Family Basic room provides the space and comfort your family needs. Accommodating up to 4 guests, this room features a king bed plus twin bunks or rollaway options, a seating area for family time, and a generous bathroom. Kids stay free and enjoy our activity programs."
  },
  "family-standard": {
    short: "Spacious family suite with separate sleeping areas.",
    full: "The Family Standard room offers the space and privacy families need. This pet-friendly suite features a master sleeping area plus separate space for children, a full sofa bed, and a kitchenette for family snacks. Enjoy our kids' club and family pool activities."
  },
  "family-deluxe": {
    short: "Premium family suite with luxury amenities and services.",
    full: "Experience family travel at its finest in our Family Deluxe suite. This expansive accommodation sleeps up to 6 guests in supreme comfort, featuring a master bedroom, children's sleeping area, living room, and dining space. Complimentary breakfast, kids' activity programs, and dedicated family concierge service included."
  },
  "presidential-room": {
    short: "The ultimate luxury experience for discerning guests.",
    full: "The Presidential Suite represents the pinnacle of luxury accommodation. Spanning 1000 square feet, this magnificent suite features a grand master bedroom, formal living and dining areas, private study, and a spa-inspired bathroom with sauna. Enjoy 24-hour butler service, complimentary airport transfers, exclusive lounge access, and customized experiences tailored to your preferences."
  }
};
```

#### 9.2 Create Meaningful Service Descriptions
```javascript
// src/content/serviceDescriptions.js
export const SERVICES = [
  {
    id: "cocktails",
    icon: "FaCocktail",
    title: "Free Cocktails",
    info: "Unwind with our complimentary signature cocktails, served daily at sunset in our poolside lounge. Our expert mixologists craft refreshing drinks using locally-sourced ingredients."
  },
  {
    id: "hiking",
    icon: "FaHiking",
    title: "Endless Hiking",
    info: "Explore miles of scenic trails right from our doorstep. Our concierge provides guided hiking tours, trail maps, and packed lunches for your outdoor adventures."
  },
  {
    id: "shuttle",
    icon: "FaShuttleVan",
    title: "Free Shuttle",
    info: "Enjoy complimentary shuttle service to local attractions, shopping centers, and the airport. Scheduled departures every 30 minutes from 6 AM to 10 PM."
  },
  {
    id: "beer",
    icon: "FaBeer",
    title: "Craft Beer Selection",
    info: "Discover our curated selection of local craft beers at our resort brewery. Join our daily tasting sessions and learn about regional brewing traditions."
  }
];
```

#### 9.3 Update Meta Tags for SEO
```html
<!-- public/index.html -->
<head>
  <meta charset="utf-8" />
  <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#000000" />

  <!-- Primary Meta Tags -->
  <title>Beach Resort | Luxury Rooms & Vacation Rentals</title>
  <meta name="title" content="Beach Resort | Luxury Rooms & Vacation Rentals" />
  <meta name="description" content="Experience luxury beachfront accommodation at Beach Resort. Book from our selection of single, double, family, and presidential rooms. Best rates guaranteed with free breakfast and amenities." />
  <meta name="keywords" content="beach resort, luxury hotel, vacation rental, beachfront rooms, family hotel, hotel booking" />
  <meta name="author" content="Beach Resort" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://yourresort.com/" />
  <meta property="og:title" content="Beach Resort | Luxury Rooms & Vacation Rentals" />
  <meta property="og:description" content="Experience luxury beachfront accommodation. Book single, double, family, or presidential rooms with best rates guaranteed." />
  <meta property="og:image" content="%PUBLIC_URL%/og-image.jpg" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://yourresort.com/" />
  <meta property="twitter:title" content="Beach Resort | Luxury Rooms & Vacation Rentals" />
  <meta property="twitter:description" content="Experience luxury beachfront accommodation. Book single, double, family, or presidential rooms with best rates guaranteed." />
  <meta property="twitter:image" content="%PUBLIC_URL%/og-image.jpg" />

  <!-- Canonical URL -->
  <link rel="canonical" href="https://yourresort.com/" />

  <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
  <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
</head>
```

#### 9.4 Centralize All Static Strings
```javascript
// src/content/strings.js - Central content management
export const STRINGS = {
  // Navigation
  nav: {
    home: "Home",
    rooms: "Rooms",
    about: "About Us",
    contact: "Contact"
  },

  // Home page
  home: {
    heroTitle: "Luxurious Rooms",
    heroSubtitle: "Deluxe rooms starting at $299",
    ctaButton: "Our Rooms",
    servicesTitle: "Services"
  },

  // Rooms page
  rooms: {
    heroTitle: "Our Rooms",
    backButton: "Return Home",
    filterTitle: "Search Rooms",
    noResults: "Unfortunately no rooms matched your search parameters",
    perNight: "per night"
  },

  // Room details
  roomDetails: {
    detailsTitle: "Details",
    infoTitle: "Info",
    priceLabel: "Price",
    sizeLabel: "Size",
    sizeUnit: "SQFT",
    capacityLabel: "Max Capacity",
    capacityUnit: "people",
    petsAllowed: "Pets allowed",
    noPets: "No pets allowed",
    breakfastIncluded: "Free breakfast included",
    extrasTitle: "Extras",
    notFound: "No such room could be found..."
  },

  // Filter labels
  filter: {
    roomType: "Room Type",
    allTypes: "All",
    guests: "Guests",
    price: "Room Price",
    roomSize: "Room Size",
    breakfast: "Breakfast",
    pets: "Pets"
  },

  // Loading states
  loading: {
    rooms: "Loading rooms data...",
    general: "Loading..."
  },

  // Error page
  error: {
    title: "Page Not Found",
    message: "The page you are looking for does not exist.",
    backButton: "Return Home"
  }
};

// Usage in components:
// import { STRINGS } from '../content/strings';
// <h1>{STRINGS.home.heroTitle}</h1>
```

#### 9.5 Implement Dynamic Page Titles
```javascript
// src/hooks/usePageTitle.js
import { useEffect } from 'react';

const BASE_TITLE = 'Beach Resort';

export const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;

    // Update meta description dynamically
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && title) {
      // Could also accept description as parameter
    }

    return () => {
      document.title = BASE_TITLE;
    };
  }, [title]);
};

// Usage:
// const Home = () => {
//   usePageTitle('Luxury Accommodation');
//   return <div>...</div>;
// };
```

#### 9.6 Prepare for Internationalization (i18n)
```bash
npm install react-i18next i18next
```

```javascript
// src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

```json
// src/i18n/locales/en.json
{
  "nav": {
    "home": "Home",
    "rooms": "Rooms"
  },
  "home": {
    "heroTitle": "Luxurious Rooms",
    "heroSubtitle": "Deluxe rooms starting at ${{price}}"
  },
  "rooms": {
    "perNight": "per night",
    "noResults": "No rooms match your criteria"
  }
}
```

### Implementation Checklist

- [ ] Replace all Lorem ipsum in `Services.js` with meaningful descriptions
- [ ] Replace placeholder descriptions in `data.js` with unique room content
- [ ] Update `index.html` with proper meta tags and SEO content
- [ ] Create `src/content/` directory for centralized string management
- [ ] Implement `usePageTitle` hook for dynamic page titles
- [ ] Add Open Graph images for social sharing
- [ ] Consider i18n setup for future multi-language support

### SEO Impact Summary

| Issue | Before | After |
|-------|--------|-------|
| Meta Description | Generic CRA text | Keyword-rich resort description |
| Room Descriptions | 13 identical placeholder texts | 13 unique, SEO-optimized descriptions |
| Service Descriptions | 4 identical Lorem ipsum | 4 meaningful service descriptions |
| Page Titles | Static "Resort" | Dynamic per-page titles |
| Social Sharing | No OG tags | Full Open Graph & Twitter cards |

---

*Generated for Resort Room React Application*
*Last Updated: January 2026*
