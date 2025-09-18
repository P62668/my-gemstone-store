import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
import dynamic from 'next/dynamic';

// Dynamically import framer-motion components
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false });

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Features Section with Luxury Design */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16">
          {features.map((feature, index) => (
            typeof window !== 'undefined' ? (
              <MotionDiv
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-3 sm:p-4"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-luxury-gold to-luxury-amber rounded-full flex items-center justify-center shadow-lg">
                  <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 bg-gradient-to-r from-luxury-gold-light to-luxury-amber bg-clip-text text-transparent">{feature.title}</h3>
                <p className="text-gray-400 text-xs sm:text-sm">{feature.description}</p>
              </MotionDiv>
            ) : (
              <div
                key={index}
                className="text-center p-3 sm:p-4"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-luxury-gold to-luxury-amber rounded-full flex items-center justify-center shadow-lg">
                  <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 bg-gradient-to-r from-luxury-gold-light to-luxury-amber bg-clip-text text-transparent">{feature.title}</h3>
                <p className="text-gray-400 text-xs sm:text-sm">{feature.description}</p>
              </div>
            )
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Company Info with Luxury Design */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1 mb-6 sm:mb-0">
            <div>
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                  <Image src="/images/shankarmala-logo.png" alt="Shankarmala" fill sizes="(max-width: 640px) 40px, 48px" priority className="object-contain" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">Shankarmala</h2>
                  <p className="text-amber-400 text-xs sm:text-sm">Luxury Gemstones</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                Discover the finest gemstones from our heritage jewelry collection. GIA certified,
                worldwide shipping, and personalized luxury service.
              </p>

              {/* Contact Info with Luxury Design */}
              <div className="space-y-2 sm:space-y-3 text-sm">
                <div className="flex items-center space-x-3 text-gray-400">
                  <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">+91 98765 43210</span>
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
            </div>
          </div>

          {/* Footer Links with Luxury Design */}
          {footerSections.map((section, index) => (
            typeof window !== 'undefined' ? (
              <MotionDiv
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="col-span-1"
              >
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 bg-gradient-to-r from-luxury-gold-light to-luxury-amber bg-clip-text text-transparent">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-luxury-gold text-sm sm:text-base transition-colors duration-200 hover:underline"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </MotionDiv>
            ) : (
              <div
                key={section.title}
                className="col-span-1"
              >
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 bg-gradient-to-r from-luxury-gold-light to-luxury-amber bg-clip-text text-transparent">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-luxury-gold text-sm sm:text-base transition-colors duration-200 hover:underline"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          ))}
        </div>

        {/* Social Links and Copyright with Luxury Design */}
        <div className="pt-8 sm:pt-12 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex space-x-4 mb-6 sm:mb-0">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-full bg-gradient-to-r from-luxury-gold to-luxury-amber flex items-center justify-center text-white hover:text-white transition-all duration-200 shadow-lg ${social.color}`}
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
            <div className="text-center sm:text-right">
              <p className="text-gray-400 text-sm">
                © {currentYear} Shankarmala. All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center sm:justify-end gap-4 mt-2 text-xs text-gray-500">
                <Link href="/privacy" className="hover:text-luxury-gold transition-colors hover:underline">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-luxury-gold transition-colors hover:underline">
                  Terms of Service
                </Link>
                <Link href="/accessibility" className="hover:text-luxury-gold transition-colors hover:underline">
                  Accessibility
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;