import React from 'react';
import AdminLayout from '../../components/AdminLayout';

const CleanDashboard: React.FC = () => {
  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Clean Dashboard</h1>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600">This is a clean dashboard template.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CleanDashboard;
