import React, { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    preferredContact: 'email',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | ''>('');

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');
    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        preferredContact: 'email',
      });
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: '📞',
      title: 'Phone',
      details: ['+91 33 1234 5678', '+91 98765 43210'],
      description: 'Speak directly with our gemstone experts',
    },
    {
      icon: '✉️',
      title: 'Email',
      details: ['info@heritagegems.com', 'appointments@heritagegems.com'],
      description: 'Send us detailed inquiries and requests',
    },
    {
      icon: '📍',
      title: 'Visit Us',
      details: ['123 Heritage Lane, Park Street', 'Kolkata, West Bengal 700016'],
      description: 'Experience our collection in person',
    },
  ];

  const businessHours = [
    { day: 'Monday - Friday', hours: '10:00 AM - 7:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 6:00 PM' },
    { day: 'Sunday', hours: 'By appointment only' },
  ];

  const faqs = [
    {
      question: 'How do I schedule a private viewing?',
      answer:
        'Contact us via phone or email to schedule a private appointment. Our experts will guide you through our exclusive collection.',
    },
    {
      question: 'Do you offer international shipping?',
      answer:
        'Yes, we provide secure international shipping with full insurance coverage and tracking for all orders.',
    },
    {
      question: 'What certifications do your gemstones have?',
      answer:
        'All our gemstones are certified by leading laboratories including GIA, IGI, and our own Kolkata Heritage Council.',
    },
    {
      question: 'Can you create custom jewelry pieces?',
      answer:
        'Absolutely! Our master craftsmen specialize in creating bespoke jewelry that honors traditional Indian techniques.',
    },
  ];

  // SEO structured data
  const contactJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JewelryStore',
    name: 'Shankarmala Gemstore',
    description:
      "Contact Shankarmala Gemstore, Kolkata's most trusted heritage gemstone jeweler. GIA certified, 125+ years of trust.",
    url: 'https://shankarmala.com/contact',
    image: 'https://shankarmala.com/images/placeholder-gemstone.jpg',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Heritage Lane, Park Street',
      addressLocality: 'Kolkata',
      addressRegion: 'West Bengal',
      postalCode: '700016',
      addressCountry: 'IN',
    },
    telephone: '+91 33 1234 5678',
    email: 'info@heritagegems.com',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+91 33 1234 5678',
        contactType: 'customer service',
        areaServed: 'IN',
        availableLanguage: ['English', 'Hindi', 'Bengali'],
      },
    ],
  };

  return (
    <>
      <Head>
        <title>Contact Us - Shankarmala Gemstore | Heritage Gemstone Experts</title>
        <meta
          name="description"
          content="Contact Shankarmala Gemstore, Kolkata's most trusted heritage gemstone jeweler. GIA certified, 125+ years of trust. Get in touch for appointments, support, and custom jewelry."
        />
        <link rel="canonical" href="https://shankarmala.com/contact" />
        <meta property="og:title" content="Contact Us - Shankarmala Gemstore" />
        <meta
          property="og:description"
          content="Contact Shankarmala Gemstore, Kolkata's most trusted heritage gemstone jeweler. GIA certified, 125+ years of trust."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shankarmala.com/contact" />
        <meta property="og:image" content="/images/placeholder-gemstone.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact Us - Shankarmala Gemstore" />
        <meta
          name="twitter:description"
          content="Contact Shankarmala Gemstore, Kolkata's most trusted heritage gemstone jeweler."
        />
        <meta name="twitter:image" content="/images/placeholder-gemstone.jpg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
        />
      </Head>
      <main
        className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50"
        aria-label="Contact Shankarmala Gemstore"
      >
        {/* Hero Section */}
        <section
          className="relative overflow-hidden pt-16 lg:pt-20"
          aria-labelledby="contact-hero-heading"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/20 via-amber-800/30 to-orange-900/20"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1
                id="contact-hero-heading"
                className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 font-serif"
              >
                <span className="bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Get in Touch
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-yellow-800 mb-8 font-serif max-w-4xl mx-auto leading-relaxed">
                Ready to discover the world&apos;s finest heritage gemstones? Our experts are here
                to guide you through our exclusive collection and answer all your questions.
              </p>
              <motion.div
                className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-lg rounded-full px-6 py-3 shadow-lg border border-yellow-100"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-yellow-600">💎</span>
                <span className="font-semibold text-yellow-900 font-serif">
                  Expert Consultation Available
                </span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-16 sm:py-24" aria-labelledby="contact-methods-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2
                id="contact-methods-heading"
                className="text-3xl sm:text-4xl font-bold text-yellow-900 mb-6 font-serif"
              >
                How Can We Help You?
              </h2>
              <p className="text-xl text-yellow-800 font-serif max-w-3xl mx-auto">
                Choose your preferred way to connect with our heritage gemstone experts.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {contactMethods.map((method, idx) => (
                <motion.div
                  key={method.title}
                  className="bg-white/90 rounded-2xl shadow-2xl border border-yellow-100/60 backdrop-blur-lg p-6 sm:p-8 text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-yellow-200">
                    {method.icon}
                  </div>
                  <h3 className="text-xl font-bold text-yellow-900 mb-3 font-serif">
                    {method.title}
                  </h3>
                  <p className="text-yellow-700 mb-4 font-serif">{method.description}</p>
                  <div className="space-y-2">
                    {method.details.map((detail, detailIdx) => (
                      <p key={detailIdx} className="text-yellow-900 font-semibold font-serif">
                        {detail}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-16 sm:py-24 bg-white/50" aria-labelledby="contact-form-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2
                  id="contact-form-heading"
                  className="text-3xl sm:text-4xl font-bold text-yellow-900 mb-6 font-serif"
                >
                  Send Us a Message
                </h2>
                {submitStatus === 'success' && (
                  <div
                    className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-green-800 text-center"
                    aria-live="polite"
                    role="status"
                  >
                    Thank you! Your message has been sent. Our experts will contact you soon.
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div
                    className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-red-800 text-center"
                    aria-live="polite"
                    role="alert"
                  >
                    Sorry, there was a problem sending your message. Please try again.
                  </div>
                )}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                  aria-labelledby="contact-form-heading"
                  role="form"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-yellow-700 mb-2 font-serif">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        className="w-full px-4 py-3 border border-yellow-200 rounded-xl focus:ring-4 focus:ring-yellow-200/40 focus:border-yellow-400 transition-all duration-300 bg-white/80 backdrop-blur"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-yellow-700 mb-2 font-serif">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        className="w-full px-4 py-3 border border-yellow-200 rounded-xl focus:ring-4 focus:ring-yellow-200/40 focus:border-yellow-400 transition-all duration-300 bg-white/80 backdrop-blur"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-yellow-700 mb-2 font-serif">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        className="w-full px-4 py-3 border border-yellow-200 rounded-xl focus:ring-4 focus:ring-yellow-200/40 focus:border-yellow-400 transition-all duration-300 bg-white/80 backdrop-blur"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-yellow-700 mb-2 font-serif">
                        Subject *
                      </label>
                      <select
                        required
                        value={formData.subject}
                        onChange={(e) => updateFormData('subject', e.target.value)}
                        className="w-full px-4 py-3 border border-yellow-200 rounded-xl focus:ring-4 focus:ring-yellow-200/40 focus:border-yellow-400 transition-all duration-300 bg-white/80 backdrop-blur"
                      >
                        <option value="">Select a subject</option>
                        <option value="appointment">Schedule Appointment</option>
                        <option value="inquiry">Product Inquiry</option>
                        <option value="custom">Custom Jewelry</option>
                        <option value="support">Customer Support</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-yellow-700 mb-2 font-serif">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => updateFormData('message', e.target.value)}
                      className="w-full px-4 py-3 border border-yellow-200 rounded-xl focus:ring-4 focus:ring-yellow-200/40 focus:border-yellow-400 transition-all duration-300 bg-white/80 backdrop-blur resize-none"
                      placeholder="Tell us about your inquiry..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-yellow-700 mb-2 font-serif">
                      Preferred Contact Method
                    </label>
                    <div className="flex gap-4">
                      {[
                        { value: 'email', label: 'Email' },
                        { value: 'phone', label: 'Phone' },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="preferredContact"
                            value={option.value}
                            checked={formData.preferredContact === option.value}
                            onChange={(e) => updateFormData('preferredContact', e.target.value)}
                            className="text-yellow-600 focus:ring-yellow-500"
                          />
                          <span className="text-yellow-900 font-serif">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white py-4 px-8 rounded-xl font-bold shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-yellow-300/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </motion.button>
                </form>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-yellow-900 mb-6 font-serif">
                  Visit Our Gallery
                </h2>

                {/* Business Hours */}
                <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl p-6 sm:p-8 mb-8 shadow-2xl border border-yellow-200">
                  <h3 className="text-xl font-bold text-yellow-900 mb-4 font-serif">
                    Business Hours
                  </h3>
                  <div className="space-y-3">
                    {businessHours.map((schedule) => (
                      <div key={schedule.day} className="flex justify-between items-center">
                        <span className="text-yellow-900 font-serif">{schedule.day}</span>
                        <span className="font-semibold text-yellow-700 font-serif">
                          {schedule.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl p-6 sm:p-8 mb-8 shadow-2xl border border-yellow-200">
                  <h3 className="text-xl font-bold text-yellow-900 mb-4 font-serif">
                    Our Location
                  </h3>
                  <div className="space-y-3 text-yellow-800 font-serif">
                    <p>123 Heritage Lane, Park Street</p>
                    <p>Kolkata, West Bengal 700016</p>
                    <p>India</p>
                  </div>
                  <div className="mt-4 p-4 bg-white/80 rounded-xl border border-yellow-200">
                    <div className="text-center text-yellow-600">
                      <div className="text-2xl mb-2">🗺️</div>
                      <p className="text-sm font-serif">Interactive Map Coming Soon</p>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl p-6 sm:p-8 shadow-2xl border border-yellow-200">
                  <h3 className="text-xl font-bold text-yellow-900 mb-4 font-serif">Follow Us</h3>
                  <div className="flex gap-4">
                    {[
                      { icon: '📘', label: 'Facebook' },
                      { icon: '📷', label: 'Instagram' },
                      { icon: '🐦', label: 'Twitter' },
                      { icon: '💼', label: 'LinkedIn' },
                    ].map((social) => (
                      <motion.button
                        key={social.label}
                        className="w-12 h-12 bg-white/80 rounded-xl border border-yellow-200 flex items-center justify-center text-xl hover:bg-yellow-50 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {social.icon}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 sm:py-24" aria-labelledby="contact-faq-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2
                id="contact-faq-heading"
                className="text-3xl sm:text-4xl font-bold text-yellow-900 mb-6 font-serif"
              >
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-yellow-800 font-serif">
                Find answers to common questions about our services and collection.
              </p>
            </motion.div>

            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <motion.div
                  key={faq.question}
                  className="bg-white/90 rounded-2xl shadow-2xl border border-yellow-100/60 backdrop-blur-lg p-6 sm:p-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-lg sm:text-xl font-bold text-yellow-900 mb-3 font-serif">
                    {faq.question}
                  </h3>
                  <p className="text-yellow-700 font-serif leading-relaxed">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-16 sm:py-24 bg-white/50" aria-labelledby="contact-trust-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2
                id="contact-trust-heading"
                className="text-2xl sm:text-3xl font-bold text-yellow-900 mb-6 font-serif"
              >
                Trust & Security
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { icon: '🔒', label: 'SSL Secured', desc: '256-bit encryption' },
                { icon: '🏛️', label: 'Heritage Certified', desc: 'Kolkata Council' },
                { icon: '💎', label: 'GIA Certified', desc: 'Gemological Institute' },
                { icon: '📦', label: 'Insured Delivery', desc: 'Full coverage' },
              ].map((badge, idx) => (
                <motion.div
                  key={badge.label}
                  className="text-center p-6 bg-white/90 rounded-2xl shadow-2xl border border-yellow-100/60 backdrop-blur-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-3xl mb-3">{badge.icon}</div>
                  <div className="text-sm font-semibold text-yellow-900 font-serif">
                    {badge.label}
                  </div>
                  <div className="text-xs text-yellow-700 font-serif">{badge.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default ContactPage;
