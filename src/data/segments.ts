/**
 * First-party segmentation helpers for CareHub.
 * 
 * Segments are computed from stored user data: health goal, brand preference,
 * baby age band, subscriber vs one-time buyer. Used for ONE banner and ONE
 * targeted promo code — never a third-party ad network.
 */

import { supabase } from './supabaseClient';

// ---------- Segment types ----------
export type Segment = 'new-baby' | 'formula-transition' | 'immune-support' | 'skin-care' | 'subscriber-streak' | 'lapsed-buyer';

export interface SegmentData {
  segment: Segment;
  label: string;
  description: string;
  recommendedProducts?: string[];
  suggestedPromoCode?: string;
  message: string;
}

// ---------- Compute user segment ----------
export const getUserSegment = async (userId: string): Promise<SegmentData | null> => {
  try {
    // Fetch user profile + orders + baby profile in parallel
    const [{ data: profile }, { data: orders }, { data: babyProfile }] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('id', userId).single(),
      supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      supabase.from('user_baby_profiles').select('*').eq('user_id', userId).maybeSingle(),
    ]);

    if (!profile || !orders || orders.length === 0) return null;

    const deliveredOrders = orders.filter((o) => o.status === 'delivered');
    const subscriptionOrders = orders.filter((o) => o.subscription_id !== null);
    const totalDelivered = deliveredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

    // Determine segment based on available data
    if (babyProfile && babyProfile.baby_birth_date) {
      const birthDate = new Date(babyProfile.baby_birth_date);
      const ageMonths = Math.floor((Date.now() - birthDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000));

      if (ageMonths < 3) {
        return {
          segment: 'new-baby',
          label: 'Chào bé yêu!',
          description: 'Giai đoạn sơ sinh — nhu cầu dinh dưỡng đặc biệt',
          message: 'Sản phẩm phù hợp cho bé dưới 3 tháng tuổi',
          suggestedPromoCode: 'NEWBABY10',
        };
      } else if (ageMonths < 6) {
        return {
          segment: 'formula-transition',
          label: 'Chuyển giai đoạn sữa',
          description: 'Bé cần chuyển từ stage 1 sang stage 2',
          message: 'Công thức phù hợp cho bé 3-6 tháng tuổi',
          recommendedProducts: ['stage2-formula'],
        };
      }
    }

    // Check purchase patterns
    const hasSubscription = subscriptionOrders.length > 0;
    const daysSinceLastOrder = deliveredOrders.length > 0
      ? Math.floor((Date.now() - new Date(deliveredOrders[0].created_at).getTime()) / (24 * 60 * 60 * 1000))
      : 999;

    if (hasSubscription && daysSinceLastOrder < 30) {
      return {
        segment: 'subscriber-streak',
        label: 'Cảm ơn bạn đã đăng ký!',
        description: 'Khách hàng đăng ký tích cực — ưu đãi đặc biệt',
        message: 'Giữ subscription để nhận thêm ưu đãi',
        suggestedPromoCode: 'SUBSCRIBER5',
      };
    }

    if (daysSinceLastOrder > 60 && totalDelivered > 1000000) {
      return {
        segment: 'lapsed-buyer',
        label: 'Chúng tôi nhớ bạn!',
        description: 'Khách hàng cũ chưa quay lại trong 60 ngày',
        message: 'Quay lại mua sắm với mã giảm giá đặc biệt',
        suggestedPromoCode: 'WELCOME-BACK15',
      };
    }

    return null;
  } catch (error) {
    console.error('Error computing user segment:', error);
    return null;
  }
};

// ---------- Segment banner component ----------
export const getSegmentBanner = (segment: SegmentData | null): React.ReactNode => {
  if (!segment) return null;

  return {
    title: segment.label,
    message: segment.message,
    promoCode: segment.suggestedPromoCode,
    ctaText: 'Xem ngay',
  };
};

// ---------- Consent tracking ----------
export interface ConsentRecord {
  version: string;
  timestamp: string;
  consent_type: 'marketing' | 'baby_data' | 'profile_data';
  user_id: string;
  ip_address?: string;
  user_agent?: string;
}

export const recordConsent = async (
  userId: string,
  consentType: ConsentRecord['consent_type'],
  ipAddress?: string,
  userAgent?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('privacy_consents')
      .insert({
        user_id: userId,
        consent_type: consentType,
        version: '1.0',
        timestamp: new Date().toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent,
      });

    return !error;
  } catch (error) {
    console.error('Error recording consent:', error);
    return false;
  }
};

export const checkConsent = async (
  userId: string,
  consentType: ConsentRecord['consent_type']
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('privacy_consents')
      .select('id')
      .eq('user_id', userId)
      .eq('consent_type', consentType)
      .eq('version', '1.0')
      .maybeSingle();

    if (error) return false;
    return !!data;
  } catch {
    return false;
  }
};
