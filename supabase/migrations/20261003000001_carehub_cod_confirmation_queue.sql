-- ============================================================
-- CareHub: COD Confirmation Queue (Stage A)
-- 2026-10-03
-- ============================================================
-- Builds a staff task list for confirming COD deliveries.
-- When a subscription's next_delivery_date arrives, it becomes
-- an "awaiting confirmation" task. Staff marks it confirmed
-- before shipping.
--
-- Also creates a helper function to send a notification email
-- template (can be wired to SendGrid, Mailgun, or Zalo OA later).
-- ============================================================

-- ---------- COD confirmation tasks table ----------
CREATE TABLE IF NOT EXISTS cod_confirmation_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    user_id UUID REFERENCES auth.users(id),
    customer_phone TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    next_delivery_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'shipped')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ
);

-- RLS for cod_confirmation_tasks
ALTER TABLE cod_confirmation_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read cod tasks" ON cod_confirmation_tasks
FOR SELECT USING (true);

CREATE POLICY "Allow service write cod tasks" ON cod_confirmation_tasks
FOR ALL WITH CHECK (true);

-- Index for efficient querying of due tasks
CREATE INDEX IF NOT EXISTS idx_cod_tasks_due_date
ON cod_confirmation_tasks (next_delivery_date)
WHERE status = 'pending';

-- ---------- Helper: create tasks for due subscriptions ----------
DROP FUNCTION IF EXISTS public.create_cod_confirmation_tasks_for_due_subscriptions();

CREATE OR REPLACE FUNCTION public.create_cod_confirmation_tasks_for_due_subscriptions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_created_count INTEGER := 0;
    v_sub RECORD;
    v_order_id UUID;
BEGIN
    -- Find active subscriptions due within the next 7 days
    FOR v_sub IN
        SELECT s.id, s.user_id, s.next_delivery_date, s.frequency_weeks,
               o.id as order_id, o.full_name, o.phone
        FROM subscriptions s
        JOIN orders o ON o.subscription_id = s.id
        WHERE s.status = 'active'
          AND s.next_delivery_date <= CURRENT_DATE + INTERVAL '7 days'
          AND s.next_delivery_date >= CURRENT_DATE
          AND NOT EXISTS (
              SELECT 1 FROM cod_confirmation_tasks t
              WHERE t.order_id = o.id AND t.status = 'pending'
          )
    LOOP
        INSERT INTO cod_confirmation_tasks (order_id, user_id, customer_phone, customer_name, next_delivery_date, status)
        VALUES (v_sub.order_id, v_sub.user_id, v_sub.phone, v_sub.full_name, v_sub.next_delivery_date, 'pending');

        v_created_count := v_created_count + 1;
    END LOOP;

    RETURN v_created_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_cod_confirmation_tasks_for_due_subscriptions() TO anon, authenticated;

-- ---------- Notification template function ----------
-- This can be wired to any email/SMS provider later.
-- For now it returns the template text that would be sent.
DROP FUNCTION IF EXISTS public.generate_cod_confirmation_message(customer_name TEXT, delivery_date DATE, phone TEXT);

CREATE OR REPLACE FUNCTION public.generate_cod_confirmation_message(
    customer_name TEXT,
    delivery_date DATE,
    phone TEXT
) RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN format(
        'Xin chào %s,\n\nĐơn hàng của bạn sẽ được giao vào ngày %s.\n' ||
        'Vui lòng phản hồi "XÁC NHẬN" để chúng tôi giao hàng.\n\n' ||
        'Cảm ơn bạn đã mua sắm tại CareHub!',
        customer_name,
        TO_CHAR(delivery_date, 'DD/MM/YYYY'),
        phone
    );
END;
$$;
