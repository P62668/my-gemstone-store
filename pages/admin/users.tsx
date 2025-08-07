import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

const AdminUsersPage: React.FC = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = () => {
    fetchUsers();
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this user?')) return;
    setDeletingId(id);
    try {
      // For demo purposes, simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUsers((users) => users.filter((u) => u.id !== id));
      alert('User deleted successfully!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Admin Users - Kolkata Gems">
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center text-gray-500">Loading users...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admin Users - Kolkata Gems">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900">Admin: User Management</h1>
          <button
            onClick={() => router.push('/admin')}
            className="bg-gray-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-700 transition"
          >
            Back to Dashboard
          </button>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="text-red-800">{error}</div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center text-gray-500">No users found.</div>
        ) : (
          <div className="bg-white/80 rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-amber-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-amber-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-amber-900 font-bold">{user.id}</td>
                      <td className="px-6 py-4 text-sm text-amber-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-amber-900">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="px-3 py-1 rounded-xl bg-red-100 text-red-700 text-xs font-bold border border-red-200 hover:bg-red-200 transition disabled:opacity-50"
                          disabled={deletingId === user.id}
                        >
                          {deletingId === user.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;
