import React, { memo } from "react";
import Hero from "../components/Hero";
import Banner from "../components/Banner";
import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";

const Error = memo(() => {
  usePageTitle("Page Not Found");

  return (
    <>
      <Hero>
        <Banner title="404" subtitle="Oops! Page not found">
          <p className="error-description">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </Banner>
      </Hero>

      <section className="error-section">
        <div className="error-content">
          <h3>What would you like to do?</h3>
          <div className="error-actions">
            <Link to="/" className="btn-primary">
              Go to Homepage
            </Link>
            <Link to="/rooms" className="btn-primary">
              Browse Rooms
            </Link>
            <Link to="/contact" className="btn-primary">
              Contact Us
            </Link>
          </div>

          <div className="error-suggestions">
            <h4>Popular Pages</h4>
            <ul>
              <li><Link to="/rooms/presidential-room">Presidential Suite</Link></li>
              <li><Link to="/rooms/family-deluxe">Family Deluxe Room</Link></li>
              <li><Link to="/rooms/double-deluxe">Double Deluxe Room</Link></li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
});

export default Error;
