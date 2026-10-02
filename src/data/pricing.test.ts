import { describe, it, expect } from 'vitest';
import {
  getUnitPrice,
  getCartSubtotal,
  getCartSavings,
  getLineTotal,
  getLineSavings,
  getBundleMultiplier,
  getEffectiveDiscountPercent,
  getSubscriptionRate,
  formatPrice,
  STANDARD_SHIPPING_FEE,
} from './pricing';

// ---------- Helpers ----------
const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'test-product',
  name: 'Test Product',
  description: 'A test product',
  price: 900000,
  original_price: null,
  image: 'https://example.com/test.jpg',
  images: [],
  category: 'Vitamins',
  brand: 'Blackmores',
  benefits: [],
  ingredients: [],
  dosage: '1 tablet daily',
  rating: 0,
  reviews: 0,
  in_stock: true,
  is_subscription: false,
  ...overrides,
});

type Product = import('./products').Product;

// ---------- formatPrice ----------
describe('formatPrice', () => {
  it('formats using vi-VN locale with ₫ suffix', () => {
    // vi-VN uses a non-breaking space (U+00A0) between number and symbol
    expect(formatPrice(900000)).toBe('900.000\u00a0₫');
  });

  it('handles zero correctly', () => {
    expect(formatPrice(0)).toBe('0\u00a0₫');
  });

  it('handles small values', () => {
    expect(formatPrice(50000)).toBe('50.000\u00a0₫');
  });
});

// ---------- getSubscriptionRate ----------
describe('getSubscriptionRate', () => {
  it('returns 0.15 for regular products', () => {
    const p = makeProduct();
    expect(getSubscriptionRate(p)).toBe(0.15);
  });

  it('returns 0.10 for Infant Formula', () => {
    const p = makeProduct({ category: 'Infant Formula' });
    expect(getSubscriptionRate(p)).toBe(0.10);
  });
});

// ---------- getBundleMultiplier ----------
describe('getBundleMultiplier', () => {
  it('returns 1 when no bundle pricing', () => {
    const p = makeProduct();
    expect(getBundleMultiplier(p, 3)).toBe(1);
    expect(getBundleMultiplier(p, 5)).toBe(1);
  });

  it('applies highest applicable tier', () => {
    const p = makeProduct({
      bundlePricing: [
        { quantity: 3, discountPercent: 20, label: 'Buy 3 Save 20%' },
        { quantity: 5, discountPercent: 35, label: 'Buy 5 Save 35%' },
      ],
    });
    expect(getBundleMultiplier(p, 1)).toBe(1); // no tier
    expect(getBundleMultiplier(p, 2)).toBe(1); // no tier
    expect(getBundleMultiplier(p, 3)).toBeCloseTo(0.80); // 20% off
    expect(getBundleMultiplier(p, 4)).toBeCloseTo(0.80); // still 20%
    expect(getBundleMultiplier(p, 5)).toBeCloseTo(0.65); // 35% off
  });
});

// ---------- getUnitPrice ----------
describe('getUnitPrice', () => {
  it('returns base price for one-time order', () => {
    const p = makeProduct({ price: 900000 });
    const price = getUnitPrice(p, { quantity: 1, isSubscription: false, deliveryFrequency: '' });
    expect(price).toBe(900000);
  });

  it('applies subscription discount', () => {
    const p = makeProduct({ price: 900000 });
    const price = getUnitPrice(p, { quantity: 1, isSubscription: true, deliveryFrequency: 'Giao hàng mỗi 8 tuần' });
    // 900000 * 0.85 = 765000
    expect(price).toBe(765000);
  });

  it('applies infant formula subscription discount', () => {
    const p = makeProduct({ price: 900000, category: 'Infant Formula' });
    const price = getUnitPrice(p, { quantity: 1, isSubscription: true, deliveryFrequency: 'Giao hàng mỗi 8 tuần' });
    // 900000 * 0.90 = 810000
    expect(price).toBe(810000);
  });

  it('stacks bundle + subscription', () => {
    const p = makeProduct({
      price: 900000,
      bundlePricing: [{ quantity: 5, discountPercent: 35, label: 'Buy 5 Save 35%' }],
    });
    const price = getUnitPrice(p, { quantity: 5, isSubscription: true, deliveryFrequency: 'Giao hàng mỗi 8 tuần' });
    // Order in code: price → subscription mult → bundle mult
    // 900000 * 0.85 = 765000 → 765000 * 0.65 = 497250
    expect(price).toBe(497250);
  });
});

// ---------- getLineTotal / getLineSavings ----------
describe('getLineTotal & getLineSavings', () => {
  it('line total = unitPrice * quantity', () => {
    const p = makeProduct({ price: 900000 });
    expect(getLineTotal(p, { quantity: 3, isSubscription: false, deliveryFrequency: '' })).toBe(2700000);
  });

  it('line savings vs standard price', () => {
    const p = makeProduct({ price: 900000 });
    const savings = getLineSavings(p, { quantity: 1, isSubscription: true, deliveryFrequency: 'Giao hàng mỗi 8 tuần' });
    // Standard: 900000, Paid: 765000, Savings: 135000
    expect(savings).toBe(135000);
  });
});

// ---------- getCartSubtotal / getCartSavings ----------
describe('getCartSubtotal & getCartSavings', () => {
  it('sums line totals', () => {
    const items: Array<{ product: Product; quantity: number; isSubscription: boolean; deliveryFrequency: string }> = [
      { product: makeProduct({ price: 900000 }), quantity: 1, isSubscription: false, deliveryFrequency: '' },
      { product: makeProduct({ price: 600000 }), quantity: 2, isSubscription: false, deliveryFrequency: '' },
    ];
    expect(getCartSubtotal(items)).toBe(2100000);
  });

  it('includes subscription savings in cart savings', () => {
    const items: Array<{ product: Product; quantity: number; isSubscription: boolean; deliveryFrequency: string }> = [
      { product: makeProduct({ price: 900000 }), quantity: 1, isSubscription: true, deliveryFrequency: 'Giao hàng mỗi 8 tuần' },
    ];
    const savings = getCartSavings(items);
    expect(savings).toBe(135000); // 900000 * 0.15
  });
});

// ---------- getEffectiveDiscountPercent ----------
describe('getEffectiveDiscountPercent', () => {
  it('returns 0 for one-time order at base price', () => {
    const p = makeProduct({ price: 900000 });
    expect(getEffectiveDiscountPercent(p, { quantity: 1, isSubscription: false, deliveryFrequency: '' })).toBe(0);
  });

  it('returns correct effective % for subscription only', () => {
    const p = makeProduct({ price: 900000 });
    const pct = getEffectiveDiscountPercent(p, { quantity: 1, isSubscription: true, deliveryFrequency: 'Giao hàng mỗi 8 tuần' });
    expect(pct).toBe(15);
  });

  it('returns combined % for bundle + subscription', () => {
    const p = makeProduct({
      price: 900000,
      bundlePricing: [{ quantity: 5, discountPercent: 35, label: 'Buy 5 Save 35%' }],
    });
    const pct = getEffectiveDiscountPercent(p, { quantity: 5, isSubscription: true, deliveryFrequency: 'Giao hàng mỗi 8 tuần' });
    // Unit price = 497250, base = 900000, effective = (1 - 497250/900000) * 100 = 45%
    expect(pct).toBe(45);
  });
});

// ---------- STANDARD_SHIPPING_FEE ----------
describe('STANDARD_SHIPPING_FEE', () => {
  it('is 50000 VND', () => {
    expect(STANDARD_SHIPPING_FEE).toBe(50000);
  });
});
