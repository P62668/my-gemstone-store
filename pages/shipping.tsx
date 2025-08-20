import React from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Truck, Clock, Shield, MapPin, Package, CreditCard } from 'lucide-react';

const ShippingPage: React.FC = () => {
  const shippingOptions = [
    {
      name: 'Standard Shipping',
      time: '5-7 business days',
      price: '₹299',
      icon: <Truck className="w-6 h-6" />,
      description: 'Reliable ground shipping across India',
    },
    {
      name: 'Express Shipping',
      time: '2-3 business days',
      price: '₹599',
      icon: <Clock className="w-6 h-6" />,
      description: 'Fast delivery for urgent orders',
    },
    {
      name: 'Premium Shipping',
      time: '1-2 business days',
      price: '₹999',
      icon: <Shield className="w-6 h-6" />,
      description: 'Priority handling with insurance',
    },
  ];

  const features = [
    {
      icon: <Package className="w-6 h-6" />,
      title: 'Secure Packaging',
      description: 'All gemstones are carefully packaged in protective materials',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Insurance Included',
      description: 'All shipments include full insurance coverage',
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Real-time Tracking',
      description: 'Track your order from our facility to your doorstep',
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Free Returns',
      description: '30-day return policy with free return shipping',
    },
  ];

  return (
    <Layout
      title="Shipping Information - Shankarmala"
      description="Learn about our shipping options, delivery times, and packaging for your precious gemstones."
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-yellow-50 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Shipping Information
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              We ensure your precious gemstones reach you safely and securely.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>Free Shipping on Orders Over ₹50,000</span>
              <span>•</span>
              <span>30-Day Return Policy</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Shipping Options */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Shipping Options</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the shipping option that best fits your needs and timeline.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {shippingOptions.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-6">
                  {option.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{option.name}</h3>
                <p className="text-3xl font-bold text-amber-600 mb-2">{option.price}</p>
                <p className="text-gray-600 mb-4">{option.time}</p>
                <p className="text-sm text-gray-500">{option.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Why Choose Our Shipping?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We go above and beyond to ensure your precious gemstones arrive safely.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Areas */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Delivery Areas</h2>
            <p className="text-xl text-gray-600">
              We deliver to all major cities and towns across India.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-gray-50 rounded-2xl p-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Major Cities (1-2 days)</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Mumbai, Maharashtra</li>
                <li>• Delhi, NCR</li>
                <li>• Bangalore, Karnataka</li>
                <li>• Chennai, Tamil Nadu</li>
                <li>• Kolkata, West Bengal</li>
                <li>• Hyderabad, Telangana</li>
                <li>• Pune, Maharashtra</li>
                <li>• Ahmedabad, Gujarat</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-gray-50 rounded-2xl p-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Other Areas (3-7 days)</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Tier 2 & 3 Cities</li>
                <li>• Rural Areas</li>
                <li>• Remote Locations</li>
                <li>• Union Territories</li>
                <li>• North Eastern States</li>
                <li>• Jammu & Kashmir</li>
                <li>• Andaman & Nicobar</li>
                <li>• Lakshadweep</li>
              </ul>
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
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Ready to Order?</h2>
            <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
              Browse our collection and enjoy secure, fast shipping to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="bg-white text-amber-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Shop Now
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-amber-600 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ShippingPage;
