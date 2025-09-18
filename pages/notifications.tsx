import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import getSessionOrRedirect from '../utils/withServerAuth';
import { Session } from 'next-auth';
import { Bell, Check, Trash2, X, ArrowLeft } from 'lucide-react';
import { useNotification } from '../components/context/NotificationContext';
import LuxuryButton from '../components/ui/LuxuryButton';
import LuxuryCard from '../components/ui/LuxuryCard';

const NotificationsPage: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    loading,
    error
  } = useNotification();
  
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Layout title="Notifications - Shankarmala">
      <Head>
        <title>Notifications - Shankarmala Gemstore</title>
      </Head>
      
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 luxury-font-serif">Notifications</h1>
            <p className="text-gray-600 mt-2 luxury-font-sans">
              {unreadCount > 0 
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'All caught up! No new notifications.'}
            </p>
          </div>
          
          <div className="flex gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-sm rounded-md transition luxury-font-sans ${
                  filter === 'all'
                    ? 'bg-white shadow text-amber-700 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 text-sm rounded-md transition luxury-font-sans ${
                  filter === 'unread'
                    ? 'bg-white shadow text-amber-700 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Unread
              </button>
            </div>
            
            {unreadCount > 0 && (
              <LuxuryButton variant="primary" size="md" onClick={markAllAsRead}>
                Mark all as read
              </LuxuryButton>
            )}
          </div>
        </div>

        <LuxuryCard>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 luxury-font-sans">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-red-500 mx-auto">
                <Bell className="w-12 h-12 mx-auto" />
              </div>
              <p className="mt-4 text-red-500 luxury-font-sans">{error}</p>
              <LuxuryButton variant="primary" size="md" className="mt-4" onClick={() => window.location.reload()}>
                Retry
              </LuxuryButton>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mx-auto">
                <Bell className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 luxury-font-serif">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="mt-2 text-gray-500 luxury-font-sans">
                {filter === 'unread' 
                  ? 'You\'re all caught up! Check back later for new notifications.'
                  : 'You don\'t have any notifications yet. We\'ll notify you when something important happens.'}
              </p>
              <Link href="/shop">
                <LuxuryButton variant="primary" size="lg" className="mt-4">
                  Start Shopping
                </LuxuryButton>
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <li 
                  key={notification.id} 
                  className={`p-6 hover:bg-gray-50 transition ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(notification.type)}`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 luxury-font-serif">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mt-1.5"></span>
                        )}
                      </div>
                      <p className="mt-2 text-gray-600 luxury-font-sans">{notification.message}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500 luxury-font-sans">
                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                        {notification.orderId && (
                          <Link 
                            href={`/orders/${notification.orderId}`} 
                            className="text-amber-600 hover:text-amber-800 font-medium"
                          >
                            View Order #{notification.orderId}
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 text-gray-400 hover:text-green-600 rounded-full hover:bg-green-50 luxury-ripple"
                          aria-label="Mark as read"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 luxury-ripple"
                        aria-label="Delete notification"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </LuxuryCard>
      </div>
    </Layout>
  );
};

export default NotificationsPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const res = await getSessionOrRedirect(context);
  if ('redirect' in res) return res;

  const session = res.session as Session;
  
  return {
    props: {
      session,
    },
  };
};