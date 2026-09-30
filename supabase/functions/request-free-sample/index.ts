import { createClient } from 'npm:@supabase/supabase-js@2.54.0';

// Restrict CORS to the deployed site. The app is served from GitHub Pages.
const ALLOWED_ORIGIN = 'https://ryan-wongkeiming.github.io';
const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Max free-sample requests per client per window (anti-abuse).
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

interface FreeSampleRequest {
  fullName: string;
  phone: string;
  email?: string;
  babyName?: string;
  babyBirthDate?: string;
  address: string;
  city: string;
  ward: string;
  notes?: string;
  sampleTypeId: string;
}

// Derive a stable client key from the request. Prefer the real client IP
// (x-forwarded-for) so anonymous visitors are throttled individually.
function getClientKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const cfConnecting = req.headers.get('cf-connecting-ip');
  if (cfConnecting) {
    return cfConnecting.trim();
  }
  return 'unknown';
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

    // Initialize Supabase client with service role for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // ---- Rate limit check (anti-abuse) ----
    const clientKey = getClientKey(req);
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

    const { count: recentCount, error: rateError } = await supabase
      .from('free_sample_rate_limits')
      .select('id', { count: 'exact', head: true })
      .eq('client_key', clientKey)
      .gte('window_start', windowStart);

    if (rateError) {
      console.error('Rate limit check error:', rateError);
    } else if ((recentCount ?? 0) >= RATE_LIMIT_MAX) {
      return new Response(
        JSON.stringify({ error: 'Bạn đã đăng ký quá nhiều lần. Vui lòng thử lại sau.' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const requestData: FreeSampleRequest = await req.json();

    // Validate required fields
    if (!requestData.fullName || !requestData.phone || !requestData.address || 
        !requestData.city || !requestData.ward || !requestData.sampleTypeId) {
      return new Response(
        JSON.stringify({ error: 'Thiếu thông tin bắt buộc' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if sample type exists and has stock
    const { data: sampleType, error: sampleError } = await supabase
      .from('free_samples')
      .select('*')
      .eq('id', requestData.sampleTypeId)
      .eq('is_active', true)
      .single();

    if (sampleError || !sampleType) {
      return new Response(
        JSON.stringify({ error: 'Loại mẫu không tồn tại hoặc không còn khả dụng' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (sampleType.stock <= 0) {
      return new Response(
        JSON.stringify({ 
          error: `Rất tiếc, ${sampleType.name} đã hết hàng. Vui lòng chọn loại mẫu khác.`,
          outOfStock: true 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Decrement stock count atomically. The WHERE clause (stock = current value)
    // means two concurrent requests cannot both succeed when only one item is
    // left: the second update matches zero rows and returns PGRST116.
    const { data: updatedStock, error: updateError } = await supabase
      .from('free_samples')
      .update({ 
        stock: sampleType.stock - 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestData.sampleTypeId)
      .eq('stock', sampleType.stock)
      .select()
      .single();

    if (updateError || !updatedStock) {
      console.error('Error updating stock:', updateError);
      return new Response(
        JSON.stringify({
          error: `Rất tiếc, ${sampleType.name} đã hết hàng. Vui lòng chọn loại mẫu khác.`,
          outOfStock: true
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create the free sample request
    const { data: request, error: insertError } = await supabase
      .from('free_sample_requests')
      .insert({
        full_name: requestData.fullName,
        phone: requestData.phone,
        email: requestData.email || null,
        baby_name: requestData.babyName || null,
        baby_birth_date: requestData.babyBirthDate || null,
        address: requestData.address,
        city: requestData.city,
        ward: requestData.ward,
        notes: requestData.notes || null,
        sample_type_id: requestData.sampleTypeId,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating free sample request:', insertError);
      // Compensating rollback: restore the stock we just decremented.
      await supabase
        .from('free_samples')
        .update({
          stock: sampleType.stock,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestData.sampleTypeId);
      return new Response(
        JSON.stringify({ error: 'Có lỗi xảy ra khi tạo yêu cầu. Vui lòng thử lại.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Record the request for rate limiting.
    await supabase
      .from('free_sample_rate_limits')
      .insert({
        client_key: clientKey,
        request_count: 1,
        window_start: new Date().toISOString(),
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Đăng ký dùng thử thành công!',
        request_id: request.id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Unexpected error in request-free-sample function:', error);
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
