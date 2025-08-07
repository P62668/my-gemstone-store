import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

const OrderDetailsPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emailWarning, setEmailWarning] = useState('');

  useEffect(() => {
    if (!id) return;
    // Check for email warning in query (e.g., after redirect from checkout)
    if (router.query.emailWarning) {
      setEmailWarning('Order placed, but confirmation email could not be sent.');
    }
    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/orders/${id}?history=1`, { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch order');
        setOrder(data.order);
        setHistory(data.history || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, router.query.emailWarning]);

  if (loading) return <div className="text-center py-12 text-lg">Loading order details...</div>;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;
  if (!order) return null;

  // Progress bar steps
  const steps = [
    { key: 'pending', label: 'Placed', icon: '📝' },
    { key: 'processing', label: 'Processing', icon: '⚙️' },
    { key: 'shipped', label: 'Shipped', icon: '📦' },
    { key: 'delivered', label: 'Delivered', icon: '✅' },
    { key: 'cancelled', label: 'Cancelled', icon: '❌' },
  ];
  const statusIndex = steps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'cancelled';

  const handleDownloadInvoice = () => {
    toast.success('Invoice download started!');
  };

  return (
    <Layout title={`Order #${order.id} - Details`}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {steps.map((step, i) => (
            <div key={step.key} className="flex-1 flex flex-col items-center">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full text-2xl font-bold border-2 transition-all duration-300
                  ${
                    i < statusIndex && !isCancelled
                      ? 'bg-green-100 border-green-500 text-green-700'
                      : i === statusIndex && !isCancelled
                        ? 'bg-green-500 border-green-700 text-white'
                        : isCancelled && step.key === 'cancelled'
                          ? 'bg-red-500 border-red-700 text-white'
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
              >
                {step.icon}
              </div>
              <div
                className={`mt-2 text-xs font-semibold ${i <= statusIndex && !isCancelled ? 'text-green-700' : isCancelled && step.key === 'cancelled' ? 'text-red-700' : 'text-gray-400'}`}
              >
                {step.label}
              </div>
            </div>
          ))}
        </div>
        {/* Progress line */}
        <div className="relative h-2 mt-2 mb-4">
          <div
            className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 rounded-full"
            style={{ zIndex: 0 }}
          />
          <div
            className="absolute top-1/2 h-1 bg-green-500 rounded-full transition-all duration-500"
            style={{
              left: 0,
              right: `${100 - (isCancelled ? 100 : (statusIndex / (steps.length - 2)) * 100)}%`,
              zIndex: 1,
            }}
          />
        </div>
      </div>
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-2">
        {emailWarning && (
          <div
            className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-yellow-800 text-center text-sm"
            role="alert"
          >
            {emailWarning}
          </div>
        )}
        <h1 className="text-4xl font-bold text-amber-900 mb-6 sm:text-2xl sm:mb-4 text-center">
          Order #{order.id}
        </h1>
        <div className="mb-4 text-gray-600 sm:text-xs text-center">
          Placed on {new Date(order.createdAt).toLocaleString()}
        </div>
        <div className="mb-4">
          <span
            className={`inline-block px-3 py-1 rounded-full font-bold text-sm sm:text-xs ${
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
        </div>
        <div className="mb-8 text-lg font-bold text-amber-900 sm:text-base">
          Total: ₹{order.total.toLocaleString('en-IN')}
        </div>
        <h2 className="text-2xl font-semibold text-amber-900 mb-4 sm:text-lg">Items</h2>
        <ul className="divide-y divide-amber-100 mb-8 overflow-x-auto flex-nowrap">
          {order.items.map((item: any) => (
            <li key={item.id} className="flex items-center gap-4 py-4 sm:gap-2 sm:py-2">
              <img
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
                onError={(e) => {
                  e.currentTarget.src = '/images/placeholder-gemstone.jpg';
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
        <h2 className="text-2xl font-semibold text-amber-900 mb-4 sm:text-lg">Order Timeline</h2>
        <ul className="mb-8">
          {history.map((h, i) => (
            <li key={h.id} className="flex items-center gap-4 py-2 sm:gap-2 sm:py-1">
              <span className="text-xs text-gray-500">
                {new Date(h.createdAt).toLocaleString()}
              </span>
              <span className="inline-block px-2 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                {h.status.charAt(0).toUpperCase() + h.status.slice(1)}
              </span>
              <span className="text-xs text-gray-400">by {h.changedBy}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-2 items-center justify-center">
          <button
            onClick={() => router.push('/orders')}
            className="bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition mr-0 sm:mr-4 text-base sm:text-sm"
          >
            Back to My Orders
          </button>
          <a
            href={`/api/orders/${order.id}/invoice`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition text-base sm:text-sm"
            onClick={handleDownloadInvoice}
          >
            Download Invoice (PDF)
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetailsPage;
