import React, { useState, useEffect, memo } from 'react';

const CookieConsent = memo(() => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Delay showing banner slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-consent" role="dialog" aria-labelledby="cookie-title">
      <div className="cookie-consent-content">
        <p id="cookie-title">
          We use cookies to enhance your experience. By continuing to visit this site,
          you agree to our use of cookies.{' '}
          <a href="/privacy" className="cookie-link">Learn more</a>
        </p>
        <div className="cookie-consent-buttons">
          <button
            onClick={handleAccept}
            className="btn-primary cookie-accept"
            aria-label="Accept cookies"
          >
            Accept
          </button>
          <button
            onClick={handleDecline}
            className="btn-secondary cookie-decline"
            aria-label="Decline cookies"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
});

export default CookieConsent;
