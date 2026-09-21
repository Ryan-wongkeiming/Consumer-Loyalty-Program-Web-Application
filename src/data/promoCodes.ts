import { supabase } from '../lib/supabaseClient';

export interface PromoCode {
  code: string;
  discount: number; // value: VND if fixed, percent if percent-type
  discountType: 'fixed' | 'percent';
  discountAmount: number; // final VND to apply
  description: string;
  isActive: boolean;
  expiresAt?: string | null;
  minOrderAmount?: number;
  remainingUses?: number | null;
}

// Validate a promo code by querying the database directly through the
// Supabase client (anon key). This is the same mechanism every other query
// in the app uses — no custom headers, no CORS issues, no edge function.
// The DB RLS policy only exposes active + not-expired codes, and we apply
// the usage/min-order checks here for good UX (the DB trigger remains the
// atomic backstop at order insert).
export const validatePromoCode = async (
  code: string,
  subtotal: number
): Promise<PromoCode | null> => {
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('code, discount, description, is_active, discount_type, expires_at, min_order_amount, type, max_uses, current_uses')
      .eq('code', code.trim().toLowerCase())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.error('Promo not found/inactive:', code, error);
      return null;
    }

    // Server-side-ish checks (the RLS already hides expired codes, but the
    // anon read returns the fields so we can double-check for good UX)
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return null; // expired
    }

    if (data.type === 'unique' && data.current_uses >= 1) {
      return null; // already used
    }

    if (data.type === 'multi-use' && data.max_uses !== null && data.current_uses >= data.max_uses) {
      return null; // limit reached
    }

    if (data.min_order_amount && subtotal < data.min_order_amount) {
      return null; // below minimum order
    }

    // Compute the final discount amount (correct for fixed AND percent)
    let discountAmount: number;
    if (data.discount_type === 'percent') {
      discountAmount = Math.round(subtotal * data.discount / 100);
    } else {
      discountAmount = data.discount;
    }

    return {
      code: data.code,
      discount: data.discount,
      discountType: data.discount_type || 'fixed',
      discountAmount,
      description: data.description,
      isActive: data.is_active,
      expiresAt: data.expires_at,
      minOrderAmount: data.min_order_amount || 0,
      remainingUses: data.type === 'unique'
        ? (data.current_uses >= 1 ? 0 : 1)
        : (data.max_uses === null ? null : Math.max(0, data.max_uses - data.current_uses)),
    };
  } catch (error) {
    console.error('Error validating promo code:', error);
    return null;
  }
};

// Kept for compatibility (used by callers that don't pass a subtotal).
export const validatePromoCodeDirect = async (code: string): Promise<PromoCode | null> =>
  validatePromoCode(code, 0);