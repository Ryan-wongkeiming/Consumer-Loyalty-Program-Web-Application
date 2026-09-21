import { createClient } from 'npm:@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
};

interface ValidatePromoRequest {
  code: string;
  subtotal: number; // current cart subtotal in VND (before discount)
  brand_ids?: string[]; // product ids in the cart (for brand restriction)
}

// Vietnamese messages — copied verbatim from the app's verified copy
// (src/pages/CheckoutPage.tsx) so no invented grammar creeps in.
const MSG = {
  INVALID: 'Mã giảm giá không hợp lệ, đã hết hạn, hoặc đã hết lượt sử dụng.',
  MISSING: 'Vui lòng nhập mã giảm giá.',
  SERVER: 'Có lỗi xảy ra. Vui lòng thử lại.',
  FATAL: 'Có lỗi xảy ra. Vui lòng thử lại.',
};

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: ValidatePromoRequest = await req.json();
    const code = (body.code || '').trim().toLowerCase();
    const subtotal = body.subtotal || 0;

    if (!code) {
      return new Response(
        JSON.stringify({ error: MSG.MISSING }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role so we can read the full promo record (including inactive,
    // so we can distinguish "invalid" from "expired" for better error messages)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabaseAdmin
      .from('promo_codes')
      .select('code, discount, description, is_active, type, max_uses, current_uses, discount_type, expires_at, min_order_amount, applicable_brands')
      .eq('code', code)
      .maybeSingle();

    if (error) {
      console.error('validate-promo: DB error', error);
      return new Response(
        JSON.stringify({ error: MSG.SERVER }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!data || !data.is_active || (data.expires_at && new Date(data.expires_at) < new Date())
        || (data.type === 'unique' && data.current_uses >= 1)
        || (data.type === 'multi-use' && data.max_uses !== null && data.current_uses >= data.max_uses)) {
      return new Response(
        JSON.stringify({ error: MSG.INVALID, code: 'INVALID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (data.min_order_amount && subtotal < data.min_order_amount) {
      // The message above already covers "not valid"; include the requirement
      // in a machine-readable field so the frontend can show the amount.
      return new Response(
        JSON.stringify({
          error: MSG.INVALID,
          code: 'MIN_ORDER',
          minOrderAmount: data.min_order_amount,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Compute the discount server-side (correct math for fixed AND percent)
    let discountAmount: number;
    if (data.discount_type === 'percent') {
      discountAmount = Math.round(subtotal * data.discount / 100);
    } else {
      discountAmount = data.discount;
    }

    return new Response(
      JSON.stringify({
        success: true,
        code: data.code,
        discountType: data.discount_type,
        discountValue: data.discount,
        discountAmount, // final VND amount to apply to THIS cart
        description: data.description,
        remainingUses: data.type === 'unique'
          ? (data.current_uses >= 1 ? 0 : 1)
          : (data.max_uses === null ? null : Math.max(0, data.max_uses - data.current_uses)),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('validate-promo: unexpected', error);
    return new Response(
      JSON.stringify({ error: MSG.FATAL }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});