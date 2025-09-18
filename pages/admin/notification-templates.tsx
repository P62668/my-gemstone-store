import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';
import { withAdminAuth } from '../../utils/withAdminAuth';
import { Bell, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface NotificationTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  type: 'email' | 'sms' | 'push';
  createdAt: string;
  updatedAt: string;
}

const NotificationTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    type: 'email' as 'email' | 'sms' | 'push'
  });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/notification-templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to fetch templates');
      }
    } catch (err) {
      setError('Error fetching templates');
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreateTemplate = () => {
    setIsCreating(true);
    setEditingTemplate(null);
    setFormData({
      name: '',
      subject: '',
      body: '',
      type: 'email'
    });
  };

  const handleEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setIsCreating(false);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      type: template.type
    });
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      const res = await fetch(`/api/admin/notification-templates?id=${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        toast.success('Template deleted successfully');
        fetchTemplates();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to delete template');
      }
    } catch (err) {
      toast.error('Error deleting template');
      console.error('Error deleting template:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = '/api/admin/notification-templates';
      const method = 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: editingTemplate?.id
        })
      });
      
      if (res.ok) {
        toast.success(editingTemplate ? 'Template updated successfully' : 'Template created successfully');
        setEditingTemplate(null);
        setIsCreating(false);
        setFormData({
          name: '',
          subject: '',
          body: '',
          type: 'email'
        });
        fetchTemplates();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to save template');
      }
    } catch (err) {
      toast.error('Error saving template');
      console.error('Error saving template:', err);
    }
  };

  const handleCancel = () => {
    setEditingTemplate(null);
    setIsCreating(false);
    setFormData({
      name: '',
      subject: '',
      body: '',
      type: 'email'
    });
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'email':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Email</span>;
      case 'sms':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">SMS</span>;
      case 'push':
        return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Push</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Notification Templates - Admin Panel</title>
      </Head>
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Notification Templates
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage email, SMS, and push notification templates
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={handleCreateTemplate}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              New Template
            </button>
          </div>
        </div>

        {(isCreating || editingTemplate) && (
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Template Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Unique identifier for this template (e.g., order_confirmation)
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      Notification Type
                    </label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="push">Push Notification</option>
                    </select>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                      Body
                    </label>
                    <textarea
                      id="body"
                      rows={8}
                      value={formData.body}
                      onChange={(e) => setFormData({...formData, body: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Use placeholders like {'{{firstName}}'}, {'{{orderId}}'} to insert dynamic content
                    </p>
                  </div>
                </div>
                
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                  >
                    <Save className="-ml-1 mr-2 h-5 w-5" />
                    Save Template
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  >
                    <X className="-ml-1 mr-2 h-5 w-5" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {loading ? (
              <li className="px-4 py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading templates...</p>
              </li>
            ) : error ? (
              <li className="px-4 py-12 text-center">
                <div className="text-red-500 mx-auto">
                  <Bell className="w-12 h-12 mx-auto" />
                </div>
                <p className="mt-4 text-red-500">{error}</p>
                <button
                  onClick={fetchTemplates}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Retry
                </button>
              </li>
            ) : templates.length === 0 ? (
              <li className="px-4 py-12 text-center">
                <div className="text-gray-400 mx-auto">
                  <Bell className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No templates</h3>
                <p className="mt-2 text-gray-500">
                  Get started by creating a new notification template.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleCreateTemplate}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    New Template
                  </button>
                </div>
              </li>
            ) : (
              templates.map((template) => (
                <li key={template.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {template.name}
                        </p>
                        <div className="ml-2">
                          {getTypeBadge(template.type)}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditTemplate(template)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {template.subject}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Updated{' '}
                          <time dateTime={template.updatedAt}>
                            {new Date(template.updatedAt).toLocaleDateString()}
                          </time>
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {template.body}
                      </p>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NotificationTemplatesPage;

export const getServerSideProps: GetServerSideProps = withAdminAuth(async (context) => {
  return {
    props: {}
  };
});