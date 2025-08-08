import React from 'react';

interface OrderTrackingProps {
  status: string;
  orderId: number;
  createdAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  courierName?: string;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({
  status,
  orderId,
  createdAt,
  estimatedDelivery,
  trackingNumber,
  courierName,
}) => {
  const getStatusInfo = (currentStatus: string) => {
    const statuses = {
      pending: {
        title: 'Order Placed',
        description: 'Your order has been successfully placed and is being processed.',
        icon: '📝',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300',
      },
      processing: {
        title: 'Processing',
        description: 'We are preparing your order for shipment.',
        icon: '⚙️',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-300',
      },
      shipped: {
        title: 'Shipped',
        description: 'Your order has been shipped and is on its way to you.',
        icon: '📦',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-300',
      },
      delivered: {
        title: 'Delivered',
        description: 'Your order has been successfully delivered.',
        icon: '✅',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300',
      },
      cancelled: {
        title: 'Cancelled',
        description: 'Your order has been cancelled.',
        icon: '❌',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300',
      },
      paid: {
        title: 'Payment Confirmed',
        description: 'Payment has been confirmed and your order is being processed.',
        icon: '💰',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300',
      },
    };

    return statuses[currentStatus as keyof typeof statuses] || statuses.pending;
  };

  const getProgressSteps = () => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: '📝' },
      { key: 'paid', label: 'Payment Confirmed', icon: '💰' },
      { key: 'processing', label: 'Processing', icon: '⚙️' },
      { key: 'shipped', label: 'Shipped', icon: '📦' },
      { key: 'delivered', label: 'Delivered', icon: '✅' },
    ];

    const currentIndex = steps.findIndex((step) => step.key === status);
    const isCancelled = status === 'cancelled';

    return { steps, currentIndex, isCancelled };
  };

  const { steps, currentIndex, isCancelled } = getProgressSteps();
  const statusInfo = getStatusInfo(status);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Order Tracking</h3>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.bgColor} ${statusInfo.color}`}
        >
          {statusInfo.title}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold border-2 transition-all duration-300 ${
                  index <= currentIndex && !isCancelled
                    ? 'bg-green-500 border-green-600 text-white'
                    : isCancelled && step.key === 'cancelled'
                      ? 'bg-red-500 border-red-600 text-white'
                      : 'bg-gray-200 border-gray-300 text-gray-500'
                }`}
              >
                {step.icon}
              </div>
              <div
                className={`mt-1 text-xs font-medium text-center ${
                  index <= currentIndex && !isCancelled
                    ? 'text-green-600'
                    : isCancelled && step.key === 'cancelled'
                      ? 'text-red-600'
                      : 'text-gray-400'
                }`}
              >
                {step.label}
              </div>
            </div>
          ))}
        </div>

        {/* Progress Line */}
        <div className="relative h-1 bg-gray-200 rounded-full">
          <div
            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
              isCancelled ? 'bg-red-500' : 'bg-green-500'
            }`}
            style={{
              width: isCancelled
                ? '100%'
                : `${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Status Information */}
      <div className={`p-4 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor} mb-4`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">{statusInfo.icon}</span>
          <div>
            <h4 className={`font-semibold ${statusInfo.color}`}>{statusInfo.title}</h4>
            <p className="text-gray-700 text-sm mt-1">{statusInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h5 className="font-semibold text-gray-900 mb-2">Order Information</h5>
          <div className="space-y-1 text-gray-600">
            <p>
              <span className="font-medium">Order ID:</span> #{orderId}
            </p>
            <p>
              <span className="font-medium">Order Date:</span>{' '}
              {new Date(createdAt).toLocaleDateString()}
            </p>
            {estimatedDelivery && (
              <p>
                <span className="font-medium">Estimated Delivery:</span>{' '}
                {new Date(estimatedDelivery).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {trackingNumber && courierName && (
          <div>
            <h5 className="font-semibold text-gray-900 mb-2">Shipping Information</h5>
            <div className="space-y-1 text-gray-600">
              <p>
                <span className="font-medium">Courier:</span> {courierName}
              </p>
              <p>
                <span className="font-medium">Tracking Number:</span> {trackingNumber}
              </p>
              <a
                href={`https://tracking.com/${trackingNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline text-xs"
              >
                Track Package →
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Additional Information */}
      {status === 'shipped' && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            📦 Your package is on its way! You'll receive updates as it moves through our delivery
            network.
          </p>
        </div>
      )}

      {status === 'delivered' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">
            ✅ Your order has been delivered! Please check your package and let us know if you have
            any questions.
          </p>
        </div>
      )}

      {status === 'cancelled' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">
            ❌ Your order has been cancelled. If you have any questions, please contact our support
            team.
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
