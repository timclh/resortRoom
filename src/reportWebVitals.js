import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

/**
 * Report Web Vitals metrics for performance monitoring
 * @param {Function} onPerfEntry - Callback function to handle metrics
 */
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Cumulative Layout Shift - measures visual stability
    onCLS(onPerfEntry);
    // First Contentful Paint - when first content appears
    onFCP(onPerfEntry);
    // Interaction to Next Paint - measures responsiveness (replaces FID)
    onINP(onPerfEntry);
    // Largest Contentful Paint - when main content is visible
    onLCP(onPerfEntry);
    // Time to First Byte - server response time
    onTTFB(onPerfEntry);
  }
};

export default reportWebVitals;
