# CareHub — Admin & Operations Guide

For the operations team managing orders, promotions, samples, and subscriptions day-to-day.

---

## Accessing the Staff Dashboard

The staff dashboard is a protected route in the app that requires staff role permissions.

### How to access

1. Log in with an account that has been assigned the staff role in Supabase.
2. Navigate to the staff dashboard route.
3. You will see tabs/sections for:
   - New Orders
   - Free Sample Requests
   - Gift Redemptions
   - Due Subscriptions

---

## Order Management

### Viewing new orders

New orders appear in the "Orders" section of the staff dashboard. Each order shows:

| Field | Description |
|---|---|
| Order ID | Unique identifier |
| Customer name | Full name from checkout form |
| Phone | Contact number |
| Email | If provided |
| Address | Delivery address (city + ward) |
| Items | Product names, quantities, prices |
| Total amount | Final order total |
| Promo code | If applied |
| Status | pending / completed / shipped / cancelled |
| Created at | Timestamp |

### Order workflow

1. **Pending** — Order received, awaiting confirmation
2. **Confirmed** — Team contacted customer, confirmed delivery details
3. **Shipped** — Package dispatched
4. **Delivered** — Customer received order
5. **Cancelled** — Order cancelled

**Important:** When an order is marked as "delivered," loyalty points are automatically credited based on spend (1 point per 10,000 VND). This happens server-side via a database function.

### COD confirmation process

CareHub operates on a confirm-before-ship model:

1. Customer places a COD order
2. Staff receives notification in dashboard
3. Staff contacts customer (phone call, Zalo, SMS, or email) to confirm
4. Once confirmed, mark order status as "confirmed" and dispatch
5. After delivery, mark as "delivered" to trigger loyalty points

---

## Promo Code Management

### Creating promo codes

Promo codes are managed directly in the Supabase `promo_codes` table. To add a new code:

```sql
INSERT INTO promo_codes (code, discount, description, is_active, type, max_uses, current_uses, discount_type, expires_at, applicable_brands)
VALUES ('NEWCODE', 50000, 'Description here', true, 'multi-use', NULL, 0, 'fixed', NULL, NULL);
```

### Promo code fields

| Field | Description |
|---|---|
| `code` | The promo code string (stored uppercase, compared case-insensitively) |
| `discount` | Discount value: VND amount for fixed, percentage for percent-type |
| `description` | Human-readable description |
| `is_active` | Whether the code can be used |
| `type` | `unique` (one-time use) or `multi-use` |
| `max_uses` | Maximum uses for multi-use codes (NULL = unlimited) |
| `current_uses` | Number of times used (auto-incremented by trigger) |
| `discount_type` | `fixed` (VND) or `percent` (%) |
| `expires_at` | Expiry date/time (NULL = never expires) |
| `min_order_amount` | Minimum order subtotal required (VND) |
| `applicable_brands` | Array of brand names this code applies to (NULL = all brands) |

### Common promo scenarios

**Fixed discount (e.g., 50,000 VND off):**
```sql
INSERT INTO promo_codes (code, discount, description, is_active, type, max_uses, current_uses, discount_type)
VALUES ('INFLUENCER50K', 50000, 'Influencer campaign - 50k off', true, 'multi-use', NULL, 0, 'fixed');
```

**Percent discount (e.g., 10% off any order):**
```sql
INSERT INTO promo_codes (code, discount, description, is_active, type, max_uses, current_uses, discount_type)
VALUES ('SAVE10', 10, 'Save 10% on any order', true, 'multi-use', NULL, 0, 'percent');
```

**One-time use code:**
```sql
INSERT INTO promo_codes (code, discount, description, is_active, type, max_uses, current_uses, discount_type)
VALUES ('WELCOME100', 100000, 'Welcome gift - 100k off', true, 'unique', 1, 0, 'fixed');
```

**Brand-specific code:**
```sql
INSERT INTO promo_codes (code, discount, description, is_active, type, max_uses, current_uses, discount_type, min_order_amount, applicable_brands)
VALUES ('BLACKMORES15', 15, '15% off Blackmores products', true, 'multi-use', NULL, 0, 'percent', 500000, ARRAY['Blackmores']);
```

### Checking usage

```sql
SELECT code, current_uses, max_uses, is_active, expires_at
FROM promo_codes
ORDER BY created_at DESC;
```

---

## Free Sample Requests

### Viewing requests

Free sample requests appear in the dashboard under "Sample Requests". Each request shows:

