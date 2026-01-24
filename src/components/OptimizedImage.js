import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * OptimizedImage component with WebP support and lazy loading
 * Uses <picture> element for format fallback
 */
const OptimizedImage = ({ src, alt, className, style }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Extract base name and generate optimized paths
  const getOptimizedPaths = (originalSrc) => {
    // Handle both imported images and string paths
    const srcString = typeof originalSrc === 'string' ? originalSrc : originalSrc;

    // Extract filename from path
    const match = srcString.match(/([^/]+)\.(jpeg|jpg|png)$/i);
    if (!match) {
      return { webp: srcString, jpg: srcString, placeholder: null };
    }

    const baseName = match[1];

    // Try to use optimized versions
    try {
      const webp = require(`../images/optimized/${baseName}.webp`);
      const jpg = require(`../images/optimized/${baseName}.jpg`);
      const placeholder = require(`../images/optimized/${baseName}-placeholder.webp`);
      return { webp, jpg, placeholder };
    } catch (e) {
      // Fall back to original if optimized version doesn't exist
      return { webp: srcString, jpg: srcString, placeholder: null };
    }
  };

  const { webp, jpg, placeholder } = getOptimizedPaths(src);

  return (
    <picture className={className} style={style}>
      <source srcSet={webp} type="image/webp" />
      <source srcSet={jpg} type="image/jpeg" />
      <img
        src={jpg}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </picture>
  );
};

OptimizedImage.propTypes = {
  src: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  style: PropTypes.object
};

OptimizedImage.defaultProps = {
  className: '',
  style: {}
};

export default React.memo(OptimizedImage);
