import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Package, ArrowLeft } from 'lucide-react';
import LuxuryButton from '../components/ui/LuxuryButton';
import LuxuryCard from '../components/ui/LuxuryCard';

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

  if (loading) return <div className="text-center py-8 text-lg luxury-font-sans">Loading your orders...</div>;
  if (error) return <div className="text-center py-8 text-red-600 luxury-font-sans">{error}</div>;
  if (!orders || orders.length === 0)
    return <div className="text-center py-8 text-gray-500 luxury-font-sans">No orders found.</div>;

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
            if (item.gemstone.images.trim().length > 0) {
              imgs = item.gemstone.images.split(',').map((img) => img.trim());
            } else {
              imgs = [];
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
        <h1 className="text-4xl font-bold text-amber-900 mb-8 text-center sm:text-3xl luxury-font-serif">
          My Orders
        </h1>
        <Link href="/account">
          <LuxuryButton variant="secondary" size="md" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Account
          </LuxuryButton>
        </Link>

        {!isAuthenticated && (
          <LuxuryCard className="mb-8 p-6 text-center">
            <div className="text-amber-800 mb-4 text-base sm:text-sm luxury-font-sans">
              <strong>Demo Mode:</strong> You&apos;re viewing sample orders. In a real application,
              you would need to be logged in to view your orders.
            </div>
            <Link href="/login">
              <LuxuryButton variant="primary" size="lg">
                Login to View Real Orders
              </LuxuryButton>
            </Link>
          </LuxuryCard>
        )}

        {error ? (
          <div className="text-center text-red-600 text-base sm:text-sm luxury-font-sans">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-4 sm:text-base luxury-font-sans">You have no orders yet.</div>
            <Link href="/shop">
              <LuxuryButton variant="primary" size="lg">
                Start Shopping
              </LuxuryButton>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block"
                onClick={() => handleOrderClick(order.id)}
              >
                <LuxuryCard className="p-8 hover:shadow-2xl transition sm:p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2 sm:gap-1">
                    <div className="text-lg font-semibold text-amber-900 sm:text-base luxury-font-serif">
                      Order #{order.id}
                    </div>
                    <div className="text-sm text-gray-500 sm:text-xs luxury-font-sans">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    <div
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        order.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-700'
                          : order.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-500'
                      } luxury-font-sans`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                    <div className="text-lg font-bold text-amber-900 sm:text-base luxury-font-serif">
                      ₹{order.total.toLocaleString('en-IN')}
                    </div>
                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                      <button className="luxury-button-primary px-4 py-2 text-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {order.items.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex flex-col items-center">
                        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={(() => {
                              let imgs: string[] = [];
                              if (Array.isArray(item.gemstone.images)) {
                                imgs = item.gemstone.images;
                              } else if (typeof item.gemstone.images === 'string') {
                                if (item.gemstone.images.trim().length > 0) {
                                  imgs = item.gemstone.images.split(',').map((img) => img.trim());
                                } else {
                                  imgs = [];
                                }
                              }
                              return imgs[0] || '/images/placeholder-gemstone.jpg';
                            })()}
                            alt={item.gemstone.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="text-xs text-gray-600 mt-1 text-center luxury-font-sans">
                          {item.quantity}x
                        </span>
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center">
                          <span className="text-amber-700 font-bold text-sm luxury-font-sans">
                            +{order.items.length - 4}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </LuxuryCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrdersPage;