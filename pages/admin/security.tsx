import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import SecurityDashboard from '../../components/admin/SecurityDashboard';
import AdminLayout from '../../components/admin/AdminLayout';
import { logger } from '../../utils/logger';

const SecuritySettings: React.FC = () => {
  const router = useRouter();
  const { session, loading } = useAdminAuth();
  const user = session?.user;
  const [activeTab, setActiveTab] = useState('dashboard');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Security Settings</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`${
                    activeTab === 'dashboard'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Security Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`${
                    activeTab === 'settings'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Security Settings
                </button>
              </nav>
            </div>

            <div className="mt-6">
              {activeTab === 'dashboard' ? (
                <SecurityDashboard />
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h2 className="text-lg leading-6 font-medium text-gray-900">Security Settings</h2>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Configure security parameters for your store</p>
                  </div>
                  <div className="border-t border-gray-200">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-6">
                          <h3 className="text-lg leading-6 font-medium text-gray-900">Rate Limiting</h3>
                          <p className="mt-1 text-sm text-gray-500">Configure request rate limits to prevent abuse</p>
                        </div>
                        
                        <div className="sm:col-span-3">
                          <label htmlFor="apiRateLimit" className="block text-sm font-medium text-gray-700">
                            API Requests per Window
                          </label>
                          <div className="mt-1">
                            <input
                              type="number"
                              id="apiRateLimit"
                              name="apiRateLimit"
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              defaultValue="100"
                            />
                          </div>
                        </div>
                        
                        <div className="sm:col-span-3">
                          <label htmlFor="rateLimitWindow" className="block text-sm font-medium text-gray-700">
                            Rate Limit Window (minutes)
                          </label>
                          <div className="mt-1">
                            <input
                              type="number"
                              id="rateLimitWindow"
                              name="rateLimitWindow"
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              defaultValue="15"
                            />
                          </div>
                        </div>
                        
                        <div className="sm:col-span-6">
                          <h3 className="text-lg leading-6 font-medium text-gray-900 mt-6">Authentication</h3>
                          <p className="mt-1 text-sm text-gray-500">Configure authentication security settings</p>
                        </div>
                        
                        <div className="sm:col-span-3">
                          <label htmlFor="maxLoginAttempts" className="block text-sm font-medium text-gray-700">
                            Max Login Attempts
                          </label>
                          <div className="mt-1">
                            <input
                              type="number"
                              id="maxLoginAttempts"
                              name="maxLoginAttempts"
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              defaultValue="5"
                            />
                          </div>
                        </div>
                        
                        <div className="sm:col-span-3">
                          <label htmlFor="lockoutDuration" className="block text-sm font-medium text-gray-700">
                            Lockout Duration (minutes)
                          </label>
                          <div className="mt-1">
                            <input
                              type="number"
                              id="lockoutDuration"
                              name="lockoutDuration"
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              defaultValue="30"
                            />
                          </div>
                        </div>
                        
                        <div className="sm:col-span-6">
                          <h3 className="text-lg leading-6 font-medium text-gray-900 mt-6">Password Requirements</h3>
                          <p className="mt-1 text-sm text-gray-500">Configure password strength requirements</p>
                        </div>
                        
                        <div className="sm:col-span-3">
                          <label htmlFor="minPasswordLength" className="block text-sm font-medium text-gray-700">
                            Minimum Password Length
                          </label>
                          <div className="mt-1">
                            <input
                              type="number"
                              id="minPasswordLength"
                              name="minPasswordLength"
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              defaultValue="12"
                            />
                          </div>
                        </div>
                        
                        <div className="sm:col-span-6">
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="requireUppercase"
                                name="requireUppercase"
                                type="checkbox"
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                defaultChecked
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="requireUppercase" className="font-medium text-gray-700">
                                Require Uppercase Letters
                              </label>
                            </div>
                          </div>
                          
                          <div className="flex items-start mt-2">
                            <div className="flex items-center h-5">
                              <input
                                id="requireLowercase"
                                name="requireLowercase"
                                type="checkbox"
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                defaultChecked
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="requireLowercase" className="font-medium text-gray-700">
                                Require Lowercase Letters
                              </label>
                            </div>
                          </div>
                          
                          <div className="flex items-start mt-2">
                            <div className="flex items-center h-5">
                              <input
                                id="requireNumbers"
                                name="requireNumbers"
                                type="checkbox"
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                defaultChecked
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="requireNumbers" className="font-medium text-gray-700">
                                Require Numbers
                              </label>
                            </div>
                          </div>
                          
                          <div className="flex items-start mt-2">
                            <div className="flex items-center h-5">
                              <input
                                id="requireSpecialChars"
                                name="requireSpecialChars"
                                type="checkbox"
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                defaultChecked
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="requireSpecialChars" className="font-medium text-gray-700">
                                Require Special Characters
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8 border-t border-gray-200 pt-5">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Save Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SecuritySettings;