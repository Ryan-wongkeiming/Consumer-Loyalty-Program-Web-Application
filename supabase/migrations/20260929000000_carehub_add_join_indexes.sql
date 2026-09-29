-- ============================================================
-- CareHub: add indexes on foreign-key / join columns
-- 2026-09-29
-- ============================================================
-- PostgREST was killing slow join queries ("Thread killed by timeout
-- manager"). The join columns below had no index, so Postgres had to
-- scan the whole child table for each parent row. Adding indexes makes
-- these joins fast and prevents timeouts as order data grows.
-- ============================================================

-- order_items: joined from orders (MyOrdersPage) and products
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- promo_code_usages: joined from orders and promo_codes
CREATE INDEX IF NOT EXISTS idx_promo_code_usages_order_id ON public.promo_code_usages(order_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_usages_promo_code ON public.promo_code_usages(promo_code);

-- subscription_items: joined from subscriptions and products
CREATE INDEX IF NOT EXISTS idx_subscription_items_subscription_id ON public.subscription_items(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_items_product_id ON public.subscription_items(product_id);

-- messages: joined from products (MessageList / getUserMessages)
CREATE INDEX IF NOT EXISTS idx_messages_product_id ON public.messages(product_id);
