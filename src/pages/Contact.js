import React, { useState, memo, useCallback } from 'react';
import Hero from '../components/Hero';
import Banner from '../components/Banner';
import { usePageTitle } from '../hooks/usePageTitle';

const Contact = memo(() => {
  usePageTitle('Contact Us', 'Get in touch with Beach Resort for bookings and inquiries');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const validateForm = () => {
    if (!formData.name.trim()) return 'Please enter your name';
    if (!formData.email.trim()) return 'Please enter your email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email';
    if (!formData.message.trim()) return 'Please enter a message';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      setStatus({ type: 'error', message: error });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    // Simulate form submission (replace with actual API call)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus({
        type: 'success',
        message: 'Thank you for your message! We will get back to you within 24 hours.'
      });
      setFormData({ name: '', email: '', phone: '', subject: 'general', message: '' });
    } catch (err) {
      setStatus({
        type: 'error',
        message: 'Something went wrong. Please try again later.'
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

      <section className="contact-section" id="main-content">
        <div className="contact-container">
          <div className="contact-info">
            <h3>Get in Touch</h3>
            <div className="contact-details">
              <div className="contact-item">
                <h4>Address</h4>
                <p>123 Beach Resort Drive<br />Paradise Coast, PC 12345</p>
              </div>
              <div className="contact-item">
                <h4>Phone</h4>
                <p><a href="tel:+1234567890">+1 (234) 567-890</a></p>
              </div>
              <div className="contact-item">
                <h4>Email</h4>
                <p><a href="mailto:info@beachresort.com">info@beachresort.com</a></p>
              </div>
              <div className="contact-item">
                <h4>Hours</h4>
                <p>Reception: 24/7<br />Reservations: 8AM - 10PM</p>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <h3>Send us a Message</h3>

            {status.message && (
              <div className={`form-status ${status.type}`} role="alert">
                {status.message}
              </div>
            )}

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
                placeholder="+1 (234) 567-890"
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
