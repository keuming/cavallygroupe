import { useState, useEffect, useCallback } from 'react';

export interface DynamicPrice {
  basePrice: number;
  currentPrice: number;
  discount: number;
  discountPercent: number;
  reason: 'demand' | 'inventory' | 'seasonal' | 'flash' | 'loyalty' | 'none';
  expiresAt?: number;
}

interface PricingFactors {
  demand: number; // 0-100: how many people viewed/clicked
  inventory: number; // 0-100: stock level percentage
  dayOfWeek: number; // 0-6: Monday to Sunday
  timeOfDay: number; // 0-23: hour
  userTier: 'bronze' | 'silver' | 'gold' | 'platinum'; // loyalty tier
  isFlashSale: boolean;
  competitorPrice?: number;
}

const PRICING_RULES = {
  highDemand: { threshold: 70, discount: -15 }, // Increase by 15%
  lowDemand: { threshold: 20, discount: 25 }, // Discount 25%
  lowInventory: { threshold: 10, discount: -10 }, // Increase by 10%
  highInventory: { threshold: 80, discount: 20 }, // Discount 20%
  weekend: { discount: -5 }, // Increase 5% on weekends
  peakHours: { discount: -5 }, // Increase 5% during peak hours (18-21)
  loyaltyTiers: {
    bronze: 0,
    silver: 5,
    gold: 10,
    platinum: 15,
  },
  flashSale: 40, // 40% discount for flash sales
};

export function useDynamicPricing(basePrice: number, factors: PricingFactors): DynamicPrice {
  const [dynamicPrice, setDynamicPrice] = useState<DynamicPrice>({
    basePrice,
    currentPrice: basePrice,
    discount: 0,
    discountPercent: 0,
    reason: 'none',
  });

  const calculatePrice = useCallback(() => {
    let adjustedPrice = basePrice;
    let totalDiscount = 0;
    let reason: DynamicPrice['reason'] = 'none';

    // Rule 1: High demand increases price
    if (factors.demand > PRICING_RULES.highDemand.threshold) {
      const demandMultiplier = 1 + (factors.demand - PRICING_RULES.highDemand.threshold) / 100 * 0.15;
      adjustedPrice *= demandMultiplier;
      reason = 'demand';
    }
    // Rule 2: Low demand decreases price
    else if (factors.demand < PRICING_RULES.lowDemand.threshold) {
      totalDiscount += PRICING_RULES.lowDemand.discount;
      reason = 'demand';
    }

    // Rule 3: Low inventory increases price
    if (factors.inventory < PRICING_RULES.lowInventory.threshold) {
      const inventoryMultiplier = 1 + (PRICING_RULES.lowInventory.threshold - factors.inventory) / 100 * 0.10;
      adjustedPrice *= inventoryMultiplier;
      reason = 'inventory';
    }
    // Rule 4: High inventory decreases price
    else if (factors.inventory > PRICING_RULES.highInventory.threshold) {
      totalDiscount += PRICING_RULES.highInventory.discount;
      reason = 'inventory';
    }

    // Rule 5: Weekend pricing
    if (factors.dayOfWeek === 5 || factors.dayOfWeek === 6) {
      adjustedPrice *= 1 + PRICING_RULES.weekend.discount / 100;
      reason = 'seasonal';
    }

    // Rule 6: Peak hours pricing
    if (factors.timeOfDay >= 18 && factors.timeOfDay <= 21) {
      adjustedPrice *= 1 + PRICING_RULES.peakHours.discount / 100;
      reason = 'seasonal';
    }

    // Rule 7: Loyalty discount
    const loyaltyDiscount = PRICING_RULES.loyaltyTiers[factors.userTier];
    if (loyaltyDiscount > 0) {
      totalDiscount += loyaltyDiscount;
      reason = 'loyalty';
    }

    // Rule 8: Flash sale (highest priority)
    if (factors.isFlashSale) {
      totalDiscount = PRICING_RULES.flashSale;
      reason = 'flash';
    }

    // Rule 9: Competitor pricing
    if (factors.competitorPrice && factors.competitorPrice < adjustedPrice) {
      adjustedPrice = factors.competitorPrice * 0.95; // Undercut by 5%
      reason = 'demand';
    }

    // Apply discount
    if (totalDiscount > 0) {
      adjustedPrice = adjustedPrice * (1 - totalDiscount / 100);
    }

    // Round to nearest 100 (or 50 for small prices)
    const roundTo = adjustedPrice > 1000 ? 100 : 50;
    adjustedPrice = Math.round(adjustedPrice / roundTo) * roundTo;

    // Calculate discount amount
    const finalDiscount = basePrice - adjustedPrice;
    const finalDiscountPercent = Math.round((finalDiscount / basePrice) * 100);

    setDynamicPrice({
      basePrice,
      currentPrice: Math.max(adjustedPrice, basePrice * 0.5), // Never go below 50% of base
      discount: finalDiscount,
      discountPercent: finalDiscountPercent,
      reason,
      expiresAt: factors.isFlashSale ? Date.now() + 3600000 : undefined, // Flash sales expire in 1 hour
    });
  }, [basePrice, factors]);

  useEffect(() => {
    calculatePrice();
  }, [calculatePrice]);

  return dynamicPrice;
}

// Helper function to get pricing factors from product data
export function getPricingFactors(
  productViews: number,
  productClicks: number,
  inventoryLevel: number,
  maxInventory: number,
  userTier: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze',
  isFlashSale: boolean = false,
  competitorPrice?: number
): PricingFactors {
  const now = new Date();
  const demand = Math.min(100, (productViews + productClicks * 2) / 10);
  const inventory = Math.min(100, (inventoryLevel / maxInventory) * 100);

  return {
    demand,
    inventory,
    dayOfWeek: now.getDay(),
    timeOfDay: now.getHours(),
    userTier,
    isFlashSale,
    competitorPrice,
  };
}
