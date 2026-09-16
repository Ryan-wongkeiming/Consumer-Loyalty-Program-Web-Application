const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Maximum payload size for the image (bytes). 5 MB keeps the request reasonable
// for a mobile camera capture while still allowing a sharp 1280x720 frame.
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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

    // Reject non-image MIME types
    if (!mimeType.startsWith('image/')) {
      return new Response(
        JSON.stringify({ error: 'Loại hình không hợp lệ' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

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
          error: 'OCR belum được cấu. Vui lòng thử lại sau.',
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Call the configured OpenAI-compatible vision endpoint
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
        error: 'Có lỗi không mong muốn xảyra. Vui lòng thử lại sau.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});