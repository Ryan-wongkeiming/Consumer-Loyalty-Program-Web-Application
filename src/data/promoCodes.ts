import { supabase } from '../lib/supabaseClient';

export interface PromoCode {
  code: string;
  discount: number; // value: VND if fixed, percent if percent-type
  discountType: 'fixed' | 'percent';
  discountAmount: number; // final VND to apply (computed server-side)
  description: string;
  isActive: boolean;
  expiresAt?: string | null;
  minOrderAmount?: number;
  remainingUses?: number | null;
}

// Validate promo code via the server-side edge function (source of truth).
// Returns the computed discount amount + type, or null if invalid.
export const validatePromoCode = async (
  code: string,
  subtotal: number
): Promise<PromoCode | null> => {
  try {
    const base = import.meta.env.VITE_SUPABASE_URL || '';
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      // The edge-function gateway accepts the anon key (public) as the Bearer
      // token — no `apikey` header needed. Sending only `Authorization` keeps
      // the CORS preflight simple (that header is allowed by the function).
      'Authorization': `Bearer ${anonKey}`,
    };

    const res = await fetch(`${base}/functions/v1/validate-promo`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ code, subtotal }),
    });

    if (!res.ok) {
      // Try to surface the error code/message for better UX
      const body = await res.json().catch(() => ({}));
      console.error('Promo validation failed:', body);
      return null;
    }

    const data = await res.json();
    return {
      code: data.code,
      discount: data.discountValue,
      discountType: data.discountType,
      discountAmount: data.discountAmount,
      description: data.description,
      isActive: true,
      expiresAt: null,
      minOrderAmount: 0,
      remainingUses: data.remainingUses,
    };
  } catch (error) {
    console.error('Error validating promo code:', error);
    return null;
  }
};

// Fallback (used if the edge function is not deployed yet): validate directly
// against the DB. Keeps the old behavior working during transition.
export const validatePromoCodeDirect = async (code: string): Promise<PromoCode | null> => {
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('code, discount, description, is_active, discount_type, expires_at, min_order_amount, type, max_uses, current_uses')
      .eq('code', code.toLowerCase())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      code: data.code,
      discount: data.discount,
      discountType: data.discount_type || 'fixed',
      discountAmount: data.discount,
      description: data.description,
      isActive: data.is_active,
      expiresAt: data.expires_at,
      minOrderAmount: data.min_order_amount || 0,
    };
  } catch (error) {
    console.error('Error validating promo code:', error);
    return null;
  }
};