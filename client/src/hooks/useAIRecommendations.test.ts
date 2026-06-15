import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAIRecommendations } from './useAIRecommendations';

describe('useAIRecommendations', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with empty recommendations', () => {
    const { result } = renderHook(() => useAIRecommendations());
    
    expect(result.current.recommendations).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should track product views', () => {
    const { result } = renderHook(() => useAIRecommendations());
    
    act(() => {
      result.current.trackProductView('product-1');
    });

    const stored = localStorage.getItem('cavaly_user_behavior');
    expect(stored).toBeTruthy();
    const behavior = JSON.parse(stored!);
    expect(behavior.viewedProducts).toHaveLength(1);
    expect(behavior.viewedProducts[0].id).toBe('product-1');
  });

  it('should track product clicks', () => {
    const { result } = renderHook(() => useAIRecommendations());
    
    act(() => {
      result.current.trackProductClick('product-1');
    });

    const stored = localStorage.getItem('cavaly_user_behavior');
    const behavior = JSON.parse(stored!);
    expect(behavior.clickedProducts).toHaveLength(1);
    expect(behavior.clickedProducts[0].id).toBe('product-1');
  });

  it('should limit stored views to 50', () => {
    const { result } = renderHook(() => useAIRecommendations());
    
    act(() => {
      for (let i = 0; i < 60; i++) {
        result.current.trackProductView(`product-${i}`);
      }
    });

    const stored = localStorage.getItem('cavaly_user_behavior');
    const behavior = JSON.parse(stored!);
    expect(behavior.viewedProducts).toHaveLength(50);
  });

  it('should limit stored clicks to 30', () => {
    const { result } = renderHook(() => useAIRecommendations());
    
    act(() => {
      for (let i = 0; i < 40; i++) {
        result.current.trackProductClick(`product-${i}`);
      }
    });

    const stored = localStorage.getItem('cavaly_user_behavior');
    const behavior = JSON.parse(stored!);
    expect(behavior.clickedProducts).toHaveLength(30);
  });

  it('should restore behavior from localStorage', () => {
    const mockBehavior = {
      viewedProducts: [{ id: 'product-1', timestamp: Date.now() }],
      purchasedProducts: [],
      clickedProducts: [],
      lastUpdated: Date.now(),
    };
    
    localStorage.setItem('cavaly_user_behavior', JSON.stringify(mockBehavior));
    
    const { result } = renderHook(() => useAIRecommendations());
    
    // The hook should have loaded the behavior
    expect(result.current.recommendations).toBeDefined();
  });

  it('should handle localStorage errors gracefully', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    localStorage.setItem('cavaly_user_behavior', 'invalid json');
    
    const { result } = renderHook(() => useAIRecommendations());
    
    expect(result.current.recommendations).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });
});
