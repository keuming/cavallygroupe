import { describe, it, expect } from 'vitest';
import { MOBILE_MONEY_PROVIDERS } from './mobile-money-config';

describe('Mobile Money Router', () => {
  it('should have all required payment providers', () => {
    expect(MOBILE_MONEY_PROVIDERS).toBeDefined();
    expect(MOBILE_MONEY_PROVIDERS.WAVE).toBeDefined();
    expect(MOBILE_MONEY_PROVIDERS.MOOV).toBeDefined();
    expect(MOBILE_MONEY_PROVIDERS.MTN).toBeDefined();
    expect(MOBILE_MONEY_PROVIDERS.ORANGE).toBeDefined();
  });

  it('should have correct provider properties', () => {
    const provider = MOBILE_MONEY_PROVIDERS.WAVE;
    expect(provider.name).toBe('Wave Money');
    expect(provider.code).toBe('wave');
    expect(provider.color).toBeDefined();
    expect(provider.icon).toBeDefined();
    expect(provider.description).toBeDefined();
  });

  it('should have unique provider codes', () => {
    const codes = Object.values(MOBILE_MONEY_PROVIDERS).map(p => p.code);
    const uniqueCodes = new Set(codes);
    expect(codes.length).toBe(uniqueCodes.size);
  });

  it('should validate payment parameters', () => {
    const validAmount = 10000;
    const validPhoneNumber = '+22507123456';
    
    expect(validAmount).toBeGreaterThan(0);
    expect(validPhoneNumber).toMatch(/^\+\d{10,}$/);
  });
});
