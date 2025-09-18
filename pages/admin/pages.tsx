import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import getSessionOrRedirect from '../../utils/withServerAuth';
import type { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { toast } from 'react-hot-toast';
import { Search, Plus, Edit, Trash2, Eye, FileText } from 'lucide-react';

// Dynamically import the page editor to avoid SSR issues
const PageEditor = dynamic(() => import('../../components/admin/PageEditor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

interface Page {
  id: number;
  title: string;
  slug: string;
  status: string;
  author: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  versions?: {
    id: number;
    version: number;
    createdAt: string;
    author: {
      firstName: string;
      lastName: string;
    };
  }[];
  version?: number;
}

interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'button' | 'divider';
  content: any;
  settings?: {
    alignment?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
  };
}

const emptyPage = {
  title: '',
  slug: '',
  content: [],
  seo: {
    title: '',
    description: '',
    keywords: '',
  },
  template: '',
  status: 'draft',
};

const AdminPagesPage: React.FC = () => {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState<any>(emptyPage);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPages();
  }, [currentPage, searchQuery, statusFilter]);

  const fetchPages = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/pages?page=${currentPage}&limit=10&search=${searchQuery}&status=${statusFilter}`);
      if (!res.ok) throw new Error('Failed to fetch pages');
      const data = await res.json();
      setPages(data.pages);
      setTotalPages(data.pagination.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleContentChange = (content: ContentBlock[]) => {
    setForm({ ...form, content });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = { 
        ...form,
        content: JSON.stringify(form.content),
        seo: form.seo || {}
      };
      
      if (editingId) {
        // Update existing page
        const res = await fetch(`/api/admin/pages/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update page');
        setSuccess('Page updated successfully!');
      } else {
        // Add new page
        const res = await fetch('/api/admin/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create page');
        setSuccess('Page created successfully!');
      }

      setForm(emptyPage);
      setEditingId(null);
      setShowForm(false);
      fetchPages();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/pages/${id}`);
      if (!res.ok) throw new Error('Failed to fetch page');
      const page = await res.json();
      
      setForm({
        title: page.title,
        slug: page.slug,
        content: typeof page.content === 'string' ? JSON.parse(page.content) : page.content,
        seo: page.seo || {},
        template: page.template || '',
        status: page.status,
      });
      
      setEditingId(id);
      setShowForm(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleViewVersion = async (pageId: number, version: number) => {
    try {
      const res = await fetch(`/api/admin/pages/${pageId}/versions/${version}`);
      if (!res.ok) throw new Error('Failed to fetch version');
      const versionData = await res.json();
      
      // Update the form with version data
      setForm({
        title: versionData.title,
        slug: versionData.slug,
        content: typeof versionData.content === 'string' ? JSON.parse(versionData.content) : versionData.content,
        seo: versionData.seo || {},
        template: versionData.template || '',
        status: versionData.status,
      });
      
      toast.success(`Previewing version ${version}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load version');
    }
  };

  const handleRestoreVersion = async (pageId: number, version: number) => {
    try {
      const res = await fetch(`/api/admin/pages/${pageId}/versions/${version}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      if (!res.ok) throw new Error('Failed to restore version');
      
      // Refresh the page data
      await handleEdit(pageId);
      toast.success(`Version ${version} restored successfully!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to restore version');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;
    setFormLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/pages/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete page');
      setSuccess('Page deleted successfully!');
      fetchPages();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setFormLoading(false);
    }
  };

  const handlePreview = (slug: string) => {
    window.open(`/${slug}`, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout title="Admin Pages - Shankarmala">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-amber-900">Page Management</h1>
              <p className="text-amber-600 mt-2">Create and manage dynamic pages for your website</p>
            </div>
            <button
              onClick={() => {
                setForm(emptyPage);
                setEditingId(null);
                setShowForm(!showForm);
              }}
              className="bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add New Page
            </button>
          </div>
        </div>

        {(error || success) && (
          <div className={`rounded-xl p-4 mb-6 font-semibold text-center ${error ? 'bg-red-100 border border-red-300 text-red-800' : 'bg-green-100 border border-green-300 text-green-800'}`}>
            {error || success}
          </div>
        )}

        {showForm && (
          <form
            className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8 mb-12"
            onSubmit={handleSubmit}
          >
            <h2 className="text-2xl font-semibold text-amber-900 mb-6">
              {editingId ? 'Edit Page' : 'Create New Page'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  placeholder="Page title"
                  required
                  className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => handleFormChange('slug', e.target.value)}
                  placeholder="page-slug"
                  required
                  className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                  className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                <input
                  type="text"
                  value={form.template}
                  onChange={(e) => handleFormChange('template', e.target.value)}
                  placeholder="Page template (optional)"
                  className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <PageEditor 
                initialContent={form.content || []}
                onChange={handleContentChange}
                initialSeo={form.seo || {}}
                onSeoChange={(seo) => handleFormChange('seo', seo)}
                pageTitle={form.title}
                pageSlug={form.slug}
                versions={form.versions || []}
                currentPageVersion={form.version || 1}
                onViewVersion={(version) => editingId && handleViewVersion(editingId, version)}
                onRestoreVersion={(version) => editingId && handleRestoreVersion(editingId, version)}
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-amber-600 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-lg hover:bg-amber-700 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                disabled={formLoading}
              >
                {formLoading
                  ? editingId
                    ? 'Saving...'
                    : 'Creating...'
                  : editingId
                    ? 'Save Changes'
                    : 'Create Page'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setForm(emptyPage);
                    setEditingId(null);
                    setShowForm(false);
                  }}
                  className="bg-gray-500 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-lg hover:bg-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-amber-900">All Pages</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pages..."
                  className="pl-10 pr-4 py-2 border border-amber-200 rounded-xl focus:ring-amber-500 focus:border-amber-500 w-full md:w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-amber-200 rounded-xl focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
              <p className="mt-4 text-amber-700">Loading pages...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : pages.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No pages found</h3>
              <p className="mt-1 text-gray-500">Get started by creating a new page.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slug
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Updated
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pages.map((page) => (
                      <tr key={page.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{page.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">/{page.slug}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(page.status)}`}>
                            {page.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {page.author.firstName} {page.author.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(page.updatedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handlePreview(page.slug)}
                            className="text-amber-600 hover:text-amber-900 mr-3"
                            title="Preview"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(page.id)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            title="Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(page.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === i + 1
                            ? 'z-10 bg-amber-50 border-amber-500 text-amber-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPagesPage;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const res = await getSessionOrRedirect(ctx, { requireAdmin: true });
  if ('redirect' in res) return res;
  return { props: {} };
};