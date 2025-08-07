import React, { useState, useEffect, useRef } from 'react';
import type {
  Address,
  WishlistItem,
  RecentlyViewedItem,
  Notification,
  Gemstone,
  User,
} from '../interfaces';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';

interface Order {
  id: number;
  total: number;
  status: string;
  createdAt: string;
}

// Removed unused testimonials

function getLoyaltyTier(orderCount: number) {
  if (orderCount >= 20) return { tier: 'Platinum', next: null };
  if (orderCount >= 10) return { tier: 'Gold', next: 20 };
  return { tier: 'Silver', next: 10 };
}

const AccountPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    id: null,
    type: 'shipping',
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    isDefault: false,
  });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  // Removed testimonialIndex and setTestimonialIndex (unused)
  const scrollTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        // Fetch user profile
        const userRes = await fetch('/api/users/me');
        if (!userRes.ok) throw new Error('Failed to fetch user profile');
        const userData = await userRes.json();
        setUser(userData);
        setEditForm({ name: userData.name, email: userData.email });
        setProfileImage(userData.profileImage || '/images/placeholder-gemstone.jpg');

        // Fetch orders
        const ordersRes = await fetch('/api/orders');
        if (!ordersRes.ok) throw new Error('Failed to fetch orders');
        const ordersData = await ordersRes.json();
        setOrders(ordersData);

        // Fetch addresses
        const addressesRes = await fetch('/api/addresses');
        if (!addressesRes.ok) throw new Error('Failed to fetch addresses');
        const addressesData = await addressesRes.json();
        setAddresses(addressesData);
        setAddressForm({
          id: null,
          type: 'shipping',
          name: userData.name,
          address: '',
          city: '',
          state: '',
          zipCode: '',
          phone: '',
          isDefault: true,
        });

        // Fetch wishlist
        const wishlistRes = await fetch('/api/users/wishlist');
        setWishlist(wishlistRes.ok ? await wishlistRes.json() : []);

        // Fetch recently viewed
        const rvRes = await fetch('/api/users/recently-viewed');
        setRecentlyViewed(rvRes.ok ? await rvRes.json() : []);

        // Fetch notifications
        const notifRes = await fetch('/api/users/notifications');
        setNotifications(notifRes.ok ? await notifRes.json() : []);
      } catch (err) {
        setError((err as Error).message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Removed testimonialIndex rotation effect (unused)

  const loyalty = getLoyaltyTier(orders.length);
  const loyaltyProgress = Math.min(100, orders.length * 10);
  const loyaltyNext = loyalty.next;
  const loyaltyNextLabel =
    loyalty.tier === 'Platinum' ? 'Platinum' : loyalty.tier === 'Gold' ? 'Platinum' : 'Gold';

  // Helper for profile image upload
  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileImage: base64 }),
      });

      if (response.ok) {
        const updated = await response.json();
        setProfileImage(updated.profileImage || '/images/placeholder-gemstone.jpg');
        toast.success('Profile image updated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update profile image');
      }
    } catch (error) {
      console.error('Profile image update error:', error);
      toast.error('Failed to update profile image. Please try again.');
    }
  };

  // Helper for address edit
  const handleEditAddress = (addr: Address) => {
    setAddressForm({
      id: addr.id,
      type: addr.type,
      name: addr.name,
      address: addr.address,
      city: addr.city,
      state: addr.state || '',
      zipCode: addr.zipCode || '',
      phone: addr.phone || '',
      isDefault: addr.isDefault || false,
    });
    setShowAddressModal(true);
  };

  // Helper for address save
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let res;
      if (addressForm.id) {
        // Update address
        res = await fetch(`/api/addresses`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addressForm),
        });
      } else {
        // Add address
        res = await fetch(`/api/addresses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addressForm),
        });
      }
      if (!res.ok) throw new Error('Failed to save address');
      const updatedAddresses = await res.json();
      setAddresses(updatedAddresses);
      setShowAddressModal(false);
      setAddressForm({
        id: null,
        type: 'shipping',
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        isDefault: false,
      });
    } catch (err) {
      setError(err.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  // Helper for password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (passwordForm.new !== passwordForm.confirm) {
      setError('New passwords do not match!');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });
      if (!res.ok) throw new Error('Failed to change password');
      setShowPasswordModal(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
      alert('Password changed successfully!');
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Helper for notification dismiss
  const handleDismissNotification = async (id: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/users/notifications`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to dismiss notification');
      const updated = await res.json();
      setNotifications(updated);
    } catch (err) {
      setError(err.message || 'Failed to dismiss notification');
    } finally {
      setLoading(false);
    }
  };

  // Helper for wishlist add (demo)
  // Gemstone picker for wishlist
  const [gemstones, setGemstones] = useState<Gemstone[]>([]);
  const [showGemstonePicker, setShowGemstonePicker] = useState(false);
  const [selectedGemstoneId, setSelectedGemstoneId] = useState<number | null>(null);

  const fetchGemstones = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/gemstones');
      if (!res.ok) throw new Error('Failed to fetch gemstones');
      const data = await res.json();
      setGemstones(data);
      setShowGemstonePicker(true);
    } catch (err) {
      setError(err.message || 'Failed to fetch gemstones');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWishlist = async () => {
    if (!selectedGemstoneId) return setError('Please select a gemstone');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gemstoneId: selectedGemstoneId }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to add to wishlist');
      }
      const updated = await res.json();
      setWishlist(updated);
      setShowGemstonePicker(false);
      setSelectedGemstoneId(null);
    } catch (err) {
      setError(err.message || 'Failed to add to wishlist');
    } finally {
      setLoading(false);
    }
  };

  // Helper for order actions
  const handleDownloadInvoice = async (id: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/${id}/invoice`);
      if (!res.ok) throw new Error('Failed to download invoice');
      const blob = await res.blob();
      if (typeof window !== 'undefined') {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError(err.message || 'Failed to download invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (id: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/${id}/reorder`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to reorder');
      const updatedOrders = await res.json();
      setOrders(updatedOrders);
      alert('Order placed again!');
    } catch (err) {
      setError(err.message || 'Failed to reorder');
    } finally {
      setLoading(false);
    }
  };

  // SEO structured data

  // Safe image source helper
  const getSafeImageSrc = (imageSrc: string | null | undefined): string => {
    // Default fallback
    const fallback = '/images/placeholder-gemstone.jpg';

    // If no image source, return fallback
    if (!imageSrc) return fallback;

    // If it's not a string, return fallback
    if (typeof imageSrc !== 'string') return fallback;

    // If it's empty or whitespace, return fallback
    if (imageSrc.trim() === '') return fallback;

    // If it's a base64 data URL, return as is
    if (imageSrc.startsWith('data:')) return imageSrc;

    // If it's a full URL (http/https), return as is
    if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) return imageSrc;

    // If it starts with /, it's a relative path, return as is
    if (imageSrc.startsWith('/')) return imageSrc;

    // Otherwise, treat as relative path and add /
    return `/${imageSrc}`;
  };

  return (
    <>
      <Head>
        <title>My Account - Shankarmala Gemstore</title>
        <meta
          name="description"
          content="Manage your Shankarmala Gemstore account. View orders, addresses, loyalty, and more. Secure, luxury, and trusted since 1895."
        />
        <meta
          name="description"
          content="Manage your Shankarmala Gemstore account. View orders, addresses, loyalty, and more. Secure, luxury, and trusted since 1895."
        />
        <link rel="canonical" href="https://shankarmala.com/account" />
        <meta property="og:title" content="My Account - Shankarmala Gemstore" />
        <meta
          property="og:description"
          content="Manage your Shankarmala Gemstore account. View orders, addresses, loyalty, and more. Secure, luxury, and trusted since 1895."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shankarmala.com/account" />
        <meta property="og:image" content="/images/placeholder-gemstone.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="My Account - Shankarmala Gemstore" />
        <meta
          name="twitter:description"
          content="Manage your Shankarmala Gemstore account. View orders, addresses, loyalty, and more."
        />
      </Head>
      <Layout title="My Account - Shankarmala">
        <main>
          <div className="flex gap-4 mb-6">
            <Link
              href="/shop"
              className="bg-gradient-to-r from-amber-400 to-yellow-200 text-white px-6 py-2 rounded-lg font-semibold hover:bg-amber-700 transition shadow"
            >
              Start Shopping
            </Link>
            <Link
              href="/wishlist"
              className="bg-gradient-to-r from-rose-400 to-amber-200 text-white px-6 py-2 rounded-lg font-semibold hover:bg-rose-700 transition shadow"
            >
              My Wishlist
            </Link>
          </div>
          <div
            className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-tr from-amber-100/60 via-white/40 to-yellow-200/60 animate-gradient-move rounded-3xl blur-xl opacity-70"
            aria-hidden="true"
          ></div>
          {/* Loading and error overlays */}
          {loading && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-100 animate-pulse"
              aria-live="polite"
              role="status"
            >
              <span className="text-amber-500 text-4xl animate-spin drop-shadow-lg">⏳</span>
            </div>
          )}
          {(error || !user) && !loading && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-100/90"
              role="alertdialog"
              aria-modal="true"
              aria-live="assertive"
            >
              <div className="text-center backdrop-blur-xl rounded-2xl p-8 border border-amber-200 shadow-2xl flex flex-col items-center">
                <span className="text-amber-500 text-5xl animate-bounce" aria-hidden="true">
                  ⚠️
                </span>
                <div className="mt-2 text-lg text-amber-900 font-bold">
                  {error || 'User not found.'}
                </div>
                <button
                  className="mt-4 bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition font-semibold"
                  onClick={() => {
                    setError('');
                    setLoading(true);
                    window.location.reload();
                  }}
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          {/* Quick Actions Section */}
          <div className="bg-white/90 rounded-2xl shadow-xl border border-amber-100 p-6 mb-6">
            <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
              <span aria-hidden="true">⚡</span> Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/shop"
                className="flex flex-col items-center p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
              >
                <span className="text-2xl mb-2">🛍️</span>
                <span className="text-sm font-medium text-amber-900">Browse Shop</span>
              </Link>
              <Link
                href="/wishlist"
                className="flex flex-col items-center p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
              >
                <span className="text-2xl mb-2">💎</span>
                <span className="text-sm font-medium text-amber-900">My Wishlist</span>
              </Link>
              <Link
                href="/orders"
                className="flex flex-col items-center p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
              >
                <span className="text-2xl mb-2">📦</span>
                <span className="text-sm font-medium text-amber-900">My Orders</span>
              </Link>
              <button
                onClick={() => setShowHelpModal(true)}
                className="flex flex-col items-center p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
              >
                <span className="text-2xl mb-2">❓</span>
                <span className="text-sm font-medium text-amber-900">Get Help</span>
              </button>
            </div>
          </div>
          {/* Main dashboard content */}
          {!loading && user && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto relative z-10">
              {/* Left Column: Profile, Loyalty, Testimonials, Wishlist, Recently Viewed, Notifications */}
              <div className="flex flex-col gap-8">
                {/* Profile Card with glassmorphism and subtle animation */}
                <section
                  className="bg-white/80 backdrop-blur-xl border border-amber-100 rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-3 relative overflow-hidden group"
                  aria-label="Profile"
                >
                  <div
                    className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-tr from-amber-100/40 via-white/20 to-yellow-200/40 animate-gradient-move rounded-3xl blur-lg opacity-60"
                    aria-hidden="true"
                  ></div>
                  <div className="flex flex-col items-center gap-2 z-10">
                    <div className="relative group">
                      <Image
                        src={getSafeImageSrc(profileImage)}
                        alt="Profile"
                        width={120}
                        height={120}
                        className="w-30 h-30 rounded-full object-cover border-4 border-amber-200 shadow-lg"
                        onError={(e) => {
                          console.warn(
                            'Profile image failed to load, using fallback:',
                            e.currentTarget.src,
                          );
                          e.currentTarget.src = '/images/placeholder-gemstone.jpg';
                          e.currentTarget.onerror = null; // Prevent infinite loop
                        }}
                        onLoad={() => {
                          console.log('Profile image loaded successfully');
                        }}
                      />
                      <label className="absolute bottom-2 right-2 bg-amber-600 text-white rounded-full px-2 py-1 text-xs shadow-lg hover:bg-amber-700 transition cursor-pointer">
                        Change
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProfileImageChange}
                        />
                      </label>
                    </div>
                    <span className="font-bold text-amber-900 text-xl font-serif drop-shadow-lg">
                      Welcome, {user.name.split(' ')[0]}!
                    </span>
                    <span className="text-xs text-amber-700">
                      Member since {new Date(user.createdAt as string).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2 mt-2">
                      <button
                        className="px-4 py-1 rounded bg-amber-100 text-amber-900 font-semibold hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shadow"
                        onClick={() => setShowEditModal(true)}
                        aria-label="Edit profile"
                      >
                        Edit Profile
                      </button>
                      <button
                        className="px-4 py-1 rounded bg-amber-100 text-amber-900 font-semibold hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shadow"
                        onClick={() => setShowPasswordModal(true)}
                        aria-label="Change password"
                      >
                        Change Password
                      </button>
                    </div>
                    <button
                      className="mt-2 px-4 py-1 rounded bg-gradient-to-r from-amber-400 to-yellow-200 text-amber-900 font-semibold hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shadow"
                      onClick={() => setShowReferralModal(true)}
                      aria-label="Referral program"
                    >
                      Refer & Earn
                    </button>
                  </div>
                </section>
                {/* Loyalty Progress with animated bar and sparkles */}
                <section
                  className="bg-gradient-to-r from-yellow-50 to-amber-100 border border-amber-100 rounded-3xl shadow-xl p-6 flex flex-col items-center gap-2 relative overflow-hidden"
                  aria-label="Loyalty Progress"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-amber-400 text-2xl animate-bounce" aria-hidden="true">
                      🏆
                    </span>
                    <span className="text-xl font-bold text-amber-900 font-serif drop-shadow">
                      Your Loyalty Progress
                    </span>
                  </div>
                  <div
                    className="w-full max-w-md bg-amber-100 rounded-full h-6 flex items-center shadow-inner relative overflow-hidden"
                    role="progressbar"
                    aria-valuenow={loyaltyProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 h-6 rounded-full transition-all duration-700 shimmer-bar animate-pulse"
                      style={{ width: `${loyaltyProgress}%` }}
                    ></div>
                    <div className="absolute right-2 text-xs text-amber-700 font-semibold">
                      {loyaltyProgress}%
                    </div>
                    <span
                      className="absolute left-1/2 -translate-x-1/2 top-0 animate-sparkle text-yellow-300 text-lg"
                      aria-hidden="true"
                    >
                      ✨
                    </span>
                  </div>
                  <div className="text-xs text-amber-700 mt-2 font-medium">
                    {loyaltyNext
                      ? `${loyaltyNext - orders.length} more orders to reach ${loyaltyNextLabel} tier!`
                      : 'You are a Platinum customer! 🎉'}
                  </div>
                  <Link
                    href="/about#loyalty"
                    className="text-amber-600 underline font-semibold text-sm mt-1 hover:text-amber-900"
                  >
                    See benefits
                  </Link>
                </section>
                {/* Notifications with icon and highlight */}
                <section
                  className="bg-white/90 rounded-3xl shadow border border-amber-100 p-5"
                  aria-label="Notifications"
                >
                  <h2 className="text-lg font-bold text-amber-900 font-serif mb-2 flex items-center gap-2">
                    <span aria-hidden="true" className="animate-bounce">
                      🔔
                    </span>{' '}
                    Notifications
                  </h2>
                  <ul className="divide-y divide-amber-100">
                    {notifications.map((n) => (
                      <li
                        key={n.id}
                        className="py-2 text-xs text-amber-700 flex justify-between items-center hover:bg-amber-50 transition rounded-lg px-2"
                      >
                        <span>{n.message}</span>
                        <span className="flex gap-2 items-center">
                          <span className="text-gray-400">
                            {new Date(n.date).toLocaleDateString()}
                          </span>
                          <button
                            className="text-xs text-red-500 underline hover:text-red-700"
                            onClick={() => handleDismissNotification(n.id)}
                          >
                            Dismiss
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
                {/* Wishlist with interactive cards */}
                <section
                  className="bg-white/90 rounded-3xl shadow border border-amber-100 p-5"
                  aria-label="Wishlist"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
                      <span aria-hidden="true">💎</span> Wishlist
                    </h3>
                    <Link
                      href="/wishlist"
                      className="text-sm text-amber-600 hover:text-amber-800 font-medium transition-colors"
                    >
                      View All →
                    </Link>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {wishlist.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col items-center gap-1 bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-100 shadow hover:scale-105 transition-transform duration-300 p-2"
                      >
                        <Image
                          src={
                            typeof item.image === 'string' &&
                            (item.image.startsWith('/') || item.image.startsWith('http')) &&
                            item.image.trim() !== ''
                              ? item.image
                              : typeof item.gemstone?.images?.[0] === 'string' &&
                                  (item.gemstone.images[0].startsWith('/') ||
                                    item.gemstone.images[0].startsWith('http')) &&
                                  item.gemstone.images[0].trim() !== ''
                                ? item.gemstone.images[0]
                                : '/images/placeholder-gemstone.jpg'
                          }
                          alt={item.name || item.gemstone?.name || ''}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-xl border-2 border-amber-100 object-cover shadow"
                        />
                        <span className="text-xs text-amber-900 font-semibold mt-1">
                          {item.name || item.gemstone?.name || ''}
                        </span>
                        <button
                          className="text-xs text-red-500 underline hover:text-red-700"
                          onClick={async () => {
                            setLoading(true);
                            setError('');
                            try {
                              const res = await fetch('/api/users/wishlist', {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: item.id }),
                              });
                              if (!res.ok) throw new Error('Failed to remove from wishlist');
                              const updated = await res.json();
                              setWishlist(updated);
                            } catch (err) {
                              setError(err.message || 'Failed to remove from wishlist');
                            } finally {
                              setLoading(false);
                            }
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      className="text-xs text-amber-600 underline hover:text-amber-900"
                      onClick={fetchGemstones}
                    >
                      Add New
                    </button>
                    {showGemstonePicker && (
                      <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Pick Gemstone"
                      >
                        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col gap-4">
                          <h2 className="font-bold text-amber-900 text-lg mb-2">
                            Pick a Gemstone to Add
                          </h2>
                          <select
                            className="border border-amber-200 rounded px-3 py-2"
                            value={selectedGemstoneId ?? ''}
                            onChange={(e) => setSelectedGemstoneId(Number(e.target.value))}
                          >
                            <option value="">Select a gemstone</option>
                            {gemstones.map((gem) => (
                              <option key={gem.id} value={gem.id}>
                                {gem.name}
                              </option>
                            ))}
                          </select>
                          <div className="flex gap-2 mt-2">
                            <button
                              className="bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-700 transition w-full"
                              onClick={handleAddWishlist}
                            >
                              Add
                            </button>
                            <button
                              className="bg-amber-100 text-amber-900 px-4 py-2 rounded-lg font-semibold hover:bg-amber-200 transition w-full"
                              onClick={() => setShowGemstonePicker(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
                {/* Recently Viewed with interactive cards */}
                <section
                  className="bg-white/90 rounded-3xl shadow border border-amber-100 p-5"
                  aria-label="Recently Viewed"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
                      <span aria-hidden="true">👁️</span> Recently Viewed
                    </h3>
                    <Link
                      href="/shop"
                      className="text-sm text-amber-600 hover:text-amber-800 font-medium transition-colors"
                    >
                      Browse All →
                    </Link>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {recentlyViewed.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col items-center gap-1 bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-100 shadow hover:scale-105 transition-transform duration-300 p-2"
                      >
                        <Image
                          src={
                            typeof item.image === 'string' &&
                            (item.image.startsWith('/') || item.image.startsWith('http')) &&
                            item.image.trim() !== ''
                              ? item.image
                              : typeof item.gemstone?.images?.[0] === 'string' &&
                                  (item.gemstone.images[0].startsWith('/') ||
                                    item.gemstone.images[0].startsWith('http')) &&
                                  item.gemstone.images[0].trim() !== ''
                                ? item.gemstone.images[0]
                                : '/images/placeholder-gemstone.jpg'
                          }
                          alt={item.name || item.gemstone?.name || ''}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-xl border-2 border-amber-100 object-cover shadow"
                        />
                        <span className="text-xs text-amber-900 font-semibold mt-1">
                          {item.name || item.gemstone?.name || ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
                {/* Address Book with glassmorphism */}
                <section
                  className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-amber-100 p-5"
                  aria-label="Address Book"
                >
                  <h2 className="text-lg font-bold text-amber-900 font-serif mb-2 flex items-center gap-2">
                    <span aria-hidden="true">🏠</span> Address Book
                  </h2>
                  <ul className="divide-y divide-amber-100">
                    {addresses.map((addr) => (
                      <li
                        key={addr.id}
                        className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-amber-50 transition rounded-lg px-2"
                      >
                        <span className="text-xs text-amber-900 font-semibold">
                          {addr.type === 'shipping' ? 'Shipping' : 'Billing'}: {addr.address},{' '}
                          {addr.city}, {addr.state || ''} {addr.zipCode || ''}
                        </span>
                        <span className="text-xs text-gray-500">{addr.phone || ''}</span>
                        <button
                          className="text-xs text-amber-600 underline hover:text-amber-900"
                          onClick={() => handleEditAddress(addr)}
                        >
                          Edit
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="mt-2 px-4 py-1 rounded bg-gradient-to-r from-amber-400 to-yellow-200 text-amber-900 font-semibold hover:bg-amber-200 shadow"
                    onClick={() => setShowAddressModal(true)}
                  >
                    Add Address
                  </button>
                </section>
              </div>
              {/* Right Column: Orders, Help Button, Modal, Security, Referral */}
              <div className="flex flex-col gap-8">
                {/* Orders Section with luxury card effect */}
                <section
                  className="bg-white/90 rounded-3xl shadow-xl border border-amber-100 p-8"
                  aria-label="Orders"
                >
                  <h2 className="text-xl font-bold text-amber-900 font-serif mb-4 flex items-center gap-2">
                    <span aria-hidden="true">📦</span> Your Orders
                  </h2>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-5xl mb-2 animate-bounce" aria-hidden="true">
                        🛒
                      </div>
                      <div className="text-base text-amber-900 font-bold mb-1">No orders yet</div>
                      <div className="text-sm text-amber-700 mb-4">
                        Looks like you haven't placed an order yet. Let's find your perfect
                        gemstone!
                      </div>
                      <Link
                        href="/shop"
                        className="bg-gradient-to-r from-amber-400 to-yellow-200 text-white px-6 py-2 rounded-lg font-semibold hover:bg-amber-700 transition shadow"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-amber-100">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-amber-50 transition rounded-xl px-2"
                        >
                          <div>
                            <div className="font-medium text-amber-900">Order #{order.id}</div>
                            <div className="text-gray-500 text-sm">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex gap-2 items-center">
                            <div className="font-bold text-lg text-amber-700">
                              ₹{order.total.toLocaleString('en-IN')}
                            </div>
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700`}
                              tabIndex={0}
                              aria-label={`Order status: ${order.status}`}
                            >
                              {order.status}
                            </span>
                            <button
                              className="text-xs text-amber-600 underline hover:text-amber-900"
                              onClick={() => handleDownloadInvoice(order.id)}
                            >
                              Download Invoice
                            </button>
                            <button
                              className="text-xs text-amber-600 underline hover:text-amber-900"
                              onClick={() => handleReorder(order.id)}
                            >
                              Reorder
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
                {/* Security Actions with glassmorphism */}
                <section
                  className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-amber-100 p-5"
                  aria-label="Account Security"
                >
                  <h2 className="text-lg font-bold text-amber-900 font-serif mb-2 flex items-center gap-2">
                    <span aria-hidden="true">🔒</span> Account Security
                  </h2>
                  <button
                    className="mt-2 px-4 py-1 rounded bg-gradient-to-r from-amber-400 to-yellow-200 text-amber-900 font-semibold hover:bg-amber-200 shadow"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Change Password
                  </button>
                  <button
                    className="mt-2 px-4 py-1 rounded bg-amber-100 text-amber-900 font-semibold hover:bg-amber-200 shadow"
                    onClick={async () => {
                      setLoading(true);
                      setError('');
                      try {
                        await fetch('/api/logout', { method: 'POST' });
                        if (typeof document !== 'undefined') {
                          document.cookie = 'token=; Max-Age=0; path=/;';
                        }
                        if (typeof window !== 'undefined') {
                          window.location.href = '/login';
                        }
                      } catch {
                        setError('Failed to logout');
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    Logout
                  </button>
                </section>
                {/* Referral Program with luxury effect */}
                <section
                  className="bg-white/90 rounded-3xl shadow-xl border border-amber-100 p-5"
                  aria-label="Referral Program"
                >
                  <h2 className="text-lg font-bold text-amber-900 font-serif mb-2 flex items-center gap-2">
                    <span aria-hidden="true">🎁</span> Referral Program
                  </h2>
                  <div className="text-xs text-amber-700 mb-2">
                    Invite friends and earn rewards!
                  </div>
                  <button
                    className="mt-2 px-4 py-1 rounded bg-gradient-to-r from-amber-400 to-yellow-200 text-amber-900 font-semibold hover:bg-amber-200 shadow"
                    onClick={() => setShowReferralModal(true)}
                  >
                    Get Referral Link
                  </button>
                </section>
                {/* Floating Help Button with luxury effect */}
                <div className="relative h-24">
                  <button
                    onClick={() => setShowHelpModal(true)}
                    className="absolute bottom-0 right-0 z-50 bg-gradient-to-r from-amber-400 to-yellow-200 text-white rounded-full shadow-2xl p-4 flex items-center gap-2 hover:bg-amber-700 animate-pulse border-2 border-white"
                    aria-label="Need help?"
                    style={{ boxShadow: '0 4px 24px 0 rgba(245,158,66,0.18)' }}
                  >
                    <span className="relative">
                      <Image
                        src="/images/testimonial1.jpg"
                        alt="Support Agent"
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full border-2 border-white object-cover"
                      />
                      <span
                        className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-pulse"
                        title="Live support online"
                        aria-label="Live support online"
                      ></span>
                    </span>
                    <span className="font-bold">Need help?</span>
                  </button>
                  {/* Scroll to Top button for mobile */}
                  <button
                    onClick={() => scrollTopRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    className="absolute bottom-0 left-0 z-50 bg-gradient-to-r from-amber-400 to-yellow-200 text-amber-900 rounded-full shadow-lg p-3 flex items-center justify-center hover:bg-amber-200 sm:hidden border-2 border-white"
                    aria-label="Scroll to top"
                  >
                    <span className="text-2xl" aria-hidden="true">
                      ↑
                    </span>
                  </button>
                </div>
                {/* Help Modal */}
                {showHelpModal && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Live Support Modal"
                  >
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <Image
                          src="/images/testimonial1.jpg"
                          alt="Support Agent"
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full border-2 border-amber-200 object-cover"
                        />
                        <div>
                          <div className="font-bold text-amber-900">
                            Priya (Live Support){' '}
                            <span
                              className="inline-block w-2 h-2 bg-green-400 rounded-full ml-1 animate-pulse"
                              title="Online"
                              aria-label="Online"
                            ></span>
                          </div>
                          <div className="text-xs text-amber-700">Typically replies in 2 min</div>
                        </div>
                      </div>
                      <div className="mb-4 text-amber-900">How can we help you today?</div>
                      <button
                        onClick={() => setShowHelpModal(false)}
                        className="bg-amber-100 text-amber-900 px-4 py-2 rounded-lg font-semibold hover:bg-amber-200 transition w-full mt-2"
                        autoFocus
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
                {/* Edit Profile Modal */}
                {showEditModal && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Edit Profile Modal"
                  >
                    <form
                      className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col gap-4"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setLoading(true);
                        setError('');
                        try {
                          const res = await fetch('/api/users/me', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(editForm),
                          });
                          if (!res.ok) throw new Error('Failed to update profile');
                          const updated = await res.json();
                          setUser(updated);
                          setShowEditModal(false);
                        } catch (err) {
                          setError((err as Error).message || 'Failed to update profile');
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      <h2 className="font-bold text-amber-900 text-lg mb-2">Edit Profile</h2>
                      <label className="text-sm text-amber-700 font-semibold" htmlFor="edit-name">
                        Name
                      </label>
                      <input
                        id="edit-name"
                        name="name"
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                        className="border border-amber-200 rounded px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                        required
                        aria-label="Edit name"
                      />
                      <label className="text-sm text-amber-700 font-semibold" htmlFor="edit-email">
                        Email
                      </label>
                      <input
                        id="edit-email"
                        name="email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                        className="border border-amber-200 rounded px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                        required
                        aria-label="Edit email"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          type="submit"
                          className="bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-700 transition w-full"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="bg-amber-100 text-amber-900 px-4 py-2 rounded-lg font-semibold hover:bg-amber-200 transition w-full"
                          onClick={() => setShowEditModal(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                {/* Address Modal */}
                {showAddressModal && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Edit Address Modal"
                  >
                    <form
                      className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col gap-4"
                      onSubmit={handleSaveAddress}
                    >
                      <h2 className="font-bold text-amber-900 text-lg mb-2">
                        {addressForm.id ? 'Edit Address' : 'Add Address'}
                      </h2>
                      <label
                        className="text-sm text-amber-700 font-semibold"
                        htmlFor="address-type"
                      >
                        Type
                      </label>
                      <select
                        id="address-type"
                        name="type"
                        value={addressForm.type}
                        onChange={(e) => setAddressForm((f) => ({ ...f, type: e.target.value }))}
                        className="border border-amber-200 rounded px-3 py-2"
                      >
                        <option value="shipping">Shipping</option>
                        <option value="billing">Billing</option>
                      </select>
                      <label
                        className="text-sm text-amber-700 font-semibold"
                        htmlFor="address-name"
                      >
                        Name
                      </label>
                      <input
                        id="address-name"
                        name="name"
                        type="text"
                        value={addressForm.name}
                        onChange={(e) => setAddressForm((f) => ({ ...f, name: e.target.value }))}
                        className="border border-amber-200 rounded px-3 py-2"
                        required
                      />
                      <label className="text-sm text-amber-700 font-semibold" htmlFor="address">
                        Address
                      </label>
                      <input
                        id="address"
                        name="address"
                        type="text"
                        value={addressForm.address}
                        onChange={(e) => setAddressForm((f) => ({ ...f, address: e.target.value }))}
                        className="border border-amber-200 rounded px-3 py-2"
                        required
                      />
                      <label className="text-sm text-amber-700 font-semibold" htmlFor="city">
                        City
                      </label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))}
                        className="border border-amber-200 rounded px-3 py-2"
                        required
                      />
                      <label className="text-sm text-amber-700 font-semibold" htmlFor="state">
                        State
                      </label>
                      <input
                        id="state"
                        name="state"
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm((f) => ({ ...f, state: e.target.value }))}
                        className="border border-amber-200 rounded px-3 py-2"
                        required
                      />
                      <label className="text-sm text-amber-700 font-semibold" htmlFor="zip">
                        Zip Code
                      </label>
                      <input
                        id="zip"
                        name="zipCode"
                        type="text"
                        value={addressForm.zipCode}
                        onChange={(e) => setAddressForm((f) => ({ ...f, zipCode: e.target.value }))}
                        className="border border-amber-200 rounded px-3 py-2"
                        required
                      />
                      <label className="text-sm text-amber-700 font-semibold" htmlFor="phone">
                        Phone
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="text"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm((f) => ({ ...f, phone: e.target.value }))}
                        className="border border-amber-200 rounded px-3 py-2"
                        required
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          type="submit"
                          className="bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-700 transition w-full"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="bg-amber-100 text-amber-900 px-4 py-2 rounded-lg font-semibold hover:bg-amber-200 transition w-full"
                          onClick={() => setShowAddressModal(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                {/* Password Modal */}
                {showPasswordModal && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Change Password Modal"
                  >
                    <form
                      className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col gap-4"
                      onSubmit={handlePasswordChange}
                    >
                      <h2 className="font-bold text-amber-900 text-lg mb-2">Change Password</h2>
                      <label className="text-sm text-amber-700 font-semibold" htmlFor="current">
                        Current Password
                      </label>
                      <input
                        id="current"
                        name="current"
                        type="password"
                        value={passwordForm.current}
                        onChange={(e) =>
                          setPasswordForm((f) => ({ ...f, current: e.target.value }))
                        }
                        className="border border-amber-200 rounded px-3 py-2"
                        required
                      />
                      <label className="text-sm text-amber-700 font-semibold" htmlFor="new">
                        New Password
                      </label>
                      <input
                        id="new"
                        name="new"
                        type="password"
                        value={passwordForm.new}
                        onChange={(e) => setPasswordForm((f) => ({ ...f, new: e.target.value }))}
                        className="border border-amber-200 rounded px-3 py-2"
                        required
                      />
                      <label className="text-sm text-amber-700 font-semibold" htmlFor="confirm">
                        Confirm Password
                      </label>
                      <input
                        id="confirm"
                        name="confirm"
                        type="password"
                        value={passwordForm.confirm}
                        onChange={(e) =>
                          setPasswordForm((f) => ({ ...f, confirm: e.target.value }))
                        }
                        className="border border-amber-200 rounded px-3 py-2"
                        required
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          type="submit"
                          className="bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-700 transition w-full"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="bg-amber-100 text-amber-900 px-4 py-2 rounded-lg font-semibold hover:bg-amber-200 transition w-full"
                          onClick={() => setShowPasswordModal(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                {/* Referral Modal */}
                {showReferralModal && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Referral Modal"
                  >
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col gap-4 items-center">
                      <h2 className="font-bold text-amber-900 text-lg mb-2">Referral Program</h2>
                      <div className="text-xs text-amber-700 mb-2">
                        Share this link with friends and earn rewards!
                      </div>
                      <input
                        type="text"
                        value="https://shankarmala.com/referral/ABC123"
                        readOnly
                        className="border border-amber-200 rounded px-3 py-2 w-full"
                      />
                      <button
                        className="bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-700 transition w-full"
                        onClick={() => {
                          if (typeof navigator !== 'undefined' && navigator.clipboard) {
                            navigator.clipboard.writeText(
                              'https://shankarmala.com/referral/ABC123',
                            );
                          }
                        }}
                      >
                        Copy Link
                      </button>
                      <button
                        className="bg-amber-100 text-amber-900 px-4 py-2 rounded-lg font-semibold hover:bg-amber-200 transition w-full"
                        onClick={() => setShowReferralModal(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </Layout>
    </>
  );
};

export default AccountPage;
