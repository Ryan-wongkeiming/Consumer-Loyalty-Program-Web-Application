import { createClient } from 'npm:@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

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
      return new Response(
        JSON.stringify({ error: 'Có lỗi xảy ra khi tạo yêu cầu. Vui lòng thử lại.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Decrease stock count
    const { error: updateError } = await supabase
      .from('free_samples')
      .update({ 
        stock: sampleType.stock - 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestData.sampleTypeId);

    if (updateError) {
      console.error('Error updating stock:', updateError);
      // Note: In a production environment, you'd want to implement proper transaction handling
      // For now, we'll log the error but still return success since the request was created
    }

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