import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface InventoryItem {
  id: number;
  name: string;
  type: string;
  price: number;
  stockCount: number;
  lowStockThreshold: number;
  sku: string | null;
  category: { name: string } | null;
  active: boolean;
}

interface InventoryStats {
  totalProducts: number;
  totalStock: number;
  averageStock: number;
  lowStockCount: number;
  outOfStockCount: number;
}

const InventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'lowStock' | 'outOfStock'>('all');
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    stockCount: 0,
    lowStockThreshold: 5,
    sku: '',
  });

  useEffect(() => {
    fetchInventory();
  }, [filter]);

  const fetchInventory = async () => {
    try {
      const params = new URLSearchParams();
      if (filter === 'lowStock') params.append('lowStock', 'true');
      if (filter === 'outOfStock') params.append('outOfStock', 'true');

      const res = await fetch(`/api/admin/inventory?${params}`);
      const data = await res.json();

      setInventory(data.gemstones);
      setStats(data.stats);
    } catch (error) {
      toast.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item.id);
    setEditForm({
      stockCount: item.stockCount,
      lowStockThreshold: item.lowStockThreshold,
      sku: item.sku || '',
    });
  };

  const handleSave = async (id: number) => {
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          ...editForm,
        }),
      });

      if (res.ok) {
        toast.success('Inventory updated successfully');
        setEditingItem(null);
        fetchInventory();
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      toast.error('Failed to update inventory');
    }
  };

  const handleBulkUpdate = async (action: 'add' | 'subtract' | 'set', quantity: number) => {
    const selectedItems = inventory.filter((item) => item.stockCount > 0);
    if (selectedItems.length === 0) {
      toast.error('No items selected for bulk update');
      return;
    }

    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          gemstoneIds: selectedItems.map((item) => item.id),
          quantity,
        }),
      });

      if (res.ok) {
        toast.success('Bulk update completed');
        fetchInventory();
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      toast.error('Failed to perform bulk update');
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Inventory Management">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inventory...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Inventory Management">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Inventory Management</h1>
          <p className="text-gray-600">Manage your gemstone inventory and stock levels</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 border border-amber-200"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl font-bold text-amber-600">{stats.totalProducts}</div>
              <div className="text-sm text-gray-600">Total Products</div>
            </motion.div>
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 border border-amber-200"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl font-bold text-green-600">{stats.totalStock}</div>
              <div className="text-sm text-gray-600">Total Stock</div>
            </motion.div>
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 border border-amber-200"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(stats.averageStock)}
              </div>
              <div className="text-sm text-gray-600">Average Stock</div>
            </motion.div>
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 border border-amber-200"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl font-bold text-yellow-600">{stats.lowStockCount}</div>
              <div className="text-sm text-gray-600">Low Stock</div>
            </motion.div>
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 border border-amber-200"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl font-bold text-red-600">{stats.outOfStockCount}</div>
              <div className="text-sm text-gray-600">Out of Stock</div>
            </motion.div>
          </div>
        )}

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-4 py-2 border border-amber-200 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">All Items</option>
                <option value="lowStock">Low Stock</option>
                <option value="outOfStock">Out of Stock</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkUpdate('add', 1)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                +1 All
              </button>
              <button
                onClick={() => handleBulkUpdate('subtract', 1)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                -1 All
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-amber-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Threshold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.type}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.category?.name || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.sku || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingItem === item.id ? (
                        <input
                          type="number"
                          value={editForm.stockCount}
                          onChange={(e) =>
                            setEditForm({ ...editForm, stockCount: parseInt(e.target.value) })
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span
                          className={`text-sm font-medium ${
                            item.stockCount === 0
                              ? 'text-red-600'
                              : item.stockCount <= item.lowStockThreshold
                                ? 'text-yellow-600'
                                : 'text-green-600'
                          }`}
                        >
                          {item.stockCount}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingItem === item.id ? (
                        <input
                          type="number"
                          value={editForm.lowStockThreshold}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              lowStockThreshold: parseInt(e.target.value),
                            })
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-sm text-gray-900">{item.lowStockThreshold}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.stockCount === 0
                            ? 'bg-red-100 text-red-800'
                            : item.stockCount <= item.lowStockThreshold
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {item.stockCount === 0
                          ? 'Out of Stock'
                          : item.stockCount <= item.lowStockThreshold
                            ? 'Low Stock'
                            : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingItem === item.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(item.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-amber-600 hover:text-amber-900"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default InventoryPage;
