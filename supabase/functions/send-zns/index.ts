import { createClient } from 'npm:@supabase/supabase-js@2.54.0';

// Restrict CORS to the deployed site. The app is served from GitHub Pages.
const ALLOWED_ORIGIN = 'https://ryan-wongkeiming.github.io';
const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Zalo ZNS API
// Template IDs must be pre-approved in the Zalo Cloud Account.
const ZALO_ACCESS_TOKEN = Deno.env.get('ZALO_ZNS_ACCESS_TOKEN') ?? '';
const ZALO_PHONE_ID = Deno.env.get('ZALO_PHONE_ID') ?? ''; // OA id for the sender

// Map template types to template ids configured in Zalo Cloud Account.
// Replace these with the actual template ids you get after approval.
const TEMPLATE_IDS: Record<string, string> = {
  order_confirmed: Deno.env.get('ZNS_TEMPLATE_ORDER_CONFIRMED') ?? '',
  order_shipped: Deno.env.get('ZNS_TEMPLATE_ORDER_SHIPPED') ?? '',
  order_delivered: Deno.env.get('ZNS_TEMPLATE_ORDER_DELIVERED') ?? '',
  payment_received: Deno.env.get('ZNS_TEMPLATE_PAYMENT_RECEIVED') ?? '',
};

interface SendZnsRequest {
  orderId: string;
  templateType: keyof typeof TEMPLATE_IDS;
  phone?: string;
  [key: string]: string | undefined;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the caller is an authenticated user (staff) or system.
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: SendZnsRequest = await req.json();
    const { orderId, templateType, phone } = body;

    if (!orderId || !templateType) {
      return new Response(
        JSON.stringify({ error: 'orderId and templateType are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!ZALO_ACCESS_TOKEN || !ZALO_PHONE_ID) {
      return new Response(
        JSON.stringify({ error: 'Zalo ZNS not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const templateId = TEMPLATE_IDS[templateType];
    if (!templateId) {
      return new Response(
        JSON.stringify({ error: `No template configured for ${templateType}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine target phone: from request or from the order.
    let targetPhone = phone;
    if (!targetPhone) {
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('phone, user_id')
        .eq('id', orderId)
        .single();
      targetPhone = order?.phone;
    }

    if (!targetPhone) {
      return new Response(
        JSON.stringify({ error: 'No phone number to send ZNS' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize phone to E.164 (Zalo requires +84 for VN numbers).
    const normalizedPhone = normalizeVnPhone(targetPhone);

    // Build ZNS template data (fields the template expects).
    // The template uses {{name}}, {{order_code}}, etc. Adjust to your approved template.
    const templateData: Record<string, string> = {
      phone: normalizedPhone,
      template_id: templateId,
      template_type: templateType,
      // Populate common params from the request body (order code, amount, etc.)
      ...Object.fromEntries(
        Object.entries(body).filter(([k]) => !['orderId', 'templateType', 'phone'].includes(k))
      ),
    };

    // Send via Zalo ZNS API (business.openapi.zalo.me/message/template)
    const znsRes = await fetch('https://business.openapi.zalo.me/message/template', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ZALO_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        phone: normalizedPhone,
        template_id: templateId,
        template_data: templateData,
      }),
    });

    const znsJson = await znsRes.json();
    const ok = znsRes.ok && znsJson.error === 0;

    // Log the attempt
    await supabaseAdmin
      .from('zns_log')
      .insert({
        order_id: orderId,
        user_id: user.id,
        template_type: templateType,
        phone: normalizedPhone,
        status: ok ? 'sent' : 'failed',
        zalo_msg_id: znsJson.data?.msg_id ?? null,
        error_message: ok ? null : (znsJson.message || 'ZNS send failed'),
      });

    if (!ok) {
      console.error('ZNS send failed:', znsJson);
      return new Response(
        JSON.stringify({ error: znsJson.message || 'Gửi thông báo Zalo thất bại.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, msg_id: znsJson.data?.msg_id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in send-zns:', error);
    return new Response(
      JSON.stringify({ error: 'Có lỗi không mong muốn xảy ra. Vui lòng thử lại sau.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Normalize a Vietnamese phone number to E.164 (+84...)
function normalizeVnPhone(phone: string): string {
  const p = phone.replace(/[^\d]/g, '');
  if (p.startsWith('84')) return `+${p}`;
  if (p.startsWith('0')) return `+84${p.slice(1)}`;
  return `+84${p}`;
}
