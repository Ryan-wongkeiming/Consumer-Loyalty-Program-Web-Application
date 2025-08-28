import { supabase } from './supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  avatar_url: string | null;
  preferences: Record<string, any>;
  marketing_consent: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
}

// Sign up with email and password (no email confirmation required)
const signUp = async (email: string, password: string, fullName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
};

// Sign in with email and password
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

// Sign out
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
};

// Get current user
const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  
  return user;
};

// Get user profile
export const getUserProfile = async (userId?: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_profile', { user_uuid: userId || undefined });

    if (error) {
      console.error('Error getting user profile:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', (await getCurrentUser())?.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Get user's order history
const getUserOrders = async () => {
  try {
    const { data, error } = await supabase.rpc('get_user_orders');

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error getting user orders:', error);
    return [];
  }
};

// Add item to wishlist
const addToWishlist = async (productId: string) => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated to add items to wishlist');
  }

  const { data, error } = await supabase
    .from('wishlist')
    .insert({
      user_id: user.id,
      product_id: productId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Remove item from wishlist
export const removeFromWishlist = async (productId: string) => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated to remove items from wishlist');
  }

  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId);

  if (error) {
    throw error;
  }
};

// Get user's wishlist
export const getUserWishlist = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('wishlist')
    .select(`
      id,
      product_id,
      created_at,
      products (
        id,
        name,
        description,
        price,
        original_price,
        image,
        category,
        rating,
        reviews,
        in_stock
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting user wishlist:', error);
    return [];
  }

  return data || [];
};

// Save user address
export const saveUserAddress = async (address: {
  label: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  ward: string;
  is_default?: boolean;
}) => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated to save addresses');
  }

  // If this is set as default, unset other default addresses
  if (address.is_default) {
    await supabase
      .from('user_addresses')
      .update({ is_default: false })
      .eq('user_id', user.id);
  }

  const { data, error } = await supabase
    .from('user_addresses')
    .insert({
      user_id: user.id,
      ...address,
    })
    .select()
    .single();
}

// Get user addresses
export const getUserAddresses = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('user_addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting user addresses:', error);
    return [];
  }

  return data || [];
};

// Reset password
const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    throw error;
  }
};

// Update password
export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw error;
  }
};

// Get user messages
export const getUserMessages = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      products (
        id,
        name,
        image
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting user messages:', error);
    return [];
  }

  return data || [];
};

// Delete user message
export const deleteUserMessage = async (messageId: string) => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated to delete messages');
  }

  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId)
    .eq('user_id', user.id);

  if (error) {
    throw error;
  }
};

// Get user loyalty points
export const getUserLoyaltyPoints = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return { total_points: 0, last_updated_at: null };
  }

  const { data, error } = await supabase
    .from('user_loyalty_points')
    .select('total_points, last_updated_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error getting user loyalty points:', error);
    return { total_points: 0, last_updated_at: null };
  }

  return data || { total_points: 0, last_updated_at: null };
};

// Redeem loyalty code
export const redeemLoyaltyCode = async (code: string) => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated to redeem codes');
  }

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/redeem-loyalty-code`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.message || 'Có lỗi xảy ra khi đổi mã');
  }

  return result;
};

// Get loyalty gifts
export const getLoyaltyGifts = async () => {
  try {
    const { data, error } = await supabase
      .from('loyalty_gifts')
      .select('*')
      .eq('is_active', true)
      .order('points_required', { ascending: true });

    if (error) {
      console.error('Error fetching loyalty gifts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting loyalty gifts:', error);
    return [];
  }
};

// Redeem loyalty gift
export const redeemLoyaltyGift = async (giftId: string, shippingDetails?: {
  full_name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  ward: string;
  notes?: string;
}) => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated to redeem gifts');
  }

  const requestBody: any = { gift_id: giftId };
  if (shippingDetails) {
    requestBody.shipping_details = shippingDetails;
  }

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/redeem-gift`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Có lỗi xảy ra khi đổi quà');
  }

  return result;
};

// Get user's redemption history
export const getUserRedemptions = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('loyalty_redemptions')
      .select(`
        *,
        loyalty_gifts (
          name,
          description,
          image_url
        )
      `)
      .eq('user_id', user.id)
      .order('redeemed_at', { ascending: false });

    if (error) {
      console.error('Error fetching user redemptions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting user redemptions:', error);
    return [];
  }
};