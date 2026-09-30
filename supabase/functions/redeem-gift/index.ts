import { createClient } from 'npm:@supabase/supabase-js@2.54.0';

// Restrict CORS to the deployed site. The app is served from GitHub Pages.
const ALLOWED_ORIGIN = 'https://ryan-wongkeiming.github.io';
const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface RedeemGiftRequest {
  gift_id: string;
  shipping_details?: {
    full_name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    ward: string;
    notes?: string;
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client with service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Initialize Supabase client with user token for authentication
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const { gift_id, shipping_details }: RedeemGiftRequest = await req.json();
    if (!gift_id) {
      return new Response(
        JSON.stringify({ error: 'Gift ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Run the whole redemption inside a single DB transaction via the
    // redeem_gift RPC. Either all writes commit or none do — no manual
    // compensating rollback needed.
    const { data, error } = await supabaseAdmin.rpc('redeem_gift', {
      p_user_id: user.id,
      p_gift_id: gift_id,
      p_shipping: shipping_details ?? null,
    });

    if (error) {
      console.error('redeem_gift RPC error:', error);
      const msg = error.message || '';
      if (msg.includes('Insufficient points')) {
        return new Response(
          JSON.stringify({ error: 'Không đủ điểm thưởng để đổi quà này.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (msg.includes('out of stock')) {
        return new Response(
          JSON.stringify({ error: 'Quà tặng đã hết hàng.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (msg.includes('not found or inactive')) {
        return new Response(
          JSON.stringify({ error: 'Quà tặng không tồn tại hoặc không còn khả dụng.' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: 'Có lỗi xảy ra khi đổi quà. Vui lòng thử lại.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Đổi quà thành công! Bạn đã nhận "${data.gift_name}".`,
        gift_name: data.gift_name,
        points_spent: data.points_spent,
        remaining_points: data.remaining_points,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Unexpected error in redeem-gift function:', error);
    return new Response(
      JSON.stringify({
        error: 'Có lỗi không mong muốn xảy ra. Vui lòng thử lại sau.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
