import { createClient } from 'npm:@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
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

    // Start transaction-like operations using service role client
    // 1. Get user's current loyalty points
    const { data: userPoints, error: pointsError } = await supabaseAdmin
      .from('user_loyalty_points')
      .select('total_points')
      .eq('user_id', user.id)
      .maybeSingle();

    if (pointsError) {
      console.error('Error fetching user points:', pointsError);
      return new Response(
        JSON.stringify({ error: 'Không thể lấy thông tin điểm thưởng' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const currentPoints = userPoints?.total_points || 0;

    // 2. Get gift details
    const { data: gift, error: giftError } = await supabaseAdmin
      .from('loyalty_gifts')
      .select('*')
      .eq('id', gift_id)
      .eq('is_active', true)
      .single();

    if (giftError || !gift) {
      return new Response(
        JSON.stringify({ error: 'Quà tặng không tồn tại hoặc không còn khả dụng' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. Validate redemption
    if (currentPoints < gift.points_required) {
      return new Response(
        JSON.stringify({ 
          error: `Không đủ điểm thưởng. Bạn cần ${gift.points_required} điểm nhưng chỉ có ${currentPoints} điểm.` 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (gift.stock <= 0) {
      return new Response(
        JSON.stringify({ error: 'Quà tặng đã hết hàng' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 4. Perform redemption operations
    try {
      // Deduct points from user
      if (userPoints) {
        // Update existing points record
        const { error: updatePointsError } = await supabaseAdmin
          .from('user_loyalty_points')
          .update({ 
            total_points: currentPoints - gift.points_required,
            last_updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (updatePointsError) {
          throw new Error(`Lỗi cập nhật điểm: ${updatePointsError.message}`);
        }
      } else {
        // Create new points record (shouldn't happen in normal flow, but safety check)
        const { error: insertPointsError } = await supabaseAdmin
          .from('user_loyalty_points')
          .insert({
            user_id: user.id,
            total_points: Math.max(0, 0 - gift.points_required), // This would be negative, but constraint prevents it
            last_updated_at: new Date().toISOString()
          });

        if (insertPointsError) {
          throw new Error(`Lỗi tạo bản ghi điểm: ${insertPointsError.message}`);
        }
      }

      // Decrement gift stock
      const { error: updateStockError } = await supabaseAdmin
        .from('loyalty_gifts')
        .update({ 
          stock: gift.stock - 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', gift_id);

      if (updateStockError) {
        throw new Error(`Lỗi cập nhật kho: ${updateStockError.message}`);
      }

      // Record the redemption
      const redemptionData: any = {
        user_id: user.id,
        gift_id: gift_id,
        points_spent: gift.points_required,
        status: 'completed',
        notes: `Đổi quà: ${gift.name}`
      };

      // Add shipping details if provided
      if (shipping_details) {
        redemptionData.full_name = shipping_details.full_name;
        redemptionData.phone = shipping_details.phone;
        redemptionData.email = shipping_details.email || null;
        redemptionData.address = shipping_details.address;
        redemptionData.city = shipping_details.city;
        redemptionData.ward = shipping_details.ward;
        if (shipping_details.notes) {
          redemptionData.notes = `${redemptionData.notes}. Ghi chú: ${shipping_details.notes}`;
        }
      }

      const { error: redemptionError } = await supabaseAdmin
        .from('loyalty_redemptions')
        .insert(redemptionData);

      if (redemptionError) {
        throw new Error(`Lỗi ghi nhận đổi quà: ${redemptionError.message}`);
      }

      // Return success response
      const newTotalPoints = currentPoints - gift.points_required;
      return new Response(
        JSON.stringify({
          success: true,
          message: `Đổi quà thành công! Bạn đã nhận "${gift.name}".`,
          gift_name: gift.name,
          points_spent: gift.points_required,
          remaining_points: newTotalPoints
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } catch (error) {
      console.error('Redemption transaction error:', error);
      
      // In a real-world scenario, you'd want to implement proper transaction rollback
      // For now, we'll return an error and let the user try again
      return new Response(
        JSON.stringify({ 
          error: error instanceof Error ? error.message : 'Có lỗi xảy ra khi đổi quà. Vui lòng thử lại.' 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('Unexpected error in redeem-gift function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Có lỗi không mong muốn xảy ra. Vui lòng thử lại sau.' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});