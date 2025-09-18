import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { 
  LayoutDashboard, 
  Gem, 
  ShoppingCart, 
  Users, 
  Tags, 
  FileText, 
  Image, 
  Settings, 
  LogOut,
  BarChart3,
  Package,
  Truck,
  Ticket,
  UserCircle,
  Navigation,
  Palette,
  Shield,
  File,
  BookOpen,
  Star,
  ShieldCheck,
  Home,
  Menu,
  X,
  Search,
  ChevronDown,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title = 'Admin Panel - Shankarmala', 
  description = 'Admin panel for Shankarmala Gemstones' 
}) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{name?: string, email?: string, role?: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    // Get user data from localStorage or session
    const userData = localStorage.getItem('adminUser');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        localStorage.removeItem('adminUser');
        toast.success('Logged out successfully');
        router.push('/admin/login');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const navItems = [
    { 
      title: 'Dashboard', 
      href: '/admin', 
      icon: LayoutDashboard,
      allowedRoles: ['admin', 'manager'],
      description: 'Overview of your store performance'
    },
    { 
      title: 'Products', 
      href: '/admin/gemstones', 
      icon: Gem,
      allowedRoles: ['admin', 'manager'],
      description: 'Manage gemstones and inventory'
    },
    { 
      title: 'Categories', 
      href: '/admin/categories', 
      icon: Tags,
      allowedRoles: ['admin', 'manager'],
      description: 'Organize product categories'
    },
    { 
      title: 'Orders', 
      href: '/admin/orders', 
      icon: ShoppingCart,
      allowedRoles: ['admin', 'manager'],
      description: 'View and manage customer orders'
    },
    { 
      title: 'Customers', 
      href: '/admin/users', 
      icon: Users,
      allowedRoles: ['admin', 'manager'],
      description: 'Manage customer accounts and data'
    },
    { 
      title: 'Inventory', 
      href: '/admin/inventory', 
      icon: Package,
      allowedRoles: ['admin', 'manager'],
      description: 'Track stock levels and movements'
    },
    { 
      title: 'Shipping', 
      href: '/admin/shipping', 
      icon: Truck,
      allowedRoles: ['admin', 'manager'],
      description: 'Manage shipping methods and rates'
    },
    { 
      title: 'Coupons', 
      href: '/admin/coupons', 
      icon: Ticket,
      allowedRoles: ['admin', 'manager'],
      description: 'Create and manage discount codes'
    },
    { 
      title: 'Content', 
      href: '#', 
      icon: FileText,
      allowedRoles: ['admin'],
      description: 'Manage website content',
      subItems: [
        { title: 'Blogs', href: '/admin/blogs', icon: BookOpen, description: 'Manage blog posts' },
        { title: 'FAQs', href: '/admin/faqs', icon: File, description: 'Frequently asked questions' },
        { title: 'Testimonials', href: '/admin/testimonials', icon: Star, description: 'Customer testimonials' },
        { title: 'Press', href: '/admin/press', icon: File, description: 'Press releases and media' },
        { title: 'Policies', href: '/admin/policies', icon: ShieldCheck, description: 'Legal policies and terms' },
      ]
    },
    { 
      title: 'Marketing', 
      href: '#', 
      icon: BarChart3,
      allowedRoles: ['admin'],
      description: 'Marketing and analytics tools',
      subItems: [
        { title: 'SEO', href: '/admin/seo', icon: FileText, description: 'Search engine optimization' },
        { title: 'Analytics', href: '/admin/analytics', icon: BarChart3, description: 'Website analytics and reports' },
        { title: 'Reports', href: '/admin/reports', icon: File, description: 'Business performance reports' },
        { title: 'Performance', href: '/admin/performance', icon: Zap, description: 'Performance monitoring and optimization' },
      ]
    },
    { 
      title: 'Appearance', 
      href: '#', 
      icon: Palette,
      allowedRoles: ['admin'],
      description: 'Customize website appearance',
      subItems: [
        { title: 'Homepage', href: '/admin/homepage', icon: Home, description: 'Manage homepage content' },
        { title: 'Banners', href: '/admin/banners', icon: Image, description: 'Manage promotional banners' },
        { title: 'Navigation', href: '/admin/navigation', icon: Navigation, description: 'Website navigation menus' },
        { title: 'Theme', href: '/admin/theme', icon: Palette, description: 'Theme and styling options' },
      ]
    },
    { 
      title: 'Settings', 
      href: '#', 
      icon: Settings,
      allowedRoles: ['admin'],
      description: 'System configuration and settings',
      subItems: [
        { title: 'Site Settings', href: '/admin/sitesettings', icon: Settings, description: 'General site configuration' },
        { title: 'Security', href: '/admin/security', icon: Shield, description: 'Security settings and controls' },
        { title: 'Loyalty', href: '/admin/loyalty', icon: UserCircle, description: 'Loyalty program management' },
      ]
    },
  ];

  const userRole = user?.role || 'admin';

  const filteredNavItems = navItems.filter(item => 
    item.allowedRoles.includes(userRole)
  );

  // Quick search functionality for admin panel
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to search results page
      router.push(`/admin/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden luxury-modal-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } luxury-modal-content`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b luxury-border-gold">
          <Link href="/admin" className="flex items-center space-x-2">
            <Gem className="h-8 w-8 text-amber-600" />
            <span className="text-xl font-bold text-amber-900 luxury-font-serif">Shankarmala</span>
          </Link>
          <button 
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Admin Search Bar */}
        <div className="px-4 py-3 border-b">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search admin..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </form>
        </div>
        
        {/* Navigation Menu */}
        <nav className="mt-2 px-2 overflow-y-auto h-[calc(100vh-8rem)]">
          {filteredNavItems.map((item) => (
            <div key={item.title}>
              {item.subItems ? (
                <div className="space-y-1">
                  <div className={`flex items-center px-2 py-3 text-sm font-medium rounded-md hover:bg-gray-100 luxury-nav-link cursor-pointer ${
                    router.pathname.startsWith(item.href === '#' ? '' : item.href) 
                      ? 'bg-amber-100 text-amber-900' 
                      : 'text-gray-600'
                  }`}>
                    <item.icon className="mr-3 h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="ml-8 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.title}
                        href={subItem.href}
                        className={`flex items-center px-2 py-2 text-sm rounded-md luxury-nav-link ${
                          router.pathname === subItem.href
                            ? 'bg-amber-100 text-amber-900'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <subItem.icon className="mr-3 h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <div className="font-medium">{subItem.title}</div>
                          <div className="text-xs text-gray-500">{subItem.description}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center px-2 py-3 text-sm font-medium rounded-md luxury-nav-link ${
                    router.pathname === item.href
                      ? 'bg-amber-100 text-amber-900'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow luxury-border-gold">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserCircle className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 luxury-font-serif">
                    {user?.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-500 luxury-font-sans">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 luxury-nav-link luxury-font-sans"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;