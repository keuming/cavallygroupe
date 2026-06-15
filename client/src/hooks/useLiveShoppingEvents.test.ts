import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLiveShoppingEvents } from './useLiveShoppingEvents';

describe('useLiveShoppingEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty events and loading state', () => {
    const { result } = renderHook(() => useLiveShoppingEvents());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.events).toEqual([]);
    expect(result.current.currentLiveEvent).toBeNull();
  });

  it('should load events after initialization', async () => {
    const { result } = renderHook(() => useLiveShoppingEvents());
    
    // Wait for events to load
    await new Promise(resolve => setTimeout(resolve, 600));
    
    expect(result.current.loading).toBe(false);
    expect(result.current.events.length).toBeGreaterThan(0);
  });

  it('should identify live events correctly', async () => {
    const { result } = renderHook(() => useLiveShoppingEvents());
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const liveEvents = result.current.getLiveEvents();
    expect(liveEvents.length).toBeGreaterThan(0);
    expect(liveEvents[0].status).toBe('live');
  });

  it('should identify upcoming events correctly', async () => {
    const { result } = renderHook(() => useLiveShoppingEvents());
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const upcomingEvents = result.current.getUpcomingEvents();
    expect(upcomingEvents.length).toBeGreaterThan(0);
    expect(upcomingEvents[0].status).toBe('upcoming');
  });

  it('should join an event and increase viewer count', async () => {
    const { result } = renderHook(() => useLiveShoppingEvents());
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const liveEvent = result.current.getLiveEvents()[0];
    const initialViewerCount = liveEvent.viewerCount;
    
    act(() => {
      result.current.joinEvent(liveEvent.id);
    });
    
    // Wait for state update
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const updatedEvent = result.current.events.find((e) => e.id === liveEvent.id);
    expect(updatedEvent?.viewerCount).toBe(initialViewerCount + 1);
  });

  it('should set current live event when joining', async () => {
    const { result } = renderHook(() => useLiveShoppingEvents());
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const liveEvent = result.current.getLiveEvents()[0];
    
    act(() => {
      result.current.joinEvent(liveEvent.id);
    });
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(result.current.currentLiveEvent?.id).toBe(liveEvent.id);
  });

  it('should leave an event and decrease viewer count', async () => {
    const { result } = renderHook(() => useLiveShoppingEvents());
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const liveEvent = result.current.getLiveEvents()[0];
    
    act(() => {
      result.current.joinEvent(liveEvent.id);
    });
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const joinedViewerCount = result.current.events.find((e) => e.id === liveEvent.id)?.viewerCount || 0;
    
    act(() => {
      result.current.leaveEvent(liveEvent.id);
    });
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const leftViewerCount = result.current.events.find((e) => e.id === liveEvent.id)?.viewerCount || 0;
    expect(leftViewerCount).toBe(joinedViewerCount - 1);
  });

  it('should clear current event when leaving', async () => {
    const { result } = renderHook(() => useLiveShoppingEvents());
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const liveEvent = result.current.getLiveEvents()[0];
    
    act(() => {
      result.current.joinEvent(liveEvent.id);
    });
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(result.current.currentLiveEvent).not.toBeNull();
    
    act(() => {
      result.current.leaveEvent(liveEvent.id);
    });
    
    expect(result.current.currentLiveEvent).toBeNull();
  });

  it('should format time remaining correctly', async () => {
    const { result } = renderHook(() => useLiveShoppingEvents());
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const liveEvent = result.current.getLiveEvents()[0];
    const timeRemaining = result.current.getTimeRemaining(liveEvent.endTime);
    
    expect(timeRemaining).toMatch(/\d+[hm]/);
  });

  it('should return "Terminé" for past dates', async () => {
    const { result } = renderHook(() => useLiveShoppingEvents());
    
    const pastDate = new Date(Date.now() - 1000);
    const timeRemaining = result.current.getTimeRemaining(pastDate);
    
    expect(timeRemaining).toBe('Terminé');
  });

  it('should have products in events', async () => {
    const { result } = renderHook(() => useLiveShoppingEvents());
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const events = result.current.events;
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].products.length).toBeGreaterThan(0);
    expect(events[0].products[0]).toHaveProperty('id');
    expect(events[0].products[0]).toHaveProperty('name');
    expect(events[0].products[0]).toHaveProperty('price');
    expect(events[0].products[0]).toHaveProperty('discount');
  });

  it('should have discount codes in events', async () => {
    const { result } = renderHook(() => useLiveShoppingEvents());
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const events = result.current.events;
    expect(events.length).toBeGreaterThan(0);
    expect(events[0]).toHaveProperty('discountCode');
    expect(events[0]).toHaveProperty('discountPercentage');
  });
});
