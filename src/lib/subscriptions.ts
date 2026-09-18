import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';

// ============================================================
// CareHub Subscription engine — lib layer
// Mirrors Blackmores Subscribe management, adapted to
// confirmed-repeat (COD) model. Every mutation keeps the
// subscription row + its items in sync.
// ============================================================

export interface SubscriptionItem {
  id: string;
  subscription_id: string;
  product_id: string;
  quantity: number;
  is_subscription: boolean;
  delivery_frequency: string | null;
  bundle_tier: { quantity: number; discountPercent: number; label: string } | null;
  products?: {
    id: string;
    name: string;
    image: string;
    price: number;
    category: string;
  } | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'paused' | 'cancelled';
  frequency_weeks: number;
  next_delivery_date: string | null;
  last_confirmed_at: string | null;
  last_order_id: string | null;
  created_at: string;
  updated_at: string;
  subscription_items: SubscriptionItem[];
}

const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user;
};

export const getMySubscriptions = async (): Promise<Subscription[]> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        subscription_items (
          *,
          products (id, name, image, price, category)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }
};

export const createSubscription = async (payload: {
  frequency_weeks: number;
  next_delivery_date: string;
  items: { product_id: string; quantity: number; delivery_frequency: string; bundle_tier?: unknown }[];
}): Promise<Subscription | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        frequency_weeks: payload.frequency_weeks,
        next_delivery_date: payload.next_delivery_date,
        status: 'active',
      })
      .select()
      .single();

    if (subError) {
      console.error('Error creating subscription:', subError);
      return null;
    }

    const items = payload.items.map(item => ({
      subscription_id: sub.id,
      product_id: item.product_id,
      quantity: item.quantity,
      is_subscription: true,
      delivery_frequency: item.delivery_frequency,
      bundle_tier: item.bundle_tier || null,
    }));

    const { error: itemsError } = await supabase
      .from('subscription_items')
      .insert(items);

    if (itemsError) {
      console.error('Error creating subscription items:', itemsError);
      return null;
    }

    return sub as Subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    return null;
  }
};

export const updateSubscriptionStatus = async (
  subscriptionId: string,
  status: 'active' | 'paused' | 'cancelled'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status })
      .eq('id', subscriptionId);
    return !error;
  } catch (error) {
    console.error('Error updating subscription status:', error);
    return false;
  }
};

export const skipNextDelivery = async (subscriptionId: string): Promise<boolean> => {
  try {
    const { data: sub, error: fetchError } = await supabase
      .from('subscriptions')
      .select('next_delivery_date, frequency_weeks')
      .eq('id', subscriptionId)
      .single();

    if (fetchError || !sub?.next_delivery_date) return false;

    // Skip one cycle: push next_delivery_date forward by frequency
    const next = new Date(sub.next_delivery_date);
    next.setDate(next.getDate() + sub.frequency_weeks * 7);

    const { error } = await supabase
      .from('subscriptions')
      .update({ next_delivery_date: next.toISOString().split('T')[0] })
      .eq('id', subscriptionId);
    return !error;
  } catch (error) {
    console.error('Error skipping delivery:', error);
    return false;
  }
};

export const changeSubscriptionFrequency = async (
  subscriptionId: string,
  frequency_weeks: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({ frequency_weeks })
      .eq('id', subscriptionId);
    return !error;
  } catch (error) {
    console.error('Error changing frequency:', error);
    return false;
  }
};