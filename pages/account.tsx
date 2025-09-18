import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import getSessionOrRedirect from '../utils/withServerAuth';
import { prisma } from '../lib/prisma';
import { Session } from 'next-auth';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  MapPin, 
  CreditCard, 
  Star, 
  Bell, 
  Settings,
  ChevronRight,
  Package,
  Truck,
  Shield
} from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb';
import LuxuryButton from '../components/ui/LuxuryButton';
import LuxuryCard from '../components/ui/LuxuryCard';

interface OrderSummary {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  orderNumber?: string | null;
}

interface Props {
  user: { id: number; firstName?: string | null; email?: string | null } | null;
  orders: OrderSummary[];
}

const AccountPage: React.FC<Props> = ({ user, orders }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // If user is null, show not signed in
  if (!user) {
    return (
      <Layout title="My Account - Shankarmala">
        <main className="max-w-4xl mx-auto py-12">
          <h1 className="text-2xl font-bold luxury-font-serif">Not signed in</h1>
          <p className="mt-4 luxury-font-sans">Please <Link href="/login" className="text-amber-600 underline">sign in</Link> to access your account.</p>
        </main>
      </Layout>
    );
  }

  // If user is present but orders is empty and user is not new, show error banner
  const hasBackendError = user && !orders;

  // Account navigation sections
  const accountSections = [
    { id: 'dashboard', name: 'Dashboard', icon: User },
    { id: 'orders', name: 'My Orders', icon: ShoppingBag },
    { id: 'wishlist', name: 'Wishlist', icon: Heart },
    { id: 'addresses', name: 'Addresses', icon: MapPin },
    { id: 'payment', name: 'Payment Methods', icon: CreditCard },
    { id: 'reviews', name: 'My Reviews', icon: Star },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'settings', name: 'Account Settings', icon: Settings },
  ];

  return (
    <Layout title="My Account - Shankarmala">
      <Head>
        <title>My Account - Shankarmala Gemstore</title>
      </Head>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumb 
          items={[
            { label: 'Home', href: '/' },
            { label: 'My Account' }
          ]} 
          className="mb-6"
        />
        
        {hasBackendError && (
          <div className="max-w-3xl mx-auto mt-6 mb-4">
            <div className="bg-red-100 border border-red-300 text-red-800 px-6 py-4 rounded-xl text-center font-semibold shadow luxury-font-sans">
              There was a problem loading your account data. Please try again later.
            </div>
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Account Navigation Sidebar */}
          <div className="lg:w-1/4">
            <LuxuryCard className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="font-bold text-lg luxury-font-serif">{user.firstName || 'User'}</h2>
                  <p className="text-sm text-gray-500 luxury-font-sans">{user.email}</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                {accountSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      } luxury-font-sans`}
                    >
                      <div className="flex items-center">
                        <Icon className="w-5 h-5 mr-3" />
                        <span className="font-medium">{section.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  );
                })}
              </nav>
            </LuxuryCard>
          </div>
          
          {/* Main Content Area */}
          <div className="lg:w-3/4">
            <LuxuryCard className="p-6">
              {/* Dashboard Section */}
              {activeSection === 'dashboard' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-6 luxury-font-serif">Account Dashboard</h1>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Link href="/orders" className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100 hover:shadow-md transition-shadow luxury-ripple">
                      <div className="flex items-center">
                        <Package className="w-8 h-8 text-amber-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-amber-900 luxury-font-serif">{orders.length}</p>
                          <p className="text-sm text-gray-600 luxury-font-sans">Orders</p>
                        </div>
                      </div>
                    </Link>
                    
                    <Link href="/wishlist" className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100 hover:shadow-md transition-shadow luxury-ripple">
                      <div className="flex items-center">
                        <Heart className="w-8 h-8 text-amber-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-amber-900 luxury-font-serif">12</p>
                          <p className="text-sm text-gray-600 luxury-font-sans">Wishlist</p>
                        </div>
                      </div>
                    </Link>
                    
                    <Link href="/loyalty" className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100 hover:shadow-md transition-shadow luxury-ripple">
                      <div className="flex items-center">
                        <Star className="w-8 h-8 text-amber-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-amber-900 luxury-font-serif">1,250</p>
                          <p className="text-sm text-gray-600 luxury-font-sans">Points</p>
                        </div>
                      </div>
                    </Link>
                    
                    <Link href="/notifications" className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100 hover:shadow-md transition-shadow luxury-ripple">
                      <div className="flex items-center">
                        <Bell className="w-8 h-8 text-amber-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-amber-900 luxury-font-serif">3</p>
                          <p className="text-sm text-gray-600 luxury-font-sans">Alerts</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Orders */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 luxury-font-serif">Recent Orders</h2>
                        <Link href="/orders" className="text-amber-600 text-sm font-medium hover:underline luxury-font-sans">
                          View All
                        </Link>
                      </div>
                      
                      {orders.length === 0 ? (
                        <div className="text-center py-8">
                          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 mb-4 luxury-font-sans">You have no orders yet</p>
                          <Link href="/shop">
                            <LuxuryButton variant="primary" size="md">
                              Start Shopping
                            </LuxuryButton>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {orders.slice(0, 3).map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                              <div>
                                <div className="font-medium text-gray-900 luxury-font-sans">Order #{order.id}</div>
                                <div className="text-sm text-gray-500 luxury-font-sans">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-amber-900 luxury-font-sans">₹{order.total.toLocaleString()}</div>
                                <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                                  order.status === 'paid'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : order.status === 'pending'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-gray-100 text-gray-500'
                                } luxury-font-sans`}>
                                  {order.status}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Account Activity */}
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4 luxury-font-serif">Recent Activity</h2>
                      <div className="space-y-4">
                        <div className="flex items-start p-4 bg-amber-50 rounded-xl border border-amber-100">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                            <Heart className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 luxury-font-sans">Added Ruby Ring to wishlist</p>
                            <p className="text-xs text-gray-500 luxury-font-sans">2 hours ago</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start p-4 bg-amber-50 rounded-xl border border-amber-100">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                            <Star className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 luxury-font-sans">Reviewed Emerald Necklace</p>
                            <p className="text-xs text-gray-500 luxury-font-sans">1 day ago</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start p-4 bg-amber-50 rounded-xl border border-amber-100">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                            <Bell className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 luxury-font-sans">Order #12345 shipped</p>
                            <p className="text-xs text-gray-500 luxury-font-sans">2 days ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Orders Section */}
              {activeSection === 'orders' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 luxury-font-serif">My Orders</h1>
                    <Link href="/orders">
                      <LuxuryButton variant="primary" size="md">
                        View All Orders
                      </LuxuryButton>
                    </Link>
                  </div>
                  
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 luxury-font-serif">No orders yet</h3>
                      <p className="text-gray-500 mb-6 luxury-font-sans">Your orders will appear here once you make a purchase</p>
                      <Link href="/shop">
                        <LuxuryButton variant="primary" size="lg">
                          Start Shopping
                        </LuxuryButton>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                              <div className="font-medium text-gray-900 luxury-font-sans">Order #{order.id}</div>
                              <div className="text-sm text-gray-500 luxury-font-sans">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-amber-900 luxury-font-sans">₹{order.total.toLocaleString()}</div>
                              <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                                order.status === 'paid'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : order.status === 'pending'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-gray-100 text-gray-500'
                              } luxury-font-sans`}>
                                {order.status}
                              </div>
                            </div>
                            <div>
                              <Link href={`/orders/${order.id}`}>
                                <LuxuryButton variant="secondary" size="sm">
                                  View Details
                                </LuxuryButton>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Wishlist Section */}
              {activeSection === 'wishlist' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 luxury-font-serif">My Wishlist</h1>
                    <Link href="/wishlist">
                      <LuxuryButton variant="primary" size="md">
                        View Full Wishlist
                      </LuxuryButton>
                    </Link>
                  </div>
                  
                  <div className="text-center py-12 bg-amber-50 rounded-xl border border-amber-100">
                    <Heart className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 luxury-font-serif">Your wishlist is empty</h3>
                    <p className="text-gray-500 mb-6 luxury-font-sans">Start adding items you love to your wishlist</p>
                    <Link href="/shop">
                      <LuxuryButton variant="primary" size="lg">
                        Browse Collection
                      </LuxuryButton>
                    </Link>
                  </div>
                </div>
              )}
              
              {/* Addresses Section */}
              {activeSection === 'addresses' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 luxury-font-serif">My Addresses</h1>
                    <LuxuryButton variant="primary" size="md">
                      Add New Address
                    </LuxuryButton>
                  </div>
                  
                  <div className="text-center py-12 bg-amber-50 rounded-xl border border-amber-100">
                    <MapPin className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 luxury-font-serif">No addresses saved</h3>
                    <p className="text-gray-500 mb-6 luxury-font-sans">Add your shipping and billing addresses for faster checkout</p>
                    <LuxuryButton variant="primary" size="lg">
                      Add Address
                    </LuxuryButton>
                  </div>
                </div>
              )}
              
              {/* Payment Methods Section */}
              {activeSection === 'payment' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 luxury-font-serif">Payment Methods</h1>
                    <LuxuryButton variant="primary" size="md">
                      Add Payment Method
                    </LuxuryButton>
                  </div>
                  
                  <div className="text-center py-12 bg-amber-50 rounded-xl border border-amber-100">
                    <CreditCard className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 luxury-font-serif">No payment methods saved</h3>
                    <p className="text-gray-500 mb-6 luxury-font-sans">Add a payment method for faster checkout</p>
                    <LuxuryButton variant="primary" size="lg">
                      Add Payment Method
                    </LuxuryButton>
                  </div>
                </div>
              )}
              
              {/* Reviews Section */}
              {activeSection === 'reviews' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-6 luxury-font-serif">My Reviews</h1>
                  
                  <div className="text-center py-12 bg-amber-50 rounded-xl border border-amber-100">
                    <Star className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 luxury-font-serif">No reviews yet</h3>
                    <p className="text-gray-500 mb-6 luxury-font-sans">Your product reviews will appear here after you make purchases</p>
                    <Link href="/shop">
                      <LuxuryButton variant="primary" size="lg">
                        Shop Now
                      </LuxuryButton>
                    </Link>
                  </div>
                </div>
              )}
              
              {/* Notifications Section */}
              {activeSection === 'notifications' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-6 luxury-font-serif">Notifications</h1>
                  
                  <div className="text-center py-12 bg-amber-50 rounded-xl border border-amber-100">
                    <Bell className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 luxury-font-serif">No notifications</h3>
                    <p className="text-gray-500 mb-6 luxury-font-sans">You're all caught up! Check back later for updates</p>
                  </div>
                </div>
              )}
              
              {/* Settings Section */}
              {activeSection === 'settings' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-6 luxury-font-serif">Account Settings</h1>
                  
                  <div className="space-y-6">
                    <div className="p-4 border border-gray-200 rounded-xl">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4 luxury-font-serif">Personal Information</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1 luxury-font-sans">First Name</label>
                          <input
                            type="text"
                            defaultValue={user.firstName || ''}
                            className="luxury-input"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1 luxury-font-sans">Email</label>
                          <input
                            type="email"
                            defaultValue={user.email || ''}
                            className="luxury-input"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <LuxuryButton variant="primary" size="md">
                          Save Changes
                        </LuxuryButton>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-gray-200 rounded-xl">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4 luxury-font-serif">Password</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1 luxury-font-sans">Current Password</label>
                          <input
                            type="password"
                            className="luxury-input"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1 luxury-font-sans">New Password</label>
                          <input
                            type="password"
                            className="luxury-input"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1 luxury-font-sans">Confirm New Password</label>
                          <input
                            type="password"
                            className="luxury-input"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <LuxuryButton variant="primary" size="md">
                          Update Password
                        </LuxuryButton>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </LuxuryCard>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const sessionResult = await getSessionOrRedirect(context);
  
  // Handle redirect result
  if ('redirect' in sessionResult) {
    return sessionResult;
  }
  
  // Extract session from result
  const { session } = sessionResult;

  if (!session) {
    return {
      props: {
        user: null,
        orders: [],
      },
    };
  }

  try {
    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
      select: { id: true, firstName: true, email: true },
    });

    // Fetch recent orders (limit to 5)
    const orders = await prisma.order.findMany({
      where: { userId: Number(session.user.id) },
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true,
        orderNumber: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      props: {
        user,
        orders: orders.map(order => ({
          ...order,
          createdAt: order.createdAt.toISOString(),
        })),
      },
    };
  } catch (error) {
    console.error('Error fetching account data:', error);
    return {
      props: {
        user: null,
        orders: null, // This will trigger the error banner
      },
    };
  }
};

export default AccountPage;