import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Clock,
  Shield,
  Truck,
  CreditCard,
  Heart,
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Shop',
      links: [
        { name: 'All Gemstones', href: '/shop' },
        { name: 'Emeralds', href: '/shop?category=emerald' },
        { name: 'Rubies', href: '/shop?category=ruby' },
        { name: 'Diamonds', href: '/shop?category=diamond' },
        { name: 'Sapphires', href: '/shop?category=sapphire' },
        { name: 'New Arrivals', href: '/shop?new=true' },
        { name: 'Featured', href: '/shop?featured=true' },
      ],
    },
    {
      title: 'Services',
      links: [
        { name: 'Custom Design', href: '/services/custom-design' },
        { name: 'Appraisal', href: '/services/appraisal' },
        { name: 'Certification', href: '/services/certification' },
        { name: 'Repair & Maintenance', href: '/services/repair' },
        { name: 'Trade-In', href: '/services/trade-in' },
        { name: 'Consultation', href: '/services/consultation' },
      ],
    },
    {
      title: 'About',
      links: [
        { name: 'Our Story', href: '/about' },
        { name: 'Heritage', href: '/about/heritage' },
        { name: 'Craftsmanship', href: '/about/craftsmanship' },
        { name: 'Sustainability', href: '/about/sustainability' },
        { name: 'Press & Media', href: '/press' },
        { name: 'Careers', href: '/careers' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Contact Us', href: '/contact' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Shipping Info', href: '/shipping' },
        { name: 'Returns & Exchanges', href: '/returns' },
        { name: 'Size Guide', href: '/size-guide' },
        { name: 'Care Instructions', href: '/care' },
      ],
    },
  ];

  const socialLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      href: 'https://facebook.com/shankarmala',
      color: 'hover:bg-blue-600',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      href: 'https://twitter.com/shankarmala',
      color: 'hover:bg-blue-400',
    },
    {
      name: 'Instagram',
      icon: Instagram,
      href: 'https://instagram.com/shankarmala',
      color: 'hover:bg-pink-600',
    },
    {
      name: 'YouTube',
      icon: Youtube,
      href: 'https://youtube.com/shankarmala',
      color: 'hover:bg-red-600',
    },
  ];

  const features = [
    {
      icon: Shield,
      title: 'GIA Certified',
      description: 'Every gemstone comes with GIA certification',
    },
    {
      icon: Truck,
      title: 'Worldwide Shipping',
      description: 'Secure, insured delivery to your doorstep',
    },
    {
      icon: CreditCard,
      title: 'Secure Payment',
      description: 'Multiple secure payment options available',
    },
    {
      icon: Heart,
      title: 'Lifetime Care',
      description: 'Personalized after-sales care for life',
    },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-500 rounded-full flex items-center justify-center">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <img src="/images/shankarmala-logo.svg" alt="Shankarmala" className="w-12 h-12" />
                <div>
                  <h2 className="text-2xl font-bold">Shankarmala</h2>
                  <p className="text-amber-400 text-sm">Luxury Gemstones</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Discover the finest gemstones from our heritage jewelry collection. GIA certified,
                worldwide shipping, and personalized luxury service.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-400">
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <Mail className="w-4 h-4 text-amber-400" />
                  <span>info@shankarmala.com</span>
                </div>
                <div className="flex items-start space-x-3 text-gray-400">
                  <MapPin className="w-4 h-4 text-amber-400 mt-1" />
                  <span>123 Heritage Lane, Mumbai, Maharashtra 400001</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Mon-Sat: 10AM-8PM</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4 text-amber-400">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-amber-400 transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl p-8 mb-12"
        >
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Stay in the Circle of Luxury</h3>
            <p className="text-amber-100 mb-6">
              Get exclusive access to new collections, gemstone insights, and heritage stories
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-6 py-3 bg-white text-amber-600 font-semibold rounded-full hover:bg-gray-100 transition-colors duration-300"
              >
                Subscribe
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h3 className="text-lg font-semibold mb-4">Follow Our Journey</h3>
          <div className="flex justify-center space-x-4">
            {socialLinks.map((social) => (
              <motion.a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white transition-all duration-300 ${social.color}`}
              >
                <social.icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} Shankarmala. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-amber-400 transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-amber-400 transition-colors duration-300"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-gray-400 hover:text-amber-400 transition-colors duration-300"
              >
                Cookie Policy
              </Link>
              <Link
                href="/accessibility"
                className="text-gray-400 hover:text-amber-400 transition-colors duration-300"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
