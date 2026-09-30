import { createClient } from 'npm:@supabase/supabase-js@2.54.0';

// Restrict CORS to the deployed site. The app is served from GitHub Pages.
const ALLOWED_ORIGIN = 'https://ryan-wongkeiming.github.io';
const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

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

    // ---- Rate limit check (anti-abuse): max 10 redemptions per user per hour ----
    const RATE_LIMIT_MAX = 10;
    const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

    const { count: recentCount, error: rateError } = await supabaseAdmin
      .from('redemption_rate_limits')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('action', 'redeem_loyalty_code')
      .gte('created_at', windowStart);

    if (rateError) {
      console.error('Rate limit check error:', rateError);
    } else if ((recentCount ?? 0) >= RATE_LIMIT_MAX) {
      return new Response(
        JSON.stringify({ error: 'Bạn đã thực hiện quá nhiều giao dịch. Vui lòng thử lại sau.' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const { code }: { code: string } = await req.json();
    if (!code || typeof code !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Mã thưởng không tồn tại' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      return new Response(
        JSON.stringify({ error: 'Mã thưởng không tồn tại' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Run the whole claim + credit inside a single DB transaction via the
    // redeem_loyalty_code RPC. Either all writes commit or none do.
    const { data, error } = await supabaseAdmin.rpc('redeem_loyalty_code', {
      p_user_id: user.id,
      p_code: trimmedCode,
    });

    if (error) {
      console.error('redeem_loyalty_code RPC error:', error);
      const msg = error.message || '';
      if (msg.includes('Code not found')) {
        return new Response(
          JSON.stringify({ error: 'Mã thưởng không hợp lệ.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (msg.includes('already redeemed')) {
        return new Response(
          JSON.stringify({ error: 'Mã thưởng đã được sử dụng.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: 'Có lỗi xảy ra khi đổi mã' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record the redemption for rate limiting.
    await supabaseAdmin
      .from('redemption_rate_limits')
      .insert({ user_id: user.id, action: 'redeem_loyalty_code' });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Mã thưởng "${trimmedCode}" đổi thành công!`,
        totalPoints: data.total_points,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unexpected error in redeem-loyalty-code function:', error);
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
