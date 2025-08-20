import React from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { FileText, Scale, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';

const TermsPage: React.FC = () => {
  const sections = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Acceptance of Terms',
      content:
        'By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'User Accounts',
      content:
        'You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password.',
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: 'Product Information',
      content:
        'We strive to provide accurate product information, but we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.',
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Order Acceptance',
      content:
        'All orders are subject to acceptance and availability. We reserve the right to refuse service to anyone for any reason at any time.',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Shipping & Delivery',
      content:
        'Delivery times are estimates only. We are not responsible for delays beyond our control. Risk of loss and title for items pass to you upon delivery.',
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: 'Returns & Refunds',
      content:
        'Returns must be made within 30 days of delivery. Items must be in original condition. Refunds will be processed within 5-7 business days.',
    },
  ];

  return (
    <Layout
      title="Terms of Service - Shankarmala"
      description="Read our terms of service and understand your rights and responsibilities when using Shankarmala."
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-yellow-50 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Terms of Service</h1>
            <p className="text-xl text-gray-600 mb-8">
              Please read these terms carefully before using our services.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>Last Updated: August 11, 2025</span>
              <span>•</span>
              <span>Effective Date: August 11, 2025</span>
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

          {/* Additional Terms */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 bg-gray-50 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Additional Terms</h3>
            <div className="space-y-4 text-gray-600">
              <p>
                <strong>Intellectual Property:</strong> All content on this website, including text,
                graphics, logos, and images, is the property of Shankarmala and is protected by
                copyright laws.
              </p>
              <p>
                <strong>Limitation of Liability:</strong> Shankarmala shall not be liable for any
                indirect, incidental, special, consequential, or punitive damages resulting from
                your use of our services.
              </p>
              <p>
                <strong>Governing Law:</strong> These terms shall be governed by and construed in
                accordance with the laws of India, without regard to its conflict of law provisions.
              </p>
              <p>
                <strong>Changes to Terms:</strong> We reserve the right to modify these terms at any
                time. Changes will be effective immediately upon posting on the website.
              </p>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl p-8 text-center text-white"
          >
            <h3 className="text-2xl font-bold mb-4">Questions About These Terms?</h3>
            <p className="text-amber-100 mb-6">
              If you have any questions about these terms of service, please contact our legal team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:legal@shankarmala.com"
                className="bg-white text-amber-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Contact Legal Team
              </a>
              <Link
                href="/contact"
                className="border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-amber-600 transition-colors"
              >
                General Contact
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default TermsPage;
