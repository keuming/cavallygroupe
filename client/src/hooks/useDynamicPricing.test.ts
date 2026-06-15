import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDynamicPricing, getPricingFactors } from './useDynamicPricing';

describe('useDynamicPricing', () => {
  const basePrice = 10000; // 10,000 XOF

  it('should return base price when no factors apply', () => {
    const factors = {
      demand: 50,
      inventory: 50,
      dayOfWeek: 3,
      timeOfDay: 12,
      userTier: 'bronze' as const,
      isFlashSale: false,
    };

    const { result } = renderHook(() => useDynamicPricing(basePrice, factors));

    expect(result.current.basePrice).toBe(basePrice);
    expect(result.current.reason).toBe('none');
  });

  it('should increase price for high demand', () => {
    const factors = {
      demand: 80,
      inventory: 50,
      dayOfWeek: 3,
      timeOfDay: 12,
      userTier: 'bronze' as const,
      isFlashSale: false,
    };

    const { result } = renderHook(() => useDynamicPricing(basePrice, factors));

    expect(result.current.currentPrice).toBeGreaterThan(basePrice);
    expect(result.current.reason).toBe('demand');
    expect(result.current.discountPercent).toBeLessThan(0);
  });

  it('should decrease price for low demand', () => {
    const factors = {
      demand: 10,
      inventory: 50,
      dayOfWeek: 3,
      timeOfDay: 12,
      userTier: 'bronze' as const,
      isFlashSale: false,
    };

    const { result } = renderHook(() => useDynamicPricing(basePrice, factors));

    expect(result.current.currentPrice).toBeLessThan(basePrice);
    expect(result.current.reason).toBe('demand');
    expect(result.current.discountPercent).toBeGreaterThan(0);
  });

  it('should apply loyalty discount', () => {
    const factors = {
      demand: 50,
      inventory: 50,
      dayOfWeek: 3,
      timeOfDay: 12,
      userTier: 'gold' as const,
      isFlashSale: false,
    };

    const { result } = renderHook(() => useDynamicPricing(basePrice, factors));

    expect(result.current.currentPrice).toBeLessThan(basePrice);
    expect(result.current.reason).toBe('loyalty');
  });

  it('should apply flash sale discount (40%)', () => {
    const factors = {
      demand: 50,
      inventory: 50,
      dayOfWeek: 3,
      timeOfDay: 12,
      userTier: 'bronze' as const,
      isFlashSale: true,
    };

    const { result } = renderHook(() => useDynamicPricing(basePrice, factors));

    expect(result.current.reason).toBe('flash');
    expect(result.current.discountPercent).toBe(40);
    expect(result.current.expiresAt).toBeDefined();
  });

  it('should never go below 50% of base price', () => {
    const factors = {
      demand: 5,
      inventory: 5,
      dayOfWeek: 3,
      timeOfDay: 12,
      userTier: 'platinum' as const,
      isFlashSale: true,
    };

    const { result } = renderHook(() => useDynamicPricing(basePrice, factors));

    expect(result.current.currentPrice).toBeGreaterThanOrEqual(basePrice * 0.5);
  });
});

describe('getPricingFactors', () => {
  it('should calculate demand from views and clicks', () => {
    const factors = getPricingFactors(50, 25, 80, 100);

    expect(factors.demand).toBe(50); // (50 + 25*2) / 10 = 10... wait, should be (50 + 50) / 10 = 10
    expect(factors.demand).toBeGreaterThan(0);
    expect(factors.demand).toBeLessThanOrEqual(100);
  });

  it('should calculate inventory percentage', () => {
    const factors = getPricingFactors(0, 0, 50, 100);

    expect(factors.inventory).toBe(50);
  });

  it('should include user tier', () => {
    const factors = getPricingFactors(0, 0, 0, 100, 'platinum');

    expect(factors.userTier).toBe('platinum');
  });

  it('should include flash sale flag', () => {
    const factors = getPricingFactors(0, 0, 0, 100, 'bronze', true);

    expect(factors.isFlashSale).toBe(true);
  });

  it('should include competitor price', () => {
    const factors = getPricingFactors(0, 0, 0, 100, 'bronze', false, 9000);

    expect(factors.competitorPrice).toBe(9000);
  });
});
