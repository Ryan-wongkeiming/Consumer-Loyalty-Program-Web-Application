import { supabase } from './supabaseClient';

/**
 * Zalo integration helpers.
 *
 * Gated by VITE_ENABLE_ZALO. When the flag is off, all functions become
 * no-ops so the app keeps working before Zalo accounts are provisioned.
 */

// Whether Zalo is enabled for this build
export const ZALO_ENABLED = import.meta.env.VITE_ENABLE_ZALO === 'true';

// Zalo OAuth App credentials (from developers.zalo.me)
// These are public client-side values (not secrets). The client secret
// is only ever used server-side in the edge function.
const ZALO_APP_ID = import.meta.env.VITE_ZALO_APP_ID || '';
const ZALO_REDIRECT_URI = `${window.location.origin}/auth/callback/zalo`;

export interface ZaloUser {
  id: string;
  name: string;
  picture?: string;
  phone?: string;
}

/**
 * Build the Zalo OAuth authorization URL for the "Log in with Zalo" flow.
 * Uses Zalo's OAuth 2.0 (implicit grant via Zalo web login).
 */
export function buildZaloAuthUrl(): string {
  const params = new URLSearchParams({
    app_id: ZALO_APP_ID,
    redirect_uri: ZALO_REDIRECT_URI,
    state: 'carehub_login',
  });
  return `https://oauth.zalo.me/v3/auth?${params.toString()}`;
}

/**
 * Redirect the browser to Zalo login. The user authorizes, then Zalo
 * redirects back to `/auth/callback/zalo?code=...&state=...`.
 */
export function startZaloLogin(): void {
  if (!ZALO_ENABLED) {
    console.warn('Zalo login is disabled (VITE_ENABLE_ZALO is not true).');
    return;
  }
  window.location.href = buildZaloAuthUrl();
}

/**
 * Handle the Zalo OAuth callback. The `/auth/callback/zalo` route
 * captures the `code`, exchanges it for an access token + user info
 * via the edge function, then signs the user into Supabase.
 */
export async function handleZaloCallback(code: string): Promise<{ user: ZaloUser }> {
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zalo-auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Đăng nhập bằng Zalo thất bại.');
  }

  return result as { user: ZaloUser };
}

/**
 * Link the authenticated Supabase user's profile to their Zalo identity.
 * Returns true on success, false if Zalo is disabled or no user.
 */
export async function linkZaloProfile(zaloId: string, phone?: string, avatar?: string): Promise<boolean> {
  if (!ZALO_ENABLED) return false;
  const { error } = await supabase.rpc('link_zalo_account', {
    p_zalo_id: zaloId,
    p_zalo_phone: phone || null,
    p_zalo_avatar_url: avatar || null,
  });
  return !error;
}

/**
 * Send a ZNS notification for a given order/template via the edge function.
 * Safe to call when Zalo is disabled — it becomes a no-op.
 */
export async function sendZnsNotification(params: {
  orderId: string;
  templateType: 'order_confirmed' | 'order_shipped' | 'order_delivered' | 'payment_received';
  phone?: string;
  [key: string]: string | undefined;
}): Promise<{ ok: boolean; error?: string }> {
  if (!ZALO_ENABLED) return { ok: true }; // no-op when disabled

  const session = await supabase.auth.getSession();
  const accessToken = session.data.session?.access_token;

  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-zns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken || ''}`,
      },
      body: JSON.stringify(params),
    });
    const result = await response.json();
    if (!response.ok) {
      return { ok: false, error: result.error };
    }
    return { ok: true };
  } catch (e) {
    console.error('sendZnsNotification error:', e);
    return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
