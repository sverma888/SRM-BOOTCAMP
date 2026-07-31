'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, Clock, Send, CheckCircle2, MessageSquare, MapPin } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    // Simulate sending contact message
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Support & Assistance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
            Contact Us
          </h1>
          <p className="text-muted text-base sm:text-lg">
            Have questions about your order, shipping, or our products? Reach out to our dedicated support team.
          </p>
        </div>

        {/* Contact Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Email Card */}
          <div className="bg-surface border border-border/80 rounded-2xl p-6 shadow-xs hover:border-primary/50 transition-all flex flex-col items-start justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">Email Us</h3>
              <p className="text-sm text-muted mb-4">
                Send us an email and we&apos;ll get back to you within 24 hours.
              </p>
            </div>
            <a
              href="mailto:svmimt@gmail.com"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              svmimt@gmail.com
            </a>
          </div>

          {/* Phone Card */}
          <div className="bg-surface border border-border/80 rounded-2xl p-6 shadow-xs hover:border-primary/50 transition-all flex flex-col items-start justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">Call Us</h3>
              <p className="text-sm text-muted mb-4">
                Speak directly with our support team for immediate assistance.
              </p>
            </div>
            <a
              href="tel:94315XXXXX"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              +91 94315XXXXX
            </a>
          </div>

          {/* Working Hours Card */}
          <div className="bg-surface border border-border/80 rounded-2xl p-6 shadow-xs hover:border-primary/50 transition-all flex flex-col items-start justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">Support Hours</h3>
              <p className="text-sm text-muted mb-4">
                We are available to answer calls and reply to messages.
              </p>
            </div>
            <div className="text-sm font-semibold text-foreground">
              Mon – Sat: 9:00 AM – 6:00 PM IST
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="max-w-2xl mx-auto bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-2">Send Us a Message</h2>
          <p className="text-sm text-muted mb-6">
            Fill out the form below and our customer care team will get in touch.
          </p>

          {submitted ? (
            <div className="bg-success/10 border border-success/30 rounded-xl p-6 text-center text-success flex flex-col items-center gap-3">
              <CheckCircle2 className="w-10 h-10" />
              <div>
                <h4 className="font-bold text-base">Message Sent Successfully!</h4>
                <p className="text-sm opacity-90 mt-1">
                  Thank you for contacting us. We will respond to <strong>{formData.email || 'your email'}</strong> shortly.
                </p>
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 text-xs font-semibold underline hover:opacity-80"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-foreground mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border focus:border-primary focus:outline-none text-sm text-foreground"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-foreground mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border focus:border-primary focus:outline-none text-sm text-foreground"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-xs font-semibold text-foreground mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Order Inquiry / Product Question"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border focus:border-primary focus:outline-none text-sm text-foreground"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-semibold text-foreground mb-1">
                  Message *
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help you?"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border focus:border-primary focus:outline-none text-sm text-foreground resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
