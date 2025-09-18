import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import { User, MapPin, Key, Bell, ArrowLeft } from 'lucide-react';
import LuxuryButton from '../components/ui/LuxuryButton';
import LuxuryCard from '../components/ui/LuxuryCard';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  role: string;
}

interface Address {
  id: number;
  type: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState<number | null>(null);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [addressForm, setAddressForm] = useState({
    type: 'shipping',
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: '',
    isDefault: false,
  });
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotionalEmails: true,
  });

  // Since we're not implementing the full functionality in this example,
  // we'll simulate some data for demonstration purposes
  React.useEffect(() => {
    // Simulate fetching user data
    setTimeout(() => {
      setUser({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        createdAt: new Date().toISOString(),
        role: 'customer',
      });
      
      setProfileForm({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      });
      
      setAddresses([
        {
          id: 1,
          type: 'shipping',
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main Street',
          address2: 'Apartment 4B',
          city: 'Kolkata',
          state: 'West Bengal',
          postalCode: '700001',
          country: 'India',
          phone: '9876543210',
          isDefault: true,
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    toast.success('Profile updated successfully');
    setEditingProfile(false);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Address saved successfully');
    setEditingAddress(null);
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    toast.success('Address deleted successfully');
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address.id);
    setAddressForm({
      type: address.type,
      firstName: address.firstName,
      lastName: address.lastName,
      address1: address.address1,
      address2: address.address2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault,
    });
  };

  const handleCancelAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      type: 'shipping',
      firstName: '',
      lastName: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      phone: '',
      isDefault: false,
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (changePasswordForm.newPassword !== changePasswordForm.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (changePasswordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    
    toast.success('Password changed successfully');
    setChangePasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
    setShowChangePassword(false);
  };

  const handleNotificationSettingsChange = (setting: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const saveNotificationSettings = async () => {
    toast.success('Notification settings saved successfully');
  };

  if (loading) {
    return (
      <Layout title="My Profile - Shankarmala">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout title="My Profile - Shankarmala">
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="bg-red-100 border border-red-300 text-red-800 px-6 py-4 rounded-xl text-center font-semibold shadow">
            You must be logged in to view this page. <Link href="/login" className="text-amber-700 underline">Login here</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Profile - Shankarmala">
      <Head>
        <title>My Profile - Shankarmala Gemstore</title>
      </Head>
      
      <main className="max-w-6xl mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-amber-900 luxury-font-serif">My Profile</h1>
          <Link href="/account">
            <LuxuryButton variant="secondary" size="md">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Account
            </LuxuryButton>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-2">
            <LuxuryCard className="mb-8 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-amber-900 luxury-font-serif">Personal Information</h2>
                {!editingProfile ? (
                  <LuxuryButton variant="secondary" size="sm" onClick={() => setEditingProfile(true)}>
                    Edit Profile
                  </LuxuryButton>
                ) : (
                  <div className="space-x-2">
                    <LuxuryButton variant="ghost" size="sm" onClick={() => setEditingProfile(false)}>
                      Cancel
                    </LuxuryButton>
                    <LuxuryButton variant="primary" size="sm" onClick={(e) => handleProfileSubmit(e as any)}>
                      Save Changes
                    </LuxuryButton>
                  </div>
                )}
              </div>
              
              {editingProfile ? (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 luxury-font-sans">First Name</label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                        className="luxury-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 luxury-font-sans">Last Name</label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                        className="luxury-input"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 luxury-font-sans">Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      className="luxury-input"
                      required
                    />
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xl mr-4 luxury-font-serif">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold luxury-font-serif">{user.firstName} {user.lastName}</h3>
                      <p className="text-gray-600 luxury-font-sans">{user.email}</p>
                      <p className="text-sm text-gray-500 luxury-font-sans">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-500 luxury-font-sans">First Name</p>
                      <p className="font-medium luxury-font-sans">{user.firstName || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 luxury-font-sans">Last Name</p>
                      <p className="font-medium luxury-font-sans">{user.lastName || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 luxury-font-sans">Email</p>
                      <p className="font-medium luxury-font-sans">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 luxury-font-sans">Account Type</p>
                      <p className="font-medium capitalize luxury-font-sans">{user.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 luxury-font-sans">Loyalty Program</p>
                      <Link href="/loyalty" className="font-medium text-amber-600 hover:text-amber-800 luxury-font-sans">
                        View Loyalty Points & Benefits
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </LuxuryCard>
            
            {/* Notification Settings Section */}
            <LuxuryCard className="mb-8 p-6">
              <h2 className="text-2xl font-semibold text-amber-900 mb-6 luxury-font-serif">Notification Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 luxury-font-sans">Email Notifications</h3>
                    <p className="text-sm text-gray-500 luxury-font-sans">Receive important updates via email</p>
                  </div>
                  <button
                    onClick={() => handleNotificationSettingsChange('emailNotifications', !notificationSettings.emailNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      notificationSettings.emailNotifications ? 'bg-amber-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 luxury-font-sans">SMS Notifications</h3>
                    <p className="text-sm text-gray-500 luxury-font-sans">Receive important updates via SMS</p>
                  </div>
                  <button
                    onClick={() => handleNotificationSettingsChange('smsNotifications', !notificationSettings.smsNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      notificationSettings.smsNotifications ? 'bg-amber-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        notificationSettings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 luxury-font-sans">Order Updates</h3>
                    <p className="text-sm text-gray-500 luxury-font-sans">Receive notifications about your orders</p>
                  </div>
                  <button
                    onClick={() => handleNotificationSettingsChange('orderUpdates', !notificationSettings.orderUpdates)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      notificationSettings.orderUpdates ? 'bg-amber-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        notificationSettings.orderUpdates ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 luxury-font-sans">Promotional Emails</h3>
                    <p className="text-sm text-gray-500 luxury-font-sans">Receive special offers and promotions</p>
                  </div>
                  <button
                    onClick={() => handleNotificationSettingsChange('promotionalEmails', !notificationSettings.promotionalEmails)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      notificationSettings.promotionalEmails ? 'bg-amber-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        notificationSettings.promotionalEmails ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="pt-4">
                  <LuxuryButton variant="primary" size="md" onClick={saveNotificationSettings}>
                    Save Notification Settings
                  </LuxuryButton>
                </div>
              </div>
            </LuxuryCard>
            
            {/* Password Change Section */}
            <LuxuryCard className="mb-8 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-amber-900 luxury-font-serif">Password & Security</h2>
                {!showChangePassword ? (
                  <LuxuryButton variant="secondary" size="sm" onClick={() => setShowChangePassword(true)}>
                    Change Password
                  </LuxuryButton>
                ) : (
                  <LuxuryButton variant="ghost" size="sm" onClick={() => {
                    setShowChangePassword(false);
                    setChangePasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmNewPassword: '',
                    });
                  }}>
                    Cancel
                  </LuxuryButton>
                )}
              </div>
              
              {showChangePassword && (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 luxury-font-sans">Current Password</label>
                    <input
                      type="password"
                      value={changePasswordForm.currentPassword}
                      onChange={(e) => setChangePasswordForm({...changePasswordForm, currentPassword: e.target.value})}
                      className="luxury-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 luxury-font-sans">New Password</label>
                    <input
                      type="password"
                      value={changePasswordForm.newPassword}
                      onChange={(e) => setChangePasswordForm({...changePasswordForm, newPassword: e.target.value})}
                      className="luxury-input"
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1 luxury-font-sans">Must be at least 6 characters long</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 luxury-font-sans">Confirm New Password</label>
                    <input
                      type="password"
                      value={changePasswordForm.confirmNewPassword}
                      onChange={(e) => setChangePasswordForm({...changePasswordForm, confirmNewPassword: e.target.value})}
                      className="luxury-input"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <LuxuryButton variant="primary" size="md" type="submit">
                      Update Password
                    </LuxuryButton>
                  </div>
                </form>
              )}
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2 luxury-font-sans">Security Tips</h3>
                <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1 luxury-font-sans">
                  <li>Use a strong password with a mix of letters, numbers, and symbols</li>
                  <li>Enable two-factor authentication for extra security</li>
                  <li>Never share your password with anyone</li>
                  <li>Change your password regularly</li>
                </ul>
              </div>
            </LuxuryCard>
          </div>
          
          {/* Addresses Section */}
          <div>
            <LuxuryCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-amber-900 luxury-font-serif">Addresses</h2>
                <LuxuryButton variant="primary" size="sm" onClick={() => {
                  setEditingAddress(null);
                  setAddressForm({
                    type: 'shipping',
                    firstName: '',
                    lastName: '',
                    address1: '',
                    address2: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: 'India',
                    phone: '',
                    isDefault: false,
                  });
                }}>
                  Add Address
                </LuxuryButton>
              </div>
              
              {editingAddress !== null || (!addresses.length && !editingAddress) ? (
                <form onSubmit={handleAddressSubmit} className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 luxury-font-sans">First Name</label>
                      <input
                        type="text"
                        value={addressForm.firstName}
                        onChange={(e) => setAddressForm({...addressForm, firstName: e.target.value})}
                        className="luxury-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 luxury-font-sans">Last Name</label>
                      <input
                        type="text"
                        value={addressForm.lastName}
                        onChange={(e) => setAddressForm({...addressForm, lastName: e.target.value})}
                        className="luxury-input"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 luxury-font-sans">Address Type</label>
                    <select
                      value={addressForm.type}
                      onChange={(e) => setAddressForm({...addressForm, type: e.target.value})}
                      className="luxury-select"
                    >
                      <option value="shipping">Shipping Address</option>
                      <option value="billing">Billing Address</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 luxury-font-sans">Address Line 1</label>
                    <input
                      type="text"
                      value={addressForm.address1}
                      onChange={(e) => setAddressForm({...addressForm, address1: e.target.value})}
                      className="luxury-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 luxury-font-sans">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      value={addressForm.address2}
                      onChange={(e) => setAddressForm({...addressForm, address2: e.target.value})}
                      className="luxury-input"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 luxury-font-sans">City</label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                        className="luxury-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 luxury-font-sans">State</label>
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                        className="luxury-input"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 luxury-font-sans">Postal Code</label>
                      <input
                        type="text"
                        value={addressForm.postalCode}
                        onChange={(e) => setAddressForm({...addressForm, postalCode: e.target.value})}
                        className="luxury-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 luxury-font-sans">Country</label>
                      <input
                        type="text"
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                        className="luxury-input"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 luxury-font-sans">Phone</label>
                    <input
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                      className="luxury-input"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                      className="luxury-checkbox"
                    />
                    <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900 luxury-font-sans">
                      Set as default address
                    </label>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <LuxuryButton variant="ghost" size="md" type="button" onClick={handleCancelAddress}>
                      Cancel
                    </LuxuryButton>
                    <LuxuryButton variant="primary" size="md" type="submit">
                      {editingAddress ? 'Update Address' : 'Add Address'}
                    </LuxuryButton>
                  </div>
                </form>
              ) : null}
              
              {addresses.length > 0 ? (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center mb-2">
                            <h3 className="font-semibold luxury-font-sans">
                              {address.firstName} {address.lastName}
                            </h3>
                            {address.isDefault && (
                              <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full luxury-font-sans">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 luxury-font-sans">
                            {address.address1}
                            {address.address2 && `, ${address.address2}`}
                          </p>
                          <p className="text-sm text-gray-600 luxury-font-sans">
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p className="text-sm text-gray-600 luxury-font-sans">{address.country}</p>
                          <p className="text-sm text-gray-600 luxury-font-sans">Phone: {address.phone}</p>
                          <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full capitalize luxury-font-sans">
                            {address.type}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="text-amber-600 hover:text-amber-800 luxury-font-sans"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-red-600 hover:text-red-800 luxury-font-sans"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 luxury-font-sans">No addresses added yet</p>
                  <LuxuryButton variant="secondary" size="md" className="mt-4" onClick={() => {
                    setEditingAddress(null);
                    setAddressForm({
                      type: 'shipping',
                      firstName: '',
                      lastName: '',
                      address1: '',
                      address2: '',
                      city: '',
                      state: '',
                      postalCode: '',
                      country: 'India',
                      phone: '',
                      isDefault: false,
                    });
                  }}>
                    Add Your First Address
                  </LuxuryButton>
                </div>
              )}
            </LuxuryCard>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default ProfilePage;