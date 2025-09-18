import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationProvider, useNotification } from '../../components/context/NotificationContext';
import * as apiClient from '../../utils/apiClient';

// Mock the apiClient
jest.mock('../../utils/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Test component to use the context
const TestComponent: React.FC = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
  } = useNotification();

  return (
    <div>
      <div data-testid="notifications-count">{notifications.length}</div>
      <div data-testid="unread-count">{unreadCount}</div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error}</div>
      <button onClick={() => fetchNotifications()} data-testid="fetch-btn">
        Fetch Notifications
      </button>
      <button onClick={() => markAsRead(1)} data-testid="mark-read-btn">
        Mark as Read
      </button>
      <button onClick={() => markAllAsRead()} data-testid="mark-all-read-btn">
        Mark All as Read
      </button>
      <button
        onClick={() => addNotification({ title: 'Test', message: 'Test message', type: 'info', read: false })}
        data-testid="add-notification-btn"
      >
        Add Notification
      </button>
      <button onClick={() => removeNotification(1)} data-testid="remove-notification-btn">
        Remove Notification
      </button>
    </div>
  );
};

describe('NotificationContext', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide initial state', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
    expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    expect(screen.getByTestId('error')).toHaveTextContent('');
  });

  it('should fetch notifications', async () => {
    const mockNotifications = [
      { id: 1, title: 'Test 1', message: 'Message 1', type: 'info', read: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 2, title: 'Test 2', message: 'Message 2', type: 'success', read: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];

    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      ok: true,
      data: mockNotifications,
    });

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await user.click(screen.getByTestId('fetch-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('2');
      expect(screen.getByTestId('unread-count')).toHaveTextContent('1');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('should handle fetch notifications error', async () => {
    (apiClient.apiClient.get as jest.Mock).mockResolvedValue({
      ok: false,
    });

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await user.click(screen.getByTestId('fetch-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to fetch notifications');
    });
  });

  it('should mark a notification as read', async () => {
    (apiClient.apiClient.patch as jest.Mock).mockResolvedValue({
      ok: true,
      data: { id: 1, read: true },
    });

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await user.click(screen.getByTestId('mark-read-btn'));

    expect(apiClient.apiClient.patch).toHaveBeenCalledWith('/api/notifications/1', { read: true });
  });

  it('should mark all notifications as read', async () => {
    (apiClient.apiClient.post as jest.Mock).mockResolvedValue({
      ok: true,
      data: { message: 'All notifications marked as read', count: 5 },
    });

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await user.click(screen.getByTestId('mark-all-read-btn'));

    expect(apiClient.apiClient.post).toHaveBeenCalledWith('/api/notifications/read-all');
  });

  it('should add a notification', async () => {
    const newNotification = { id: 3, title: 'Test', message: 'Test message', type: 'info', read: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    
    (apiClient.apiClient.post as jest.Mock).mockResolvedValue({
      ok: true,
      data: newNotification,
    });

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await user.click(screen.getByTestId('add-notification-btn'));

    expect(apiClient.apiClient.post).toHaveBeenCalledWith('/api/notifications', {
      title: 'Test',
      message: 'Test message',
      type: 'info',
      read: false,
    });
  });

  it('should remove a notification', async () => {
    (apiClient.apiClient.delete as jest.Mock).mockResolvedValue({
      ok: true,
    });

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await user.click(screen.getByTestId('remove-notification-btn'));

    expect(apiClient.apiClient.delete).toHaveBeenCalledWith('/api/notifications/1');
  });
});