import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';

const AboutPage: React.FC = () => {
  const teamMembers = [
    {
      name: 'Rajesh Kumar',
      role: 'Master Gemologist',
      image: null, // Remove image reference
      description: '30+ years of expertise in rare gemstone identification and heritage cuts.',
      certifications: ['GIA Graduate', 'Kolkata Heritage Council'],
    },
    {
      name: 'Priya Sharma',
      role: 'Heritage Curator',
      image: null, // Remove image reference
      description: "Preserving the legacy of Kolkata's finest gemstone traditions.",
      certifications: ['Art History PhD', 'Heritage Specialist'],
    },
    {
      name: 'Amit Patel',
      role: 'Master Craftsman',
      image: null, // Remove image reference
      description: 'Creating bespoke settings that honor traditional Indian craftsmanship.',
      certifications: ['Jewelry Design', 'Traditional Techniques'],
    },
  ];

  const values = [
    {
      icon: '💎',
      title: 'Authenticity',
      description: 'Every gemstone is certified and authenticated by leading laboratories.',
    },
    {
      icon: '🏛️',
      title: 'Heritage',
      description: "Preserving the rich legacy of Kolkata's gemstone traditions.",
    },
    {
      icon: '✨',
      title: 'Excellence',
      description: 'Uncompromising quality in every piece we create and curate.',
    },
    {
      icon: '🤝',
      title: 'Trust',
      description: 'Building lasting relationships through transparency and integrity.',
    },
  ];

  const testimonials = [
    {
      name: 'Meera Kapoor',
      role: 'Collector',
      content:
        "The heritage collection is absolutely breathtaking. Each piece tells a story of Kolkata's rich gemstone legacy.",
      rating: 5,
    },
    {
      name: 'Vikram Singh',
      role: 'Investor',
      content:
        'Exceptional quality and authenticity. The certification process gives me complete confidence in my investments.',
      rating: 5,
    },
    {
      name: 'Anjali Desai',
      role: 'Designer',
      content:
        'Working with their master craftsmen has been a dream. The attention to detail is unmatched.',
      rating: 5,
    },
  ];

  // SEO structured data
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JewelryStore',
    name: 'Shankarmala Gemstore',
    description: 'Luxury heritage gemstone store in Kolkata. GIA certified, 125+ years of trust.',
    url: 'https://shankarmala.com/about',
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
    sameAs: ['https://www.instagram.com/heritagegems/', 'https://www.facebook.com/heritagegems/'],
  };

  return (
    <>
      <Head>
        <title>About Us - Shankarmala Gemstore | Heritage, Trust & Luxury</title>
        <meta
          name="description"
          content="Discover the legacy of Shankarmala Gemstore, Kolkata's most trusted heritage gemstone jeweler. 125+ years of authenticity, GIA certified, and luxury craftsmanship."
        />
        <link rel="canonical" href="https://shankarmala.com/about" />
        <meta property="og:title" content="About Us - Shankarmala Gemstore" />
        <meta
          property="og:description"
          content="Discover the legacy of Shankarmala Gemstore, Kolkata's most trusted heritage gemstone jeweler. 125+ years of authenticity, GIA certified, and luxury craftsmanship."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shankarmala.com/about" />
        <meta property="og:image" content="/images/placeholder-gemstone.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Us - Shankarmala Gemstore" />
        <meta
          name="twitter:description"
          content="Discover the legacy of Shankarmala Gemstore, Kolkata's most trusted heritage gemstone jeweler."
        />
        <meta name="twitter:image" content="/images/placeholder-gemstone.jpg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </Head>
      <main
        className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50"
        aria-label="About Shankarmala Gemstore"
      >
        {/* Hero Section */}
        <section
          className="relative overflow-hidden pt-16 lg:pt-20"
          aria-labelledby="about-hero-heading"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/20 via-amber-800/30 to-orange-900/20"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1
                id="about-hero-heading"
                className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 font-serif"
              >
                <span className="bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Our Heritage
                </span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Welcome to Shankarmala, where tradition meets luxury in every precious gemstone. For
                over a century, we have been the trusted name in heritage jewelry, bringing the
                world&apos;s finest gemstones to discerning collectors and connoisseurs.
              </p>
              <motion.div
                className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-lg rounded-full px-6 py-3 shadow-lg border border-yellow-100"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-yellow-600">🏛️</span>
                <span className="font-semibold text-yellow-900 font-serif">Est. 1895</span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 sm:py-24" aria-labelledby="about-story-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2
                  id="about-story-heading"
                  className="text-3xl sm:text-4xl font-bold text-yellow-900 mb-6 font-serif"
                >
                  A Legacy of Excellence
                </h2>
                <div className="space-y-6 text-lg text-yellow-800 font-serif leading-relaxed">
                  <p>
                    Founded in the heart of Kolkata during the British Raj, our family business
                    began as a small workshop crafting jewelry for the city&apos;s elite. Over the
                    decades, we&apos;ve grown into one of India&apos;s most respected names in fine
                    gemstones and heritage jewelry.
                  </p>
                  <p>
                    Our collection spans centuries of craftsmanship, from Mughal-era techniques to
                    contemporary designs that honor traditional Indian aesthetics. Each piece in our
                    collection is carefully selected for its rarity, beauty, and historical
                    significance.
                  </p>
                  <p>
                    Today, we continue to serve collectors worldwide, offering not just jewelry, but
                    pieces of history that tell the story of India&apos;s rich cultural heritage
                    through the language of precious stones.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-3xl p-8 sm:p-12 shadow-2xl border border-yellow-200">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { number: '125+', label: 'Years of Heritage' },
                      { number: '10,000+', label: 'Happy Clients' },
                      { number: '500+', label: 'Rare Gemstones' },
                      { number: '100%', label: 'Authentic' },
                    ].map((stat, idx) => (
                      <motion.div
                        key={stat.label}
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent font-serif">
                          {stat.number}
                        </div>
                        <div className="text-sm text-yellow-700 font-serif mt-1">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 sm:py-24 bg-white/50" aria-labelledby="about-values-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2
                id="about-values-heading"
                className="text-3xl sm:text-4xl font-bold text-yellow-900 mb-6 font-serif"
              >
                Our Core Values
              </h2>
              <p className="text-xl text-yellow-800 font-serif max-w-3xl mx-auto">
                The principles that guide every decision we make and every piece we curate.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, idx) => (
                <motion.div
                  key={value.title}
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-yellow-200">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-yellow-900 mb-3 font-serif">
                    {value.title}
                  </h3>
                  <p className="text-yellow-700 font-serif leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 sm:py-24" aria-labelledby="about-team-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2
                id="about-team-heading"
                className="text-3xl sm:text-4xl font-bold text-yellow-900 mb-6 font-serif"
              >
                Meet Our Experts
              </h2>
              <p className="text-xl text-yellow-800 font-serif max-w-3xl mx-auto">
                Our team of master craftsmen and gemologists bring decades of expertise to every
                piece.
              </p>
            </motion.div>

            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              role="list"
              aria-label="Meet our experts"
            >
              {teamMembers.map((member, idx) => (
                <motion.div
                  key={member.name}
                  className="bg-white/90 rounded-2xl shadow-2xl border border-yellow-100/60 backdrop-blur-lg overflow-hidden"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  role="listitem"
                  aria-label={`${member.name}, ${member.role}`}
                >
                  <div className="h-64 bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center">
                    <div className="text-6xl">👤</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-yellow-900 mb-1 font-serif">
                      {member.name}
                    </h3>
                    <p className="text-yellow-600 font-semibold mb-3 font-serif">{member.role}</p>
                    <p className="text-yellow-700 mb-4 font-serif leading-relaxed">
                      {member.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {member.certifications.map((cert) => (
                        <span
                          key={cert}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold font-serif"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section
          className="py-16 sm:py-24 bg-white/50"
          aria-labelledby="about-testimonials-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2
                id="about-testimonials-heading"
                className="text-3xl sm:text-4xl font-bold text-yellow-900 mb-6 font-serif"
              >
                What Our Clients Say
              </h2>
              <p className="text-xl text-yellow-800 font-serif max-w-3xl mx-auto">
                Trusted by collectors and connoisseurs worldwide for over a century.
              </p>
            </motion.div>

            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              role="list"
              aria-label="Client testimonials"
            >
              {testimonials.map((testimonial, idx) => (
                <motion.div
                  key={testimonial.name}
                  className="bg-white/90 rounded-2xl shadow-2xl border border-yellow-100/60 backdrop-blur-lg p-6 sm:p-8"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  role="listitem"
                  aria-label={`Testimonial from ${testimonial.name}, ${testimonial.role}`}
                >
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xl">
                        ⭐
                      </span>
                    ))}
                  </div>
                  <p className="text-yellow-800 font-serif leading-relaxed mb-6">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div>
                    <div className="font-semibold text-yellow-900 font-serif">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-yellow-600 font-serif">{testimonial.role}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 sm:py-24" aria-labelledby="about-contact-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2
                  id="about-contact-heading"
                  className="text-3xl sm:text-4xl font-bold text-yellow-900 mb-6 font-serif"
                >
                  Visit Our Heritage Gallery
                </h2>
                <div className="space-y-6 text-lg text-yellow-800 font-serif">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl flex items-center justify-center text-yellow-600 text-xl flex-shrink-0">
                      📍
                    </div>
                    <div>
                      <h3 className="font-semibold text-yellow-900 mb-1">Address</h3>
                      <p>
                        123 Heritage Lane, Park Street
                        <br />
                        Kolkata, West Bengal 700016
                        <br />
                        India
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl flex items-center justify-center text-yellow-600 text-xl flex-shrink-0">
                      📞
                    </div>
                    <div>
                      <h3 className="font-semibold text-yellow-900 mb-1">Contact</h3>
                      <p>
                        +91 33 1234 5678
                        <br />
                        info@heritagegems.com
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl flex items-center justify-center text-yellow-600 text-xl flex-shrink-0">
                      🕒
                    </div>
                    <div>
                      <h3 className="font-semibold text-yellow-900 mb-1">Hours</h3>
                      <p>
                        Monday - Saturday: 10:00 AM - 7:00 PM
                        <br />
                        Sunday: By appointment only
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-3xl p-8 sm:p-12 shadow-2xl border border-yellow-200"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold text-yellow-900 mb-6 font-serif">
                  Certifications & Trust
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { icon: '🏛️', label: 'Kolkata Heritage Council', desc: 'Official recognition' },
                    { icon: '💎', label: 'GIA Certified', desc: 'Gemological Institute' },
                    { icon: '🔒', label: 'SSL Secured', desc: '256-bit encryption' },
                    { icon: '📦', label: 'Insured Delivery', desc: 'Full coverage' },
                  ].map((badge, idx) => (
                    <motion.div
                      key={badge.label}
                      className="text-center p-4 bg-white/80 rounded-xl border border-yellow-200"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="text-2xl mb-2">{badge.icon}</div>
                      <div className="text-sm font-semibold text-yellow-900 font-serif">
                        {badge.label}
                      </div>
                      <div className="text-xs text-yellow-700 font-serif">{badge.desc}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default AboutPage;
