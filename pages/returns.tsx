import React from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { RotateCcw, Clock, Shield, Package, CheckCircle, AlertTriangle } from 'lucide-react';

const ReturnsPage: React.FC = () => {
  const returnSteps = [
    {
      step: '1',
      title: 'Initiate Return',
      description: 'Contact us within 30 days of delivery to start your return process',
      icon: <RotateCcw className="w-6 h-6" />,
    },
    {
      step: '2',
      title: 'Get Approval',
      description: "We&apos;ll review your return request and provide a return authorization",
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      step: '3',
      title: 'Ship Back',
      description: 'Package your item securely and ship it back using our prepaid label',
      icon: <Package className="w-6 h-6" />,
    },
    {
      step: '4',
      title: 'Receive Refund',
      description: "Once we receive and inspect your item, we&apos;ll process your refund",
      icon: <Shield className="w-6 h-6" />,
    },
  ];

  const returnPolicy = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: '30-Day Return Window',
      description: 'You have 30 days from the date of delivery to initiate a return',
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: 'Original Condition',
      description: 'Items must be in original condition with all packaging and certificates',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Free Return Shipping',
      description: 'We provide prepaid shipping labels for all approved returns',
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Full Refund',
      description: 'Receive a full refund including original shipping costs',
    },
  ];

  const nonReturnable = [
    'Custom or personalized items',
            "Items marked as &apos;Final Sale&apos;",
    'Damaged items due to customer handling',
    'Items without original packaging',
    'Items missing certificates or documentation',
  ];

  return (
    <Layout
      title="Returns & Refunds - Shankarmala"
      description="Learn about our 30-day return policy, refund process, and how to return your gemstone purchases."
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-yellow-50 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Returns & Refunds</h1>
            <p className="text-xl text-gray-600 mb-8">
              We want you to be completely satisfied with your purchase. Our 30-day return policy
              ensures peace of mind.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>30-Day Return Policy</span>
              <span>•</span>
              <span>Free Return Shipping</span>
              <span>•</span>
              <span>Full Refund Guarantee</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Return Process */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">How Returns Work</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our simple 4-step return process makes it easy to return items you&apos;re not satisfied
              with.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {returnSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-gray-50 rounded-2xl p-8 text-center h-full">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-6">
                    {step.icon}
                  </div>
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Return Policy */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Return Policy</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Understanding our return policy helps ensure a smooth return experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {returnPolicy.map((policy, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-4">
                  {policy.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{policy.title}</h3>
                <p className="text-gray-600 text-sm">{policy.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Non-Returnable Items */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Non-Returnable Items
            </h2>
            <p className="text-xl text-gray-600">
              Some items cannot be returned due to their nature or condition.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-red-50 rounded-2xl p-8 border border-red-200"
          >
            <div className="flex items-center mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600 mr-4" />
              <h3 className="text-xl font-bold text-red-900">Items That Cannot Be Returned</h3>
            </div>
            <ul className="space-y-3">
              {nonReturnable.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-600 mr-3 mt-1">•</span>
                  <span className="text-red-800">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Refund Timeline */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Refund Timeline</h2>
            <p className="text-xl text-gray-600">
              Here&apos;s what to expect when processing your refund.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Return Processing</h3>
              <p className="text-3xl font-bold text-blue-600 mb-2">1-2 Days</p>
              <p className="text-gray-600">
                Once we receive your return, we&apos;ll inspect and process it within 1-2 business days.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Refund Initiated</h3>
              <p className="text-3xl font-bold text-green-600 mb-2">3-5 Days</p>
              <p className="text-gray-600">
                Refunds are typically processed within 3-5 business days after approval.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Funds Available</h3>
              <p className="text-3xl font-bold text-amber-600 mb-2">5-7 Days</p>
              <p className="text-gray-600">
                Depending on your bank, funds may take 5-7 business days to appear in your account.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-amber-500 to-yellow-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Need to Return an Item?
            </h2>
            <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
              Contact our customer service team to start your return process. We&apos;re here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-white text-amber-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Start Return
              </Link>
              <a
                href="mailto:returns@shankarmala.com"
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-amber-600 transition-colors"
              >
                Email Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ReturnsPage;
