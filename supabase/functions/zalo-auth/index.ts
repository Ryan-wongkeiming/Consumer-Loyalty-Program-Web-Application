import { createClient } from 'npm:@supabase/supabase-js@2.54.0';

// Restrict CORS to the deployed site. The app is served from GitHub Pages.
const ALLOWED_ORIGIN = 'https://ryan-wongkeiming.github.io';
const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Zalo OAuth credentials — set these in Supabase Edge Function secrets.
const ZALO_APP_ID = Deno.env.get('ZALO_APP_ID') ?? '';
const ZALO_APP_SECRET = Deno.env.get('ZALO_APP_SECRET') ?? '';
const ZALO_REDIRECT_URI = Deno.env.get('ZALO_REDIRECT_URI') ?? '';

interface ZaloAuthRequest {
  code: string;
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

    const { code }: ZaloAuthRequest = await req.json();
    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!ZALO_APP_ID || !ZALO_APP_SECRET) {
      return new Response(
        JSON.stringify({ error: 'Zalo credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Exchange the authorization code for an access token
    const tokenRes = await fetch('https://oauth.zalo.me/v3/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        app_id: ZALO_APP_ID,
        app_secret: ZALO_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: ZALO_REDIRECT_URI,
      }),
    });

    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok || !tokenJson.access_token) {
      console.error('Zalo token exchange failed:', tokenJson);
      return new Response(
        JSON.stringify({ error: 'Không thể trao đổi mã với Zalo. Vui lòng thử lại.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = tokenJson.access_token;

    // 2. Fetch Zalo user profile
    const profileRes = await fetch('https://graph.zalo.me/v2.0/me', {
      headers: { 'access_token': accessToken },
    });
    const profileJson = await profileRes.json();

    const zaloId = profileJson.id;
    const name = profileJson.name || `Zalo User ${zaloId}`;
    const picture = profileJson.picture?.data?.url || profileJson.picture?.url;

    // 3. Upsert into Supabase auth + user_profiles keyed to the Zalo id.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Deterministic, non-colliding email for Zalo accounts.
    const email = `zalo_${zaloId}@carehub.local`;

    // Find existing user by email
    const { data: existingList } = await supabaseAdmin.auth.admin.listUsers({
      filter: email,
    });
    const found = existingList?.users?.[0];

    let userId: string;
    if (found) {
      userId = found.id;
    } else {
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: `zalo_${zaloId}_${crypto.randomUUID()}`,
        email_confirm: true,
        user_metadata: { full_name: name, avatar_url: picture, zalo_id: zaloId },
      });
      if (createErr) {
        console.error('Zalo createUser error:', createErr);
        return new Response(
          JSON.stringify({ error: 'Không thể tạo tài khoản.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      userId = created.user!.id;
    }

    // 4. Link Zalo identity on the profile
    await supabaseAdmin
      .from('user_profiles')
      .upsert(
        { id: userId, full_name: name, avatar_url: picture, zalo_id: zaloId },
        { onConflict: 'id' }
      );

    // 5. Mint a magic link, then hand the token back so the client can
    //    complete sign-in via supabase.auth.verifyOtp (no email required).
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    if (linkErr || !linkData?.properties?.hashed_token) {
      console.error('Zalo generateLink error:', linkErr);
      return new Response(
        JSON.stringify({ error: 'Không thể tạo phiên đăng nhập.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        user: { id: zaloId, name, picture, email },
        token_hash: linkData.properties.hashed_token,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in zalo-auth:', error);
    return new Response(
      JSON.stringify({ error: 'Có lỗi không mong muốn xảy ra. Vui lòng thử lại sau.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