| Field | Description |
|---|---|
| Full name | Requester's name |
| Phone | Contact number |
| Email | If provided |
| Baby name | If provided |
| Baby birth date | If provided |
| Sample type | Which free sample requested |
| Address | Delivery address |
| Submitted at | Timestamp |

### Managing stock

Free sample stock is managed in the `free_samples` table:

```sql
-- Check current stock
SELECT id, name, stock, is_active FROM free_samples;

-- Restock
UPDATE free_samples SET stock = 200 WHERE id = 'blackmores-pregnancy-gold';
```

Stock decrements atomically when a request is submitted — two concurrent requests cannot both succeed when only one item remains.

---

## Gift Redemption

### Viewing redemptions

Gift redemptions appear in the dashboard under "Redemptions". Each redemption shows:

| Field | Description |
|---|---|
| User | Who redeemed |
| Gift name | Which gift was redeemed |
| Points spent | Loyalty points deducted |
| Shipping details | Name, phone, address |
| Status | completed / pending / shipped |
| Redeemed at | Timestamp |

### Fulfillment workflow

1. Redemption appears in dashboard
2. Prepare the gift item
3. Ship to the address provided
4. Update status to "shipped" then "completed"

---

## Subscription Management

### Viewing subscriptions

Subscriptions appear in the dashboard under "Due Subscriptions" when their `next_delivery_date` is within N days. Each subscription shows:

| Field | Description |
|---|---|
| User | Subscriber |
| Products | Items in the subscription |
| Frequency | Delivery interval (4 / 8 / 12 weeks) |
| Next delivery date | When the next order is due |
| Status | active / paused / cancelled |
| Last confirmed | When last order was confirmed |

### Subscription actions

Customers manage their own subscriptions through their account page:
- **Pause** — Temporarily stop deliveries
- **Skip** — Skip one cycle, resume after
- **Change frequency** — Adjust delivery interval

Staff can also modify subscriptions if needed.

### Manual order creation

When a customer calls to place or modify a subscription order, staff can create the order manually through the staff dashboard. The order will link to the existing subscription and update the `last_order_id` field.

---

## Catalog Management

### Adding products

Products are stored in the `products` table. Key fields:

| Field | Description |
|---|---|
| id | Unique product identifier |
| name | Product name |
| price | Selling price (VND) |
| original_price | Compare-at price (if on sale) |
| image | Image URL (Supabase Storage path) |
| brand | Brand name |
| category | Product category |
| in_stock | Boolean availability |
| is_subscription | Whether subscribe-and-save is available |
| bundle_pricing | JSON array of quantity-based discounts |

### Updating stock

```sql
UPDATE products SET in_stock = false WHERE id = 'product-id-here';
```

### Replacing broken images

Product images should be hosted in Supabase Storage (`product-images` bucket), not hotlinked from external CDNs. To upload:

1. Go to Supabase → Storage → `product-images` bucket
2. Upload the image file
3. Note the public URL
4. Update the product row:
   ```sql
   UPDATE products SET image = 'https://your-supabase.supabase.co/storage/v1/object/public/product-images/filename.jpg' WHERE id = 'product-id-here';
   ```

---

## Loyalty Points Management

### Point balance

```sql
SELECT user_id, total_points, last_updated_at
FROM user_loyalty_points
WHERE user_id = 'user-uuid-here';
```

### Manually adjusting points

If needed, you can adjust points directly:

```sql
UPDATE user_loyalty_points SET total_points = total_points + 100 WHERE user_id = 'user-uuid-here';
```

Points auto-increment when:
- Pack codes are scanned (points defined in `loyalty_codes` table)
- Orders are marked as delivered (1 point per 10,000 VND)
- Referral rewards are triggered

Points auto-decrement when:
- Loyalty gifts are redeemed

---

## Data Export

To export orders for reporting:

```sql
SELECT o.id, o.full_name, o.phone, o.address, o.city, o.total_amount,
       o.promo_code_applied, o.status, o.created_at,
       STRING_AGG(oi.product_name || ' x' || oi.quantity, ', ') as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.created_at > NOW() - INTERVAL '30 days'
GROUP BY o.id
ORDER BY o.created_at DESC;
```

---

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| Orders not appearing in dashboard | Staff role not assigned | Assign role in Supabase Auth users |
| Promo code not applying | Case mismatch or expired | Check code is uppercase and not past expiry |
| Stock not decrementing | Rate limit exceeded | Wait for hourly window to reset |
| Subscription not creating | Customer not logged in | Customer must be authenticated to subscribe |
| Images not loading | Bucket policy wrong | Run `carehub_own_images.sql` migration |
