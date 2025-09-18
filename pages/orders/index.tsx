import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders', { credentials: 'include' });
        const data = await res.json();
        
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error(data.error || 'Failed to fetch orders');
        }
        
        setOrders(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  if (loading) {
    return (
      <Layout title="My Orders - Gemstone Store">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="My Orders - Gemstone Store">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-red-100 border border-red-300 text-red-800 px-6 py-4 rounded-xl text-center font-semibold shadow">
            {error}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Orders - Gemstone Store">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">My Orders</h1>
          <p className="text-gray-600">View and manage your order history</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <Link 
              href="/shop" 
              className="inline-block bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-amber-900">Order #{order.id}</h3>
                      <p className="text-gray-600 text-sm">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          order.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : order.status === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : order.status === 'shipped'
                                ? 'bg-blue-100 text-blue-700'
                                : order.status === 'delivered'
                                  ? 'bg-green-100 text-green-700'
                                  : order.status === 'cancelled'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="text-lg font-bold text-amber-900">
                        ₹{order.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Items</h4>
                    <div className="flex overflow-x-auto pb-2 -mx-1">
                      {order.items.slice(0, 4).map((item: any) => (
                        <div key={item.id} className="flex-shrink-0 mx-1">
                          <div className="w-16 h-16 relative">
                            <Image
                              src={(() => {
                                let imgs = item.gemstone.images;
                                if (typeof imgs === 'string') {
                                  try {
                                    imgs = JSON.parse(imgs);
                                  } catch {
                                    imgs = [imgs];
                                  }
                                }
                                if (!Array.isArray(imgs)) imgs = [];
                                return imgs[0] || '/images/placeholder-gemstone.jpg';
                              })()}
                              alt={item.gemstone.name}
                              fill
                              className="object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.src = '/images/placeholder-gemstone.jpg';
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="flex-shrink-0 mx-1">
                          <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded text-gray-500 text-sm">
                            +{order.items.length - 4}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex-1 text-center bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700 transition"
                    >
                      View Details
                    </Link>
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                      <button
                        onClick={async () => {
                          if (!confirm('Are you sure you want to cancel this order?')) return;
                          
                          try {
                            const res = await fetch(`/api/orders/${order.id}`, {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({ status: 'cancelled' }),
                            });
                            
                            if (!res.ok) throw new Error('Failed to cancel order');
                            
                            // Update the order status in state
                            setOrders(orders.map(o => 
                              o.id === order.id ? {...o, status: 'cancelled'} : o
                            ));
                          } catch (error) {
                            alert('Failed to cancel order. Please try again.');
                            console.error('Error cancelling order:', error);
                          }
                        }}
                        className="flex-1 text-center bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrderHistoryPage;