// Full checkout simulation: order + order_items + promo (exactly like the app).
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mwpmfyzoflwkofqhivze.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13cG1meXpvZmx3a29mcWhpdnplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NTEyOTgsImV4cCI6MjA3MDMyNzI5OH0.r4wmw8PHXab9qVlSV3VPPV28NvN7bdJ3NCzofGbWLg8'
);

const run = async (label, promo) => {
  const order = {
    full_name: 'Checkout Sim ' + label,
    phone: '+85512345678',
    email: 'sim' + label + '@test.com',
    address: 'Test St 1',
    city: 'Phnom Penh',
    ward: '1',
    notes: 'checkout sim ' + label,
    total_amount: 500000,
    promo_code_applied: promo,
    user_id: null,
  };

  // 1) insert order (like CheckoutPage line 211)
  const { data: od, error: oe } = await supabase.from('orders').insert(order).select().single();
  if (oe) { console.log(label, 'ORDER FAIL:', oe.code, oe.message); return; }
  console.log(label, 'ORDER OK:', od.id);

  // 2) insert order_items (like CheckoutPage line 257)
  const items = [
    { order_id: od.id, product_id: 'test-prod-1', product_name: 'Sim Product', quantity: 1, price_at_purchase: 500000 },
  ];
  const { error: ie } = await supabase.from('order_items').insert(items);
  if (ie) { console.log(label, 'ITEMS FAIL:', ie.code, ie.message); } else { console.log(label, 'ITEMS OK'); }

  // 3) check promo state (was the trigger fired? did current_uses increment?)
  if (promo) {
    const { data: pc } = await supabase.from('promo_codes').select('code, current_uses, is_active').eq('code', promo).single();
    console.log(label, 'PROMO AFTER:', JSON.stringify(pc));
  }

  // cleanup: delete the test order (cascade removes order_items)
  const { error: de } = await supabase.from('orders').delete().eq('id', od.id);
  console.log(label, 'CLEANUP:', de ? 'FAIL ' + de.message : 'OK');
};

await run('A', null);                    // plain order, no promo
await run('B', 'giadinhdaudau88');       // order with the 50,000d promo