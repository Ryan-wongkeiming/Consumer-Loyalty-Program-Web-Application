// Restrict CORS to the configured origin + localhost in development.
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || 'https://ryan-wongkeiming.github.io';
const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Maximum payload size for the image (bytes). 5 MB keeps the request reasonable
// for a mobile camera capture while still allowing a sharp 1280x720 frame.
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Rate limit: max OCR calls per user per hour
const OCR_RATE_LIMIT_MAX = 20;
const OCR_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

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

    // ---- Auth check: require logged-in user ----
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.length < 50) {
      return new Response(
        JSON.stringify({ error: 'Yêu cầu đăng nhập để sử dụng tính năng này' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.slice(7);

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.54.0');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the token is valid by getting the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // ---- Rate limit check (per user, fail closed on error) ----
    const windowStart = new Date(Date.now() - OCR_RATE_LIMIT_WINDOW_MS).toISOString();
    const { count: recentCount, error: rateError } = await supabase
      .from('ocr_rate_limits')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', windowStart);

    if (rateError) {
      console.error('OCR rate limit check error:', rateError);
      return new Response(
        JSON.stringify({ error: 'Không thể kiểm tra giới hạn. Vui lòng thử lại sau.' }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if ((recentCount ?? 0) >= OCR_RATE_LIMIT_MAX) {
      return new Response(
        JSON.stringify({ error: 'Bạn đã quét quá nhiều mã. Vui lòng thử lại sau.' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const { image }: { image: string } = await req.json();
    if (!image || typeof image !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Hình không tồn tại' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate that the image is a base64 data URL
    const dataUrlMatch = image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s);
    if (!dataUrlMatch) {
      return new Response(
        JSON.stringify({ error: 'Hình không hợp lệ' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const mimeType = dataUrlMatch[1];
    const base64Data = dataUrlMatch[2];

    // Decode and enforce a size cap
    let imageBytes: Uint8Array;
    try {
      imageBytes = Deno.base64Decode(base64Data);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Hình không hợp lệ' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (imageBytes.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Hình trống' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (imageBytes.length > MAX_IMAGE_BYTES) {
      return new Response(
        JSON.stringify({ error: 'Hình quá lớn. Vui lòng thử lại.' }),
        {
          status: 413,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // OCR provider configuration
    const ocrApiUrl = Deno.env.get('OCR_API_URL');
    const ocrApiKey = Deno.env.get('OCR_API_KEY');

    if (!ocrApiUrl || !ocrApiKey) {
      return new Response(
        JSON.stringify({
          error: 'OCR chưa được cấu hình. Vui lòng thử lại sau.',
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Call the configured OpenAI-compatible vision endpoint
    // NOTE: Image is sent as-is (color, compressed) — no binarization.
    // The browser-side CameraCapture component handles compression.
    const ocrResponse = await fetch(ocrApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ocrApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract any promo/discount codes from this product label image. Return only the code(s) found, separated by spaces. If no code is visible, return an empty string.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
      }),
    });

    if (!ocrResponse.ok) {
      console.error('OCR provider error:', ocrResponse.status);
      return new Response(
        JSON.stringify({ error: 'Có lỗi xảy ra khi xử lý hình' }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const ocrResult = await ocrResponse.json();
    const text = ocrResult?.choices?.[0]?.message?.content?.trim() || '';

    // Record the rate limit entry AFTER successful processing
    await supabase
      .from('ocr_rate_limits')
      .insert({
        user_id: user.id,
        created_at: new Date().toISOString(),
      });

    return new Response(
      JSON.stringify({ text }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unexpected error in ocr-processor function:', error);
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
