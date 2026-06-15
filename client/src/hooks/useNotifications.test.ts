import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotifications } from './useNotifications';

describe('useNotifications', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with empty notifications', () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should add a notification', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification({
        type: 'order',
        title: 'Nouvelle commande',
        message: 'Votre commande a été confirmée',
      });
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].type).toBe('order');
    expect(result.current.notifications[0].title).toBe('Nouvelle commande');
    expect(result.current.unreadCount).toBe(1);
  });

  it('should mark notification as read', () => {
    const { result } = renderHook(() => useNotifications());

    let notificationId: string;
    act(() => {
      result.current.addNotification({
        type: 'order',
        title: 'Test',
        message: 'Message test',
      });
      notificationId = result.current.notifications[0].id;
    });

    act(() => {
      result.current.markAsRead(notificationId!);
    });

    expect(result.current.notifications[0].read).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should mark all notifications as read', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification({
        type: 'order',
        title: 'Test 1',
        message: 'Message 1',
      });
      result.current.addNotification({
        type: 'promotion',
        title: 'Test 2',
        message: 'Message 2',
      });
    });

    expect(result.current.unreadCount).toBe(2);

    act(() => {
      result.current.markAllAsRead();
    });

    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications.every((n) => n.read)).toBe(true);
  });

  it('should remove a notification', () => {
    const { result } = renderHook(() => useNotifications());

    let notificationId: string;
    act(() => {
      result.current.addNotification({
        type: 'order',
        title: 'Test',
        message: 'Message test',
      });
      notificationId = result.current.notifications[0].id;
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      result.current.removeNotification(notificationId!);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('should clear all notifications', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification({
        type: 'order',
        title: 'Test 1',
        message: 'Message 1',
      });
      result.current.addNotification({
        type: 'promotion',
        title: 'Test 2',
        message: 'Message 2',
      });
    });

    expect(result.current.notifications).toHaveLength(2);

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('should persist notifications to localStorage', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification({
        type: 'order',
        title: 'Test',
        message: 'Message test',
      });
    });

    const stored = localStorage.getItem('cavaly_notifications');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].title).toBe('Test');
  });

  it('should load notifications from localStorage', () => {
    const mockNotifications = [
      {
        id: 'notif_123',
        type: 'order' as const,
        title: 'Test',
        message: 'Message test',
        timestamp: Date.now(),
        read: false,
      },
    ];
    localStorage.setItem('cavaly_notifications', JSON.stringify(mockNotifications));

    const { result } = renderHook(() => useNotifications());
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].title).toBe('Test');
  });

  it('should limit notifications to MAX_NOTIFICATIONS', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      for (let i = 0; i < 60; i++) {
        result.current.addNotification({
          type: 'order',
          title: `Test ${i}`,
          message: `Message ${i}`,
        });
      }
    });

    expect(result.current.notifications.length).toBeLessThanOrEqual(50);
  });

  it('should add notification with optional fields', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification({
        type: 'order',
        title: 'Test',
        message: 'Message test',
        icon: '📦',
        actionUrl: '/orders/123',
      });
    });

    expect(result.current.notifications[0].icon).toBe('📦');
    expect(result.current.notifications[0].actionUrl).toBe('/orders/123');
  });

  it('should calculate unread count correctly', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification({
        type: 'order',
        title: 'Test 1',
        message: 'Message 1',
      });
      result.current.addNotification({
        type: 'promotion',
        title: 'Test 2',
        message: 'Message 2',
      });
    });

    expect(result.current.unreadCount).toBe(2);

    act(() => {
      result.current.markAsRead(result.current.notifications[0].id);
    });

    expect(result.current.unreadCount).toBe(1);
  });
});
