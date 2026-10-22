import React, { useState, memo, useCallback } from 'react';
import Hero from '../components/Hero';
import Banner from '../components/Banner';
import { usePageTitle } from '../hooks/usePageTitle';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  subject: 'general',
  message: ''
};

const validate = ({ name, email, message }) => {
  if (!name.trim()) return 'Please enter your name';
  if (!email.trim()) return 'Please enter your email';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email';
  if (!message.trim()) return 'Please enter a message';
  return null;
};

// Netlify Forms reads application/x-www-form-urlencoded. The matching static
// form in public/index.html is what makes Netlify register "contact".
const encode = data => new URLSearchParams(data).toString();

const Contact = memo(() => {
  usePageTitle('Contact Us', 'Get in touch with Beach Resort for bookings and inquiries');

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [botField, setBotField] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validate(formData);
    if (error) {
      setStatus({ type: 'error', message: error });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({ 'form-name': 'contact', 'bot-field': botField, ...formData })
      });
      if (!response.ok) throw new Error(`Form submission failed: ${response.status}`);

      setStatus({ type: 'success', message: 'Thank you! Your message has been sent.' });
      setFormData(EMPTY_FORM);
    } catch (err) {
      setStatus({
        type: 'error',
        message: 'Sorry, your message could not be sent. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Hero hero="roomsHero">
        <Banner title="Contact Us" subtitle="We'd love to hear from you" />
      </Hero>

      <section className="contact-section">
        <div className="contact-container">
          <div className="contact-info">
            <h3>Get in Touch</h3>
            <p className="contact-note">
              This is a demo site for a fictional resort. The details below are
              placeholders, but messages sent through the form do reach the
              developer.
            </p>
            <div className="contact-details">
              <div className="contact-item">
                <h4>Address</h4>
                <p>123 Demo Street<br />Sampletown, ST 00000</p>
              </div>
              <div className="contact-item">
                <h4>Phone</h4>
                <p><a href="tel:+15550100100">+1 (555) 010-0100</a></p>
              </div>
              <div className="contact-item">
                <h4>Email</h4>
                <p><a href="mailto:hello@example.com">hello@example.com</a></p>
              </div>
            </div>
          </div>

          <form
            className="contact-form"
            name="contact"
            method="POST"
            onSubmit={handleSubmit}
            noValidate
          >
            <h3>Send us a Message</h3>

            {status.message && (
              <div className={`form-status ${status.type}`} role="alert">
                {status.message}
              </div>
            )}

            {/* Honeypot: hidden from people, filled in by bots. */}
            <p hidden>
              <label>
                Don't fill this out
                <input
                  name="bot-field"
                  value={botField}
                  onChange={e => setBotField(e.target.value)}
                />
              </label>
            </p>

            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                aria-required="true"
                placeholder="Your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                aria-required="true"
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Optional"
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
              >
                <option value="general">General Inquiry</option>
                <option value="reservation">Reservation Question</option>
                <option value="feedback">Feedback</option>
                <option value="complaint">Complaint</option>
                <option value="partnership">Business Partnership</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                aria-required="true"
                rows="5"
                placeholder="How can we help you?"
              />
            </div>

            <button
              type="submit"
              className="btn-primary contact-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>
    </>
  );
});

export default Contact;
