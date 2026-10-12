-- المرحلة 1: الجداول الأساسية + RLS + دالة إنشاء الطلب.
-- يُطبَّق من Supabase Dashboard ← SQL Editor (لصق وتنفيذ).

-- ============ أدوات مساعدة ============

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============ الأقسام ============

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  cover_image text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'coming_soon')),
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_categories_updated ON public.categories;
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ المنتجات ============

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  -- السعر المرجعي للعرض (أقل سعر متاح) — السعر الحقيقي للبيع على مستوى المتغيرات.
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  images text[] NOT NULL DEFAULT '{}',
  stock_status text NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock')),
  allow_cod boolean NOT NULL DEFAULT true,
  is_new boolean NOT NULL DEFAULT false,
  new_until date,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(is_published);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
DROP TRIGGER IF EXISTS trg_products_updated ON public.products;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ متغيرات المنتج (المقاسات) ============

CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  title text NOT NULL,
  dimensions text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  compare_at_price numeric(10,2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  is_available boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, title)
);
CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);
DROP TRIGGER IF EXISTS trg_variants_updated ON public.product_variants;
CREATE TRIGGER trg_variants_updated BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ الطلبات ============

CREATE SEQUENCE IF NOT EXISTS public.order_seq START 1042;
CREATE OR REPLACE FUNCTION public.next_order_number()
RETURNS text LANGUAGE sql AS $$ SELECT 'T-' || nextval('public.order_seq') $$;

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL DEFAULT public.next_order_number(),
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','confirmed','paid','shipped','delivered','cancelled')),
  payment_method text NOT NULL CHECK (payment_method IN ('cod','prepaid')),
  payment_status text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid')),
  subtotal numeric(10,2) NOT NULL CHECK (subtotal >= 0),
  shipping_fee numeric(10,2) NOT NULL CHECK (shipping_fee >= 0),
  total numeric(10,2) NOT NULL CHECK (total >= 0),
  -- لقطة بيانات العميل وقت الطلب
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_phone2 text NOT NULL DEFAULT '',
  governorate text NOT NULL,
  address text NOT NULL,
  notes text NOT NULL DEFAULT '',
  internal_notes text NOT NULL DEFAULT '',
  idempotency_key text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
DROP TRIGGER IF EXISTS trg_orders_updated ON public.orders;
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL,
  variant_id uuid,
  -- لقطة وقت الطلب (لا تتأثر بتعديل الأسعار لاحقًا)
  title text NOT NULL,
  variant_title text NOT NULL DEFAULT '',
  unit_price numeric(10,2) NOT NULL CHECK (unit_price >= 0),
  quantity int NOT NULL CHECK (quantity > 0 AND quantity <= 99),
  line_total numeric(10,2) NOT NULL CHECK (line_total >= 0)
);
CREATE INDEX IF NOT EXISTS idx_items_order ON public.order_items(order_id);

-- ============ قائمة الانتظار ============

CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('phone','email')),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','notified')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (category_id IS NOT NULL OR product_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON public.waitlist(status);

-- ============ المحتوى والإعدادات ============

CREATE TABLE IF NOT EXISTS public.content_blocks (
  key text PRIMARY KEY,
  title text NOT NULL,
  body_html text NOT NULL DEFAULT '',
  is_public boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_content_updated ON public.content_blocks;
CREATE TRIGGER trg_content_updated BEFORE UPDATE ON public.content_blocks
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  label text NOT NULL DEFAULT '',
  is_public boolean NOT NULL DEFAULT false
);

-- ============ الإدارة والتدقيق ============

