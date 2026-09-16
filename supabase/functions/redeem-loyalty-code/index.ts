import { createClient } from 'npm:@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
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

    // Atomically claim the code: update only if it exists, is unredeemed, and has
    // never been redeemed by anyone. The WHERE clause makes concurrent requests
    // race-safe — only one wins because the second sees is_redeemed = true.
    const claimedAt = new Date().toISOString();
    const { data: claimedCode, error: claimError } = await supabaseAdmin
      .from('loyalty_codes')
      .update({
        is_redeemed: true,
        redeemed_by_user_id: user.id,
        redeemed_at: claimedAt,
      })
      .eq('code', trimmedCode)
      .eq('is_redeemed', false)
      .is('redeemed_by_user_id', null)
      .select()
      .single();

    if (claimError) {
      // PGRST116 = no rows matched the WHERE clause (code invalid or already used)
      if (claimError.message?.includes('PGRST116')) {
        return new Response(
          JSON.stringify({
            error: 'Mã thưởng không hợp lệ hoặc đã được sửử dụng.',
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      console.error('Error claiming loyalty code:', claimError);
      return new Response(
        JSON.stringify({ error: 'Có lỗi xảy ra khi đổi mã' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Add points to the user's loyalty balance.
    // If no row exists yet, insert one; otherwise increment atomically.
    const { data: existingPoints, error: pointsError } = await supabaseAdmin
      .from('user_loyalty_points')
      .select('user_id, total_points')
      .eq('user_id', user.id)
      .maybeSingle();

    if (pointsError) {
      console.error('Error reading user loyalty points:', pointsError);
      return new Response(
        JSON.stringify({ error: 'Có lỗi xảy ra khi đổi mã' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let pointsUpdateError: { message: string } | null = null;
    if (existingPoints) {
      // Increment points
      const { error } = await supabaseAdmin
        .from('user_loyalty_points')
        .update({
          total_points: existingPoints.total_points + claimedCode.points,
          last_updated_at: claimedAt,
        })
        .eq('user_id', user.id);
      pointsUpdateError = error;
    } else {
      // Create a points record for this user
      const { error } = await supabaseAdmin
        .from('user_loyalty_points')
        .insert({
          user_id: user.id,
          total_points: claimedCode.points,
          last_updated_at: claimedAt,
        });
      pointsUpdateError = error;
    }

    if (pointsUpdateError) {
      console.error('Error crediting loyalty points:', pointsUpdateError);

      // Compensating rollback: the code was claimed but points could not be
      // credited, so release the code for another attempt.
      await supabaseAdmin
        .from('loyalty_codes')
        .update({
          is_redeemed: false,
          redeemed_by_user_id: null,
          redeemed_at: null,
        })
        .eq('code', trimmedCode)
        .eq('redeemed_by_user_id', user.id);

      return new Response(
        JSON.stringify({ error: 'Có lỗi xảy ra khi đổi mã' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Return the new total
    const newTotal = (existingPoints?.total_points || 0) + claimedCode.points;
    return new Response(
      JSON.stringify({
        success: true,
        message: `Mã thưởng "${trimmedCode}" đổi thành công!`,
        totalPoints: newTotal,
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
        error: 'Có lỗi không mong muốn xảyra. Vui lòng thử lại sau.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});