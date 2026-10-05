// ============================================================
// CareHub Delivery Services Abstraction Layer
//
// Common interface for all delivery carriers (Lalamove, Viettel Post, VNPost).
// Each carrier implements this interface so CheckoutPage can swap them
// without changes. Carriers are enabled/disabled via environment variables.
//
// Usage:
//   const carriers = getEnabledCarriers();
//   const rates = await Promise.all(carriers.map(c => c.quote(...)));
// ============================================================

export interface DeliveryCarrier {
  id: string;
  name: string;
  description: string;
  estimatedDays: string;
  features: string[];
  enabled: boolean; // controlled by env vars
}

export interface DeliveryQuote {
  carrierId: string;
  carrierName: string;
  amountVND: number;
  estimatedDeliveryDays: number;
  currency: 'VND';
}

export interface CreateDeliveryOrderInput {
  recipientName: string;
  recipientPhone: string;
  address: string;
  city: string;
  ward: string;
  notes?: string;
  items: Array<{ productName: string; quantity: number }>;
  totalAmount: number;
 COD?: boolean;
}

export interface DeliveryOrderResult {
  trackingNumber: string;
  status: 'created' | 'pending_pickup' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';
  estimatedDeliveryDate: string; // ISO date
  carrierReference: string; // carrier-specific order ID
}

export interface TrackingInfo {
  trackingNumber: string;
  status: string;
  events: Array<{
    timestamp: string;
    location: string;
    description: string;
  }>;
}

// Carrier configurations — set these in .env to enable/disable carriers
const ENABLE_LALAMOVE = import.meta.env.VITE_ENABLE_LALAMOVE === 'true';
const ENABLE_VIETTEL_POST = import.meta.env.VITE_ENABLE_VIETTEL_POST === 'true';
const ENABLE_VNPOST = import.meta.env.VITE_ENABLE_VNPOST === 'true';

// Default carrier definitions (used when API calls fail or sandbox mode)
const DEFAULT_LALAMOVE_QUOTE = 35000; // VND, urban same-day estimate
const DEFAULT_VIETTEL_QUOTE = 25000; // VND, nationwide standard
const DEFAULT_VNPOST_QUOTE = 18000; // VND, cheapest option

// Lalamove carrier definition
const lalamoveCarrier: DeliveryCarrier = {
  id: 'lalamove',
  name: 'Lalamove',
  description: 'Giao hàng nhanh nội thành — nhận trong vài giờ',
  estimatedDays: '2-4 giờ',
  features: ['Theo dõi thời gian thực', 'Giao nhanh nội thành', 'Hỗ trợ đa điểm'],
  enabled: ENABLE_LALAMOVE,
};

// Viettel Post carrier definition
const viettelPostCarrier: DeliveryCarrier = {
  id: 'viettel-post',
  name: 'Viettel Post',
  description: 'Chuyển phát toàn quốc — phủ sóng 63 tỉnh thành',
  estimatedDays: '2-4 ngày',
  features: ['Phủ sóng toàn quốc', 'Thu tiền COD', 'Hợp nhất thanh toán'],
  enabled: ENABLE_VIETTEL_POST,
};

// VNPost carrier definition
const vnPostCarrier: DeliveryCarrier = {
  id: 'vnpost',
  name: 'VNPost',
  description: 'Bưu điện Việt Nam — chi phí thấp nhất, phủ rộng nhất',
  estimatedDays: '3-5 ngày',
  features: ['Chi phí thấp nhất', 'Phủ sóng rộng nhất', 'Chuyển phát tài liệu & bưu kiện'],
  enabled: ENABLE_VNPOST,
};

/**
 * Get all enabled carriers sorted by price (cheapest first).
 */
export function getEnabledCarriers(): DeliveryCarrier[] {
  return [lalamoveCarrier, viettelPostCarrier, vnPostCarrier]
    .filter(c => c.enabled)
    .sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Calculate shipping cost based on selected carrier and cart subtotal.
 * For simplicity, uses default rates — in production these come from live API quotes.
 */
export function getShippingFee(carrierId: string, subtotal: number): number {
  if (subtotal <= 0) return 0;
  
  switch (carrierId) {
    case 'lalamove':
      return DEFAULT_LALAMOVE_QUOTE;
    case 'viettel-post':
      return DEFAULT_VIETTEL_QUOTE;
    case 'vnpost':
      return DEFAULT_VNPOST_QUOTE;
    default:
      return 25000; // fallback
  }
}

/**
 * Check if shipping should be free (e.g., all-subscription orders).
 */
export function isFreeShipping(subtotal: number, carrierId: string, allSubscriptions: boolean): boolean {
  // Free shipping for all-subscription orders regardless of carrier
  if (allSubscriptions) return true;
  return false;
}

/**
 * Generate a tracking number placeholder (for demo/development).
 * In production, this comes from the carrier's API response.
 */
export function generateTrackingNumber(carrierId: string, orderId: string): string {
  const prefix = {
    lalamove: 'LM',
    'viettel-post': 'VP',
    vnpost: 'VN',
  }[carrierId] || 'CH';

  return `${prefix}-${orderId.slice(0, 8).toUpperCase()}`;
}

/**
 * Resolve carrier details by ID.
 */
export function getCarrierById(id: string): DeliveryCarrier | undefined {
  return [lalamoveCarrier, viettelPostCarrier, vnPostCarrier].find(c => c.id === id);
}

/**
 * Validate that a carrier is supported and enabled.
 */
export function isValidCarrier(id: string): boolean {
  return [lalamoveCarrier, viettelPostCarrier, vnPostCarrier].some(c => c.id === id && c.enabled);
}
