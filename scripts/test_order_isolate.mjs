// Isolate the order insert failure: plain insert vs insert with promo code.
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mwpmfyzoflwkofqhivze.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13cG1meXpvZmx3a29mcWhpdnplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NTEyOTgsImV4cCI6MjA3MDMyNzI5OH0.r4wmw8PHXab9qVlSV3VPPV28NvN7bdJ3NCzofGbWLg8'
);

async function tryInsert(label, promo) {
  const payload = {
    full_name: 'Diag ' + label,
    phone: '+85512345678',
    email: 'diag@test.com',
    address: 'Test St 1',
    city: 'Phnom Penh',
    ward: '1',
    notes: 'diag',
    total_amount: 100000,
    promo_code_applied: promo,
    user_id: null,
  };
  const { data, error } = await supabase.from('orders').insert(payload).select().single();
  if (error) {
    console.log(label, '-> ERROR:', error.code, '-', error.message);
  } else {
    console.log(label, '-> OK:', data.id);
    await supabase.from('orders').delete().eq('id', data.id);
    console.log(label, '-> cleanup done');
  }
}

await tryInsert('NO-PROMO', null);
await tryInsert('WITH-PROMO', 'giadinhdaudau88');