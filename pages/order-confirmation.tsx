import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { CheckCircle, Truck, CreditCard, DollarSign, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface OrderItem {
  id: number;
  gemstoneId: number;
  quantity: number;
  price: number;
  gemstone: {
    name: string;
    images: string[];
  };
}

interface Order {
  id: number;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
}

const OrderConfirmationPage: React.FC = () => {
  const router = useRouter();
  const { orderId } = router.query;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${orderId}`, { credentials: 'include' });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch order details (${res.status})`);
      }
      const data = await res.json();
      setOrder(data);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load order details. Please try again.';
      setError(errorMsg);
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Order Confirmation - Shankarmala Gemstore">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout title="Order Confirmation - Shankarmala Gemstore">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Order</h1>
            <p className="text-gray-600 mb-6">{error || 'Order details could not be loaded.'}</p>
            <Link 
              href="/shop" 
              className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const isCOD = order.paymentMethod === 'cod';

  return (
    <Layout title="Order Confirmation - Shankarmala Gemstore">
      <Head>
        <title>Order Confirmation - Shankarmala Gemstore</title>
        <meta name="description" content="Your order has been successfully placed." />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.div 
              className="flex justify-center mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center border-4 border-green-200">
                <CheckCircle className="w-14 h-14 text-green-600" />
              </div>
            </motion.div>
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Order Confirmed!
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-700 max-w-2xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Thank you for your purchase. Your order has been successfully placed.
            </motion.p>
          </div>

          <motion.div 
            className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-amber-100"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-amber-50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                  <p className="text-gray-600 text-lg">Order #{order.orderNumber}</p>
                </div>
                <div className="flex items-center space-x-3">
                  {isCOD ? (
                    <>
                      <DollarSign className="w-6 h-6 text-green-600" />
                      <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-base font-bold shadow-lg">
                        Cash on Delivery
                      </span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-6 h-6 text-blue-600" />
                      <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full text-base font-bold shadow-lg">
                        Card Payment
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-gray-50 to-amber-50 rounded-2xl p-6 border border-amber-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                    <Truck className="w-6 h-6 mr-3 text-amber-600" />
                    Shipping Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600 text-sm">Order Status</p>
                      <p className="font-bold text-lg capitalize">{order.status}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600 text-sm">Payment Status</p>
                      <p className="font-bold text-lg capitalize">{order.paymentStatus}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600 text-sm">Order Date</p>
                      <p className="font-bold text-lg">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-amber-50 rounded-2xl p-6 border border-amber-100">
                  <h3 className="font-bold text-gray-900 mb-4 text-lg">Order Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-bold text-lg">₹{order.total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-bold text-lg">Free</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-gray-200">
                      <span className="font-bold text-gray-900 text-xl">Total</span>
                      <span className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                        ₹{order.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-6 text-xl">Items in this order</h3>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center p-5 bg-gradient-to-r from-gray-50 to-amber-50 rounded-2xl border border-amber-100">
                      <div className="flex-shrink-0 w-20 h-20 bg-white rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden">
                        {item.gemstone.images && item.gemstone.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={item.gemstone.images[0]} 
                            alt={item.gemstone.name}
                            className="w-16 h-16 object-contain"
                          />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                        )}
                      </div>
                      <div className="ml-5 flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-lg truncate">{item.gemstone.name}</h4>
                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="font-bold text-gray-900 text-xl">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {isCOD && (
            <motion.div 
              className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-8 mb-8 shadow-lg"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mr-6 border-2 border-green-200">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-green-800 text-2xl mb-5">Cash on Delivery Instructions</h3>
                  <div className="bg-white border-2 border-green-200 rounded-2xl p-6 mb-6 shadow-sm">
                    <h4 className="font-bold text-green-800 text-lg mb-4 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-3" />
                      Payment Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200">
                        <p className="text-sm text-green-600">Amount to Pay</p>
                        <p className="font-bold text-green-800 text-2xl">₹{order.total.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200">
                        <p className="text-sm text-green-600">Order Number</p>
                        <p className="font-bold text-green-800 text-2xl">#{order.orderNumber}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border-2 border-green-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="font-bold text-green-800 text-lg mb-5 flex items-center">
                      <Info className="w-5 h-5 mr-3" />
                      Delivery Instructions
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200">
                        <div className="flex items-center mb-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-green-800 font-bold">1</span>
                          </div>
                          <h5 className="font-bold text-green-800">Prepare Payment</h5>
                        </div>
                        <p className="text-green-700">
                          Have exact cash amount ready: ₹{order.total.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200">
                        <div className="flex items-center mb-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-green-800 font-bold">2</span>
                          </div>
                          <h5 className="font-bold text-green-800">Order Information</h5>
                        </div>
                        <p className="text-green-700">
                          Keep your order number handy: #{order.orderNumber}
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200">
                        <div className="flex items-center mb-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-green-800 font-bold">3</span>
                          </div>
                          <h5 className="font-bold text-green-800">Availability</h5>
                        </div>
                        <p className="text-green-700">
                          Ensure someone is available to receive the package
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200">
                        <div className="flex items-center mb-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-green-800 font-bold">4</span>
                          </div>
                          <h5 className="font-bold text-green-800">Inspection</h5>
                        </div>
                        <p className="text-green-700">
                          Inspect package before paying. Return policy applies after payment
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-5 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border-2 border-green-200">
                    <p className="text-green-800 font-bold text-lg">
                      <CheckCircle className="w-5 h-5 inline mr-2" />
                      Your order will be processed once payment is received
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div 
            className="text-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Link 
              href="/shop" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 font-bold text-lg shadow-lg transform hover:scale-105 mr-4"
            >
              Continue Shopping
            </Link>
            <Link 
              href="/account/orders" 
              className="inline-flex items-center px-8 py-4 bg-white text-amber-600 border-2 border-amber-200 rounded-2xl hover:bg-amber-50 transition-all duration-200 font-bold text-lg shadow-lg transform hover:scale-105"
            >
              View All Orders
            </Link>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmationPage;