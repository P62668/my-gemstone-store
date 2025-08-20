import React from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Users, Bell } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  const sections = [
    {
      icon: <Database className="w-6 h-6" />,
      title: 'Information We Collect',
      content:
        'We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This may include your name, email address, phone number, shipping address, and payment information.',
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: 'How We Use Your Information',
      content:
        'We use the information we collect to process your orders, communicate with you about your purchases, provide customer support, and improve our services. We may also use your information to send you marketing communications with your consent.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Information Sharing',
      content:
        'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information with trusted third-party service providers who assist us in operating our website and serving you.',
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Data Security',
      content:
        'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Your Rights',
      content:
        'You have the right to access, update, or delete your personal information. You may also opt out of marketing communications at any time. Contact us to exercise these rights.',
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: 'Updates to This Policy',
      content:
        "We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the 'Last Updated' date.",
    },
  ];

  return (
    <Layout
      title="Privacy Policy - Shankarmala"
      description="Learn how we protect your privacy and handle your personal information at Shankarmala."
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-yellow-50 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
            <p className="text-xl text-gray-600 mb-8">
              Your privacy is important to us. Learn how we collect, use, and protect your personal
              information.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>Last Updated: August 11, 2025</span>
              <span>•</span>
              <span>Version 1.0</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-8"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{section.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl p-8 text-center text-white"
          >
            <h3 className="text-2xl font-bold mb-4">Questions About Your Privacy?</h3>
            <p className="text-amber-100 mb-6">
              If you have any questions about this privacy policy or our data practices, please
              contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:privacy@shankarmala.com"
                className="bg-white text-amber-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Email Us
              </a>
              <Link
                href="/contact"
                className="border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-amber-600 transition-colors"
              >
                Contact Form
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPage;
