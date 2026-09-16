import { supabase } from '../lib/supabaseClient';

interface PromoCode {
  code: string;
  discount: number; // in VND
  description: string;
  isActive: boolean;
}

// Validate promo code against Supabase database
export const validatePromoCode = async (code: string): Promise<PromoCode | null> => {
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('code, discount, description, is_active')
      .eq('code', code.toLowerCase())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      code: data.code,
      discount: data.discount,
      description: data.description,
      isActive: data.is_active
    };
  } catch (error) {
    console.error('Error validating promo code:', error);
    return null;
  }
};