CREATE TABLE IF NOT EXISTS public.admin_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'owner' CHECK (role IN ('owner')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor uuid,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_log(created_at DESC);

-- ============ صندوق الصادر (outbox) ============

CREATE TABLE IF NOT EXISTS public.outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed')),
  attempts int NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_outbox_pending ON public.outbox_events(status, next_attempt_at);

-- ============ إنشاء الطلب ذريًا (orders + items + outbox) ============

CREATE OR REPLACE FUNCTION public.create_order(
  p_idempotency_key text,
  p_customer_name text,
  p_customer_phone text,
  p_customer_phone2 text,
  p_governorate text,
  p_address text,
  p_notes text,
  p_payment_method text,
  p_subtotal numeric,
  p_shipping_fee numeric,
  p_total numeric,
  p_items jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_order_number text;
  item jsonb;
BEGIN
  INSERT INTO public.orders (
    customer_name, customer_phone, customer_phone2, governorate, address, notes,
    payment_method, subtotal, shipping_fee, total, idempotency_key
  ) VALUES (
    p_customer_name, p_customer_phone, p_customer_phone2, p_governorate, p_address, p_notes,
    p_payment_method, p_subtotal, p_shipping_fee, p_total, p_idempotency_key
  )
  RETURNING id, order_number INTO v_order_id, v_order_number;

  FOR item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    INSERT INTO public.order_items (
      order_id, product_id, variant_id, title, variant_title, unit_price, quantity, line_total
    ) VALUES (
      v_order_id,
      (item->>'product_id')::uuid,
      NULLIF(item->>'variant_id','')::uuid,
      item->>'title', COALESCE(item->>'variant_title',''),
      (item->>'unit_price')::numeric, (item->>'quantity')::int, (item->>'line_total')::numeric
    );
  END LOOP;

  INSERT INTO public.outbox_events (event, payload)
  VALUES ('order.created', jsonb_build_object(
    'order_id', v_order_id, 'order_number', v_order_number, 'total', p_total,
    'payment_method', p_payment_method,
    'customer', jsonb_build_object('name', p_customer_name, 'phone', p_customer_phone),
    'items', p_items
  ));

  RETURN jsonb_build_object('order_id', v_order_id, 'order_number', v_order_number);
END;
$$;

REVOKE ALL ON FUNCTION public.create_order(text,text,text,text,text,text,text,text,numeric,numeric,numeric,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order(text,text,text,text,text,text,text,text,numeric,numeric,numeric,jsonb) TO service_role;

-- ============ التخزين: حزمة صور المنتجات (قراءة عامة) ============

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "قراءة عامة لصور المنتجات" ON storage.objects;
CREATE POLICY "قراءة عامة لصور المنتجات"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- ============ RLS: التفعيل والسياسات ============

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbox_events ENABLE ROW LEVEL SECURITY;

-- الزائر: يقرأ الأقسام (بما فيها coming_soon للصفحات التشويقية)
DROP POLICY IF EXISTS "قراءة الأقسام للجميع" ON public.categories;
CREATE POLICY "قراءة الأقسام للجميع"
  ON public.categories FOR SELECT TO anon, authenticated USING (true);

-- الزائر: يقرأ المنتجات المنشورة فقط
DROP POLICY IF EXISTS "قراءة المنتجات المنشورة" ON public.products;
CREATE POLICY "قراءة المنتجات المنشورة"
  ON public.products FOR SELECT TO anon, authenticated USING (is_published = true);

-- الزائر: يقرأ متغيرات المنتجات المنشورة فقط
DROP POLICY IF EXISTS "قراءة متغيرات المنشور" ON public.product_variants;
CREATE POLICY "قراءة متغيرات المنشور"
  ON public.product_variants FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.products p WHERE p.id = product_id AND p.is_published = true
  ));

-- الزائر: المحتوى العام فقط
DROP POLICY IF EXISTS "قراءة المحتوى العام" ON public.content_blocks;
CREATE POLICY "قراءة المحتوى العام"
  ON public.content_blocks FOR SELECT TO anon, authenticated USING (is_public = true);

-- الزائر: الإعدادات العامة فقط (تواصل + شحن للعرض)
DROP POLICY IF EXISTS "قراءة الإعدادات العامة" ON public.site_settings;
CREATE POLICY "قراءة الإعدادات العامة"
  ON public.site_settings FOR SELECT TO anon, authenticated USING (is_public = true);

-- orders وorder_items وwaitlist: لا سياسات للمجهول — الإدراج من السيرفر (service role) فقط.
-- admin_profiles وaudit_log وoutbox_events: مقفولة تمامًا — service role فقط.
