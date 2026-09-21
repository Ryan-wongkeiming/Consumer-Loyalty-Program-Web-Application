// Reproduce the checkout order insert with a promo code, exactly like the app.
// Uses the Supabase JS client with the anon key (same as the frontend).
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mwpmfyzoflwkofqhivze.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13cG1meXpvZmx3a29mcWhpdnplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NTEyOTgsImV4cCI6MjA3MDMyNzI5OH0.r4wmw8PHXab9qVlSV3VPPV28NvN7bdJ3NCzofGbWLg8'
);

const payload = {
  full_name: 'Test Trigger',
  phone: '+85512345678',
  email: 'test@test.com',
  address: 'Test St 1',
  city: 'Phnom Penh',
  ward: '1',
  notes: 'trigger test',
  total_amount: 500000,
  promo_code_applied: 'giadinhdaudau88',
  user_id: null,
};

const { data, error } = await supabase
  .from('orders')
  .insert(payload)
  .select()
  .single();

if (error) {
  console.log('ORDER ERROR:', JSON.stringify(error, null, 2));
} else {
  console.log('ORDER OK:', data.id);
  // Clean up the test order so we don't pollute the DB
  const { error: delErr } = await supabase
    .from('orders')
    .delete()
    .eq('id', data.id);
  console.log('cleanup:', delErr ? 'FAILED ' + delErr.message : 'OK (deleted test order)');
}