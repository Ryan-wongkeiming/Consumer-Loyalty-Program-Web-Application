import { Product } from './products';

// ============================================================
// CareHub Savings Master Plan — single source of truth for pricing
//
// Layers (all stackable, in order):
//   1. Bundle tier (Buy More Save More): 3 units -20%, 5 units -35%
//      -> only for products that carry bundle_pricing in the DB
//   2. Subscribe & Save: -30% (Infant Formula: -20%)
//   3. Frequency bonus: 12 weeks +2% extra, 4 weeks -2%
//   4. Free shipping for subscribers
//
// unitPrice = basePrice x bundleTier x subscriptionMultiplier
//   e.g. Adult Immune+ (900,000) x 5-pack (0.65) x 4-week sub (0.72)
//        = 421,200/unit vs 900,000 standard — real stacking.
// ============================================================

export const SUBSCRIPTION_DISCOUNT = 0.3; // 30% off
export const INFANT_FORMULA_SUBSCRIPTION_DISCOUNT = 0.2; // 20% off (Blackmores AU pattern)
export const FREE_SHIPPING_THRESHOLD = 0; // subscribers always ship free
export const STANDARD_SHIPPING_FEE = 50000; // VND, non-subscribers

export interface BundleTier {
  quantity: number;
  discountPercent: number;
  label: string;
}

export interface BundlePricing {
  tiers: BundleTier[];
}

export const FREQUENCIES = [
  { label: 'Giao hàng mỗi 4 tuần', weeks: 4, bonus: 0, badge: 'Phổ biến nhất' },
  { label: 'Giao hàng mỗi 8 tuần', weeks: 8, bonus: 0, badge: '' },
  { label: 'Giao hàng mỗi 12 tuần', weeks: 12, bonus: 0, badge: '' },
];

export const parseBundlePricing = (value: unknown): BundleTier[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value as BundleTier[];
  if (typeof value === 'object') {
    const obj = value as { tiers?: BundleTier[] };
    if (Array.isArray(obj.tiers)) return obj.tiers;
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed as BundleTier[];
      if (Array.isArray(parsed.tiers)) return parsed.tiers;
    } catch {
      return [];
    }
  }
  return [];
};

export const getBundleTiers = (product: Product): BundleTier[] => {
  return parseBundlePricing((product as Product & { bundlePricing?: unknown }).bundlePricing);
};

// Highest discount tier for the given quantity (or 0% if none applies)
export const getBundleMultiplier = (product: Product, quantity: number): number => {
  const tiers = getBundleTiers(product);
  const applicable = tiers.filter(t => quantity >= t.quantity);
  if (applicable.length === 0) return 1;
  const best = applicable.reduce((a, b) => (b.discountPercent > a.discountPercent ? b : a));
  return 1 - best.discountPercent / 100;
};

export const getSubscriptionRate = (product: Product): number => {
  return product.category === 'Infant Formula'
    ? INFANT_FORMULA_SUBSCRIPTION_DISCOUNT
    : SUBSCRIPTION_DISCOUNT;
};

// Frequency bonus: flat discount at every frequency (Blackmores AU lesson).
// The frequency dropdown is a delivery-timing choice, not a price dial.
export const getFrequencyBonus = (_deliveryFrequency: string): number => {
  return 0;
};

export const getSubscriptionMultiplier = (
  product: Product,
  deliveryFrequency: string
): number => {
  return 1 - getSubscriptionRate(product) + getFrequencyBonus(deliveryFrequency);
};

// The full stacked unit price for a cart line
export const getUnitPrice = (
  product: Product,
  opts: { quantity: number; isSubscription: boolean; deliveryFrequency: string }
): number => {
  let price = product.price;
  if (opts.isSubscription) {
    price = product.price * getSubscriptionMultiplier(product, opts.deliveryFrequency);
  }
  return Math.round(price * getBundleMultiplier(product, opts.quantity));
};

export const getLineTotal = (
  product: Product,
  opts: { quantity: number; isSubscription: boolean; deliveryFrequency: string }
): number => {
  return getUnitPrice(product, opts) * opts.quantity;
};

// What the customer saves on a line vs buying everything at standard price
export const getLineSavings = (
  product: Product,
  opts: { quantity: number; isSubscription: boolean; deliveryFrequency: string }
): number => {
  const standardTotal = product.price * opts.quantity;
  const paidTotal = getLineTotal(product, opts);
  return Math.max(0, standardTotal - paidTotal);
};

export const getCartSubtotal = (
  items: { product: Product; quantity: number; isSubscription: boolean; deliveryFrequency: string }[]
): number => {
  return items.reduce((sum, item) => sum + getLineTotal(item.product, item), 0);
};

// Total savings from bundle + subscription + frequency vs standard prices
export const getCartSavings = (
  items: { product: Product; quantity: number; isSubscription: boolean; deliveryFrequency: string }[]
): number => {
  return items.reduce((sum, item) => sum + getLineSavings(item.product, item), 0);
};

// Effective single % discount for messaging (what the customer sees)
export const getEffectiveDiscountPercent = (
  product: Product,
  opts: { quantity: number; isSubscription: boolean; deliveryFrequency: string }
): number => {
  const unit = getUnitPrice(product, opts);
  return Math.round((1 - unit / product.price) * 100);
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};