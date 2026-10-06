import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { handleZaloCallback, linkZaloProfile, ZALO_ENABLED } from '../lib/zalo';
import { AlertCircle, Loader2 } from 'lucide-react';

/**
 * Handles the OAuth callback from Zalo.
 *
 * URL: /auth/callback/zalo?code=...&state=...
 *
 * Flow:
 *  1. Exchange the code for a token + user info (edge function).
 *  2. Verify the Supabase OTP token minted for the Zalo user.
 *  3. Link the Zalo identity to the profile.
 *  4. Redirect to home.
 */
const ZaloAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const code = searchParams.get('code');
    const tokenHash = searchParams.get('token_hash');

    const completeLogin = async () => {
      if (!ZALO_ENABLED) {
        setError('Đăng nhập Zalo chưa được bật.');
        setLoading(false);
        return;
      }

      if (!code) {
        setError('Không nhận được mã xác thực từ Zalo.');
        setLoading(false);
        return;
      }

      try {
        // 1. Exchange code for user info + token hash
        const { user, token_hash } = await handleZaloCallback(code);

        // 2. Verify the Supabase OTP (magic link token) to establish the session
        const otp = token_hash || tokenHash;
        if (otp) {
          const { error: otpError } = await supabase.auth.verifyOtp({
            type: 'magiclink',
            token_hash: otp,
          });
          if (otpError) {
            console.error('verifyOtp error:', otpError);
          }
        }

        // 3. Link Zalo identity to the current profile
        await linkZaloProfile(user.id);

        // 4. Redirect home
        setTimeout(() => navigate('/'), 800);
      } catch (e) {
        console.error('Zalo callback error:', e);
        setError(e instanceof Error ? e.message : 'Đăng nhập Zalo thất bại.');
        setLoading(false);
      }
    };

    completeLogin();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
        {loading && (
          <>
            <Loader2 className="w-12 h-12 text-carehub-teal animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Đang đăng nhập bằng Zalo...</h2>
            <p className="text-sm text-gray-600">Vui lòng chờ trong giây lát.</p>
          </>
        )}

        {error && (
          <>
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Đăng nhập thất bại</h2>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-carehub-teal text-white rounded-lg hover:bg-carehub-teal-dark"
            >
              Về trang chủ
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ZaloAuthCallbackPage;
