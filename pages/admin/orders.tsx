'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Truck, Package, CreditCard, Shield, Download } from 'lucide-react';

interface OrderItem {
  id: number;
  gemstoneId: number;
  gemstoneName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// CSV export helper
async function exportOrdersToCSV(orders: Order[]) {
  const header = ['Order ID', 'Order Number', 'Customer', 'Email', 'Status', 'Payment Status', 'Payment Method', 'Total', 'Date', 'Items'];
  const rows = orders.map((order) => [
    order.id,
    order.orderNumber,
    order.userName,
    order.userEmail,
    order.status,
    order.paymentStatus,
    order.paymentMethod,
    order.total,
    new Date(order.createdAt).toLocaleString(),
    order.items.map((i) => `${i.gemstoneName} x${i.quantity}`).join('; '),
  ]);
  const csv = [header, ...rows]
    .map((r) =>
      r
        .map(String)
        .map((s) => '"' + s.replace(/"/g, '""') + '"')
        .join(','),
    )
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
  // Dynamically import file-saver only on the client side
  if (typeof window !== 'undefined') {
    const { saveAs } = await import('file-saver');
    saveAs(blob, `orders-export-${new Date().toISOString().slice(0, 10)}.csv`);
  }
}

const OrdersAdmin: React.FC = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    totalValue: 0,
    pending: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  useEffect(() => {
  // server-side guard enforces admin access
  fetchOrders();
  }, [currentPage, filterStatus, filterPaymentStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', ordersPerPage.toString());
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterPaymentStatus !== 'all') params.append('paymentStatus', filterPaymentStatus);

      const res = await fetch(`/api/admin/orders?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();

      // Transform the data to match our interface
      const transformedOrders: Order[] = data.orders.map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.user?.id || 0,
        userName: order.customerName,
        userEmail: order.user?.email || 'N/A',
        items: order.items.map((item: any) => ({
          id: item.id,
          gemstoneId: item.gemstone?.id || 0,
          gemstoneName: item.gemstone?.name || 'Unknown',
          quantity: item.quantity,
          price: item.price,
        })),
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        trackingNumber: order.trackingNumber,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }));

      setOrders(transformedOrders);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: Order['status']) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}: Failed to update order status`);
      }

      const updatedOrder = await res.json();
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: updatedOrder.status } : order,
        ),
      );
      setSuccess('Order status updated successfully!');
      fetchOrders(); // Refresh stats
    } catch (error) {
      console.error('Failed to update order status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update order status');
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesPaymentStatus = filterPaymentStatus === 'all' || order.paymentStatus === filterPaymentStatus;
    const matchesSearch =
      order.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toString().includes(searchQuery);
    return matchesStatus && matchesPaymentStatus && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const paymentStatusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  };

  const statusIcons = {
    pending: '⏳',
    processing: '⚙️',
    shipped: '📦',
    delivered: '✅',
    cancelled: '❌',
  };

  const paymentMethodIcons = {
    card: <CreditCard className="w-4 h-4" />,
    paypal: <span className="font-bold">P</span>,
    razorpay: <span className="font-bold">R</span>,
    cod: <span className="font-bold">COD</span>,
  };

  if (loading) {
    return (
      <AdminLayout title="Orders Management - Shankarmala">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-4">📦</div>
            <div className="text-2xl font-bold text-amber-900 mb-2">Loading Orders...</div>
            <div className="text-amber-600">Please wait while we fetch your orders</div>
          </motion.div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Orders Management - Shankarmala">
        <div className="max-w-2xl w-full mx-auto py-12 px-4">
          <div className="bg-red-100 border border-red-300 text-red-800 px-6 py-6 rounded-xl text-center font-semibold shadow mb-6">
            <div className="text-5xl mb-2">❌</div>
            <div className="text-2xl font-bold text-red-700 mb-2">Error Loading Orders</div>
            <div className="text-red-800 mb-4">{error}</div>
            <button
              onClick={fetchOrders}
              className="bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <AdminLayout title="Orders Management - Shankarmala">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-4">📦</div>
            <div className="text-2xl font-bold text-amber-900 mb-2">No Orders Found</div>
            <div className="text-amber-600">
              Your orders will appear here once customers start shopping
            </div>
          </motion.div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Orders Management - Shankarmala">
      <div className="max-w-7xl mx-auto py-12 px-4">
        {(error || success) && (
          <div className={`rounded-xl p-4 mb-6 font-semibold text-center shadow border ${error ? 'bg-red-100 border-red-300 text-red-800' : 'bg-green-100 border-green-300 text-green-800'}`}>
            {error || success}
          </div>
        )}
        {/* Header */}
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-4xl font-bold text-amber-900 mb-4 font-serif">
              📦 Orders Management
            </h1>
            <p className="text-lg text-amber-600">
              Track and manage customer orders with precision
            </p>
          </div>
          <motion.button
            onClick={fetchOrders}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>🔄</span>
            <span>Refresh Orders</span>
          </motion.button>
          <motion.button
            onClick={() => exportOrdersToCSV(orders)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 ml-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>⬇️</span>
            <span>Export CSV</span>
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-6 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-amber-900">{orders.length}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Delivered</p>
                <p className="text-3xl font-bold text-green-900">
                  {orders.filter((o) => o.status === 'delivered').length}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-blue-900">
                  {orders.filter((o) => o.status === 'pending').length}
                </p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-purple-900">
                  ₹{orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}
                </p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          className="bg-white rounded-3xl shadow-xl border border-amber-100 p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-amber-700 mb-2">
                🔍 Search Orders
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer name, email, or order ID"
                className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-amber-700 mb-2">
                📊 Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-amber-600 bg-amber-50 px-4 py-3 rounded-xl w-full text-center">
                <span className="font-semibold">{filteredOrders.length}</span> of{' '}
                <span className="font-semibold">{orders.length}</span> orders
              </div>
            </div>
          </div>
        </motion.div>

        {/* Orders Table */}
        <motion.div
          className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-x-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] sm:min-w-[600px] text-sm sm:text-xs">
              <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900 sm:px-2 sm:py-2">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900 sm:px-2 sm:py-2">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900 sm:px-2 sm:py-2">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900 sm:px-2 sm:py-2">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900 sm:px-2 sm:py-2">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900 sm:px-2 sm:py-2">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900 sm:px-2 sm:py-2">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {currentOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-amber-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 sm:px-2 sm:py-2 font-semibold text-amber-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 sm:px-2 sm:py-2">
                      <div className="font-semibold text-amber-900 sm:text-xs">
                        {order.userName}
                      </div>
                      <div className="text-xs text-amber-600">{order.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 sm:px-2 sm:py-2">
                      <div className="text-sm text-amber-700 sm:text-xs">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-amber-500 mt-1">
                        {order.items.map((item) => item.gemstoneName).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 sm:px-2 sm:py-2 font-semibold text-green-600">
                      ₹{order.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 sm:px-2 sm:py-2">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value as Order['status'])
                        }
                        className="text-xs border border-amber-200 rounded-lg px-2 py-1 focus:ring-amber-500 focus:border-amber-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 sm:px-2 sm:py-2">
                      <div className="text-sm text-amber-700 sm:text-xs">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-amber-500">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 sm:px-2 sm:py-2">
                      <div className="flex space-x-2">
                        <motion.button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}
                          className="text-amber-600 hover:text-amber-900 transition-colors text-lg sm:text-base"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          👁️
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            className="flex justify-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex space-x-2">
              <motion.button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-amber-200 text-amber-700 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
              >
                Previous
              </motion.button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <motion.button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                      : 'border border-amber-200 text-amber-700 hover:bg-amber-50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {page}
                </motion.button>
              ))}

              <motion.button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-amber-200 text-amber-700 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
              >
                Next
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Order Details Modal */}
        <AnimatePresence mode="wait">
          {showOrderDetails && selectedOrder && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6 border-b border-amber-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-amber-900">
                      Order #{selectedOrder.id} Details
                    </h2>
                    <motion.button
                      onClick={() => setShowOrderDetails(false)}
                      className="text-amber-600 hover:text-amber-900 text-2xl"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ✕
                    </motion.button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Customer Info */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4">
                    <h3 className="font-semibold text-amber-900 mb-3">Customer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-amber-600">Name</label>
                        <div className="font-medium text-amber-900">{selectedOrder.userName}</div>
                      </div>
                      <div>
                        <label className="text-sm text-amber-600">Email</label>
                        <div className="font-medium text-amber-900">{selectedOrder.userEmail}</div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-3">Order Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
                        >
                          <div>
                            <div className="font-medium text-amber-900">{item.gemstoneName}</div>
                            <div className="text-sm text-amber-600">Quantity: {item.quantity}</div>
                          </div>
                          <div className="font-semibold text-green-600">
                            ₹{item.price.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-green-900">Total Amount</span>
                      <span className="text-2xl font-bold text-green-600">
                        ₹{selectedOrder.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Order Timeline */}
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-3">Order Timeline</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <div className="font-medium text-amber-900">Order Placed</div>
                          <div className="text-sm text-amber-600">
                            {new Date(selectedOrder.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <div className="font-medium text-amber-900">Last Updated</div>
                          <div className="text-sm text-amber-600">
                            {new Date(selectedOrder.updatedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default OrdersAdmin;

// Server-side guard
import getSessionOrRedirect from '../../utils/withServerAuth';
import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const res = await getSessionOrRedirect(ctx, { requireAdmin: true });
  if ('redirect' in res) return res;
  return { props: {} };
};
