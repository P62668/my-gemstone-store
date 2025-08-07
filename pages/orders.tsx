import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  gemstone: {
    id: number;
    name: string;
    images: string;
  };
}

interface Order {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders', { credentials: 'include' });
        if (res.status === 401) {
          setIsAuthenticated(false);
          setOrders([]);
        } else if (res.ok) {
          setIsAuthenticated(true);
          const data = await res.json();
          setOrders(data);
        } else {
          throw new Error('Failed to fetch orders');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="text-center py-8 text-lg">Loading your orders...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (!orders || orders.length === 0)
    return <div className="text-center py-8 text-gray-500">No orders found.</div>;

  const handleOrderClick = (orderId: number) => {
    toast('Viewing order details...');
  };

  // SEO structured data (JSON-LD)
  const seoJsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Order',
    name: 'My Orders - Shankarmala Gemstore',
    description:
      'View your gemstone orders at Shankarmala Gemstore. Track status, view details, and reorder.',
    url: 'https://shankarmala.com/orders',
    orderNumber: orders.map((o) => o.id),
    orderStatus: orders.map((o) => o.status),
    orderedItem: orders.flatMap((o) =>
      o.items.map((item) => ({
        '@type': 'Product',
        name: item.gemstone.name,
        image: (() => {
          let imgs: string[] = [];
          if (Array.isArray(item.gemstone.images)) {
            imgs = item.gemstone.images;
          } else if (typeof item.gemstone.images === 'string') {
            try {
              const parsed = JSON.parse(item.gemstone.images);
              if (Array.isArray(parsed)) imgs = parsed;
              else if (typeof parsed === 'string') imgs = [parsed];
              else imgs = [];
            } catch {
              if (item.gemstone.images.trim().length > 0) imgs = [item.gemstone.images.trim()];
              else imgs = [];
            }
          }
          return imgs[0] || '/images/placeholder-gemstone.jpg';
        })(),
        sku: item.gemstone.id,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: item.price,
          availability: 'https://schema.org/InStock',
        },
      })),
    ),
  };

  return (
    <Layout title="My Orders - Kolkata Gems">
      <Head>
        <title>My Orders - Shankarmala Gemstore</title>
        <meta
          name="description"
          content="View your gemstone orders at Shankarmala Gemstore. Track status, view details, and reorder."
        />
        <meta property="og:title" content="My Orders - Shankarmala Gemstore" />
        <meta
          property="og:description"
          content="View your gemstone orders at Shankarmala Gemstore. Track status, view details, and reorder."
        />
        <meta property="og:image" content="/images/placeholder-gemstone.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shankarmala.com/orders" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="My Orders - Shankarmala Gemstore" />
        <meta
          name="twitter:description"
          content="View your gemstone orders at Shankarmala Gemstore."
        />
        <meta name="twitter:image" content="/images/placeholder-gemstone.jpg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(seoJsonLd) }}
        />
      </Head>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-2">
        <h1 className="text-4xl font-bold text-amber-900 mb-8 text-center sm:text-3xl">
          My Orders
        </h1>
        <Link
          href="/account"
          className="inline-block mb-6 text-amber-700 hover:text-amber-900 font-semibold text-sm bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 transition"
        >
          ← Back to Account
        </Link>

        {!isAuthenticated && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8 text-center">
            <div className="text-amber-800 mb-4 text-base sm:text-sm">
              <strong>Demo Mode:</strong> You&apos;re viewing sample orders. In a real application,
              you would need to be logged in to view your orders.
            </div>
            <Link
              href="/login"
              className="bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition text-base sm:text-sm"
            >
              Login to View Real Orders
            </Link>
          </div>
        )}

        {error ? (
          <div className="text-center text-red-600 text-base sm:text-sm">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-4 sm:text-base">You have no orders yet.</div>
            <Link
              href="/shop"
              className="bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition text-base sm:text-sm"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white/80 rounded-3xl shadow-xl border border-amber-100 p-8 hover:shadow-2xl hover:border-amber-300 transition sm:p-4"
                onClick={() => handleOrderClick(order.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2 sm:gap-1">
                  <div className="text-lg font-semibold text-amber-900 sm:text-base">
                    Order #{order.id}
                  </div>
                  <div className="text-sm text-gray-500 sm:text-xs">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      order.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-700'
                        : order.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                  <div className="text-lg font-bold text-amber-900 sm:text-base">
                    ₹{order.total.toLocaleString('en-IN')}
                  </div>
                  <div className="flex items-center gap-2 mt-2 md:mt-0">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/orders/${order.id}`;
                      }}
                      className="bg-amber-600 text-white px-3 py-1 rounded-lg font-semibold text-xs shadow hover:bg-amber-700 transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
                <ul className="divide-y divide-amber-100 overflow-x-auto flex-nowrap">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-4 py-4 sm:gap-2 sm:py-2">
                      <img
                        src={
                          item.gemstone.images && item.gemstone.images.length > 0
                            ? Array.isArray(item.gemstone.images)
                              ? item.gemstone.images[0]
                              : typeof item.gemstone.images === 'string'
                                ? item.gemstone.images
                                : '/images/placeholder.svg'
                            : '/images/placeholder.svg'
                        }
                        alt={item.gemstone.name}
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder.svg';
                        }}
                        className="w-16 h-16 object-cover rounded sm:w-12 sm:h-12"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-lg text-amber-900 sm:text-base">
                          {item.gemstone.name}
                        </div>
                        <div className="text-amber-700 font-bold sm:text-sm">
                          ₹{item.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="text-gray-700 sm:text-sm">x{item.quantity}</div>
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrdersPage;
