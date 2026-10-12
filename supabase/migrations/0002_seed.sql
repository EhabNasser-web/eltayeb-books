-- المرحلة 1: البيانات التأسيسية (تُنفَّذ بعد 0001).
-- الأسعار والتوافر حقيقية بتاريخ 2026-10-11 — أي تعديل لاحقًا من الداشبورد.

-- ============ الإعدادات ============

INSERT INTO public.site_settings (key, value, label, is_public) VALUES
  ('whatsapp_number', '01091429629', 'رقم الواتساب', true),
  ('facebook_url', 'https://www.facebook.com/profile.php?id=61594967167208', 'رابط الفيسبوك', true),
  ('instagram_url', 'https://www.instagram.com/eltayeb.books', 'رابط انستجرام', true),
  ('tiktok_url', 'https://www.tiktok.com/@ehab_nasse_r', 'رابط تيك توك', true),
  -- TODO(admin): حدّد رسوم الشحن الفعلية قبل الإطلاق — القيمة الحالية صفر مؤقت.
  ('shipping_fee', '0', 'رسوم الشحن بالجنيه', false),
  ('transfer_details', 'بيانات التحويل تُرسل للعميل بعد التواصل معه.', 'بيانات الدفع المسبق', false),
  ('team_name', 'خدمة عملاء الطيب', 'اسم فريق التواصل', true),
  ('contact_sla', 'في أقرب وقت', 'مدة التواصل بعد الطلب', true)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, label = EXCLUDED.label, is_public = EXCLUDED.is_public;

-- ============ المحتوى (مسودات تحتاج مراجعة صاحب الموقع) ============

INSERT INTO public.content_blocks (key, title, body_html, is_public) VALUES
  ('about', 'من نحن',
   '<p>الطيب للكتب مكتبة صغيرة بتحب الكتب النافعة: كتب دينية وكتب تزكية النفس نختارها بعناية ونوصّلها لحد باب بيتك في كل محافظات مصر.</p>',
   true),
  ('return_policy', 'سياسة الاستبدال والاسترجاع',
   '<p>لو الكتاب وصلك فيه عيب طباعة أو تلف من الشحن، تواصل معنا وهنستبدله لك. راجع الكتاب أول ما يوصلك وبلّغنا بأي مشكلة.</p>',
   true),
  ('shipping_payment', 'الشحن والدفع',
   '<p>الشحن لكل محافظات مصر. الدفع عند الاستلام متاح للكتب الموضّح عليها ذلك. سياستنا: ثمن الكتاب يُدفع أولًا، ورسوم الشحن عند الاستلام. الدفع المسبق (إنستاباي أو فودافون كاش) يتم بعد تواصل فريقنا معك وإرسال بيانات التحويل.</p>',
   true),
  ('privacy', 'سياسة الخصوصية',
   '<p>بنجمع منك الاسم ورقم الموبايل والعنوان فقط لتوصيل طلبك والتواصل معك بخصوصه. لا نشارك بياناتك مع أي طرف ثالث، ولا نطلب أي بيانات دفع إلكتروني على الموقع.</p>',
   true),
  ('announcement', 'شريط الإعلان', '<p>التوصيل لباب البيت في كل محافظات مصر</p>', true),
  ('hero_title', 'عنوان الافتتاحية', 'كتب قيّمة لحد باب بيتك', true),
  ('hero_subtitle', 'سطر الافتتاحية',
   'مكتبة صغيرة تختار لك الكتب النافعة بعناية — بصورها الحقيقية وأسعارها الواضحة.', true)
ON CONFLICT (key) DO UPDATE SET title = EXCLUDED.title, is_public = EXCLUDED.is_public;

-- ============ الأقسام ============

INSERT INTO public.categories (slug, title, description, status, sort_order) VALUES
  ('books', 'كتب دينية وتزكية النفس', 'المختصر في التفسير والقرآن تدبرًا وعملًا وغيرها من الكتب الموثوقة.', 'active', 1),
  ('perfumes', 'العطور', 'قسم العطور — قريبًا.', 'coming_soon', 2),
  ('sibah', 'السبح', 'قسم السبح — قريبًا.', 'coming_soon', 3),
  ('prayer-mats', 'سجاجيد الصلاة', 'قسم سجاجيد الصلاة — قريبًا.', 'coming_soon', 4)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
  status = EXCLUDED.status, sort_order = EXCLUDED.sort_order;

-- ============ المنتج 1: المختصر في التفسير ============

INSERT INTO public.products (category_id, slug, title, description, price, stock_status, allow_cod, is_new, new_until, is_published)
VALUES (
  (SELECT id FROM public.categories WHERE slug = 'books'),
  'mukhtasar-altafsir', 'المختصر في التفسير',
  'تفسير ميسَّر لمعاني القرآن الكريم، يشرح الآيات بعبارة موجزة وواضحة دون إطالة أو تعقيد. يناسب كل من يريد فهم كتاب الله وتدبُّره، سواء كان مبتدئًا أو طالب علم أو قارئًا يبحث عن رفيق يومي لوِرده. أسلوب سهل ولغة بسيطة تقرّب المعنى من القارئ، ومناسب للقراءة اليومية والمراجعة السريعة وحلقات التعلّم.',
  260, 'in_stock', true, true, CURRENT_DATE + 60, true
)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
  price = EXCLUDED.price, stock_status = EXCLUDED.stock_status, is_published = EXCLUDED.is_published;

-- السعر صفر هنا = غير معروف (المتغير غير متاح) — لا يُعرض للزائر أبدًا.
INSERT INTO public.product_variants (product_id, title, dimensions, price, compare_at_price, is_available, sort_order)
VALUES
  ((SELECT id FROM public.products WHERE slug = 'mukhtasar-altafsir'), 'الربع', '17x12cm', 260, 275, true, 1),
  ((SELECT id FROM public.products WHERE slug = 'mukhtasar-altafsir'), 'النص', '20x14cm', 0, NULL, false, 2),
  ((SELECT id FROM public.products WHERE slug = 'mukhtasar-altafsir'), 'النص المحير', '24x17cm', 480, 520, true, 3),
  ((SELECT id FROM public.products WHERE slug = 'mukhtasar-altafsir'), 'الجوامعي', '35x25cm', 0, NULL, false, 4)
ON CONFLICT (product_id, title) DO UPDATE SET price = EXCLUDED.price,
  compare_at_price = EXCLUDED.compare_at_price, is_available = EXCLUDED.is_available;

-- ============ المنتج 2: القرآن تدبر وعمل ============

INSERT INTO public.products (category_id, slug, title, description, price, stock_status, allow_cod, is_new, new_until, is_published)
VALUES (
  (SELECT id FROM public.categories WHERE slug = 'books'),
  'quran-tadabbur-wa-amal', 'القرآن تدبر وعمل',
  'مصحف يجمع بين تلاوة كتاب الله وتدبُّر معانيه والعمل بهداياته. لا يكتفي بأن تقرأ الآيات، بل يعينك على أن تقف عندها، وتفهم مقصدها، وتحوّلها إلى سلوك ينعكس على يومك وأخلاقك وقراراتك. مناسب للورد اليومي وللحفظ والمراجعة وحلقات التدبّر، ويصلح هدية قيّمة لمن تحب.',
  400, 'in_stock', true, true, CURRENT_DATE + 60, true
)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
  price = EXCLUDED.price, stock_status = EXCLUDED.stock_status, is_published = EXCLUDED.is_published;

INSERT INTO public.product_variants (product_id, title, dimensions, price, compare_at_price, is_available, sort_order)
VALUES
  ((SELECT id FROM public.products WHERE slug = 'quran-tadabbur-wa-amal'), 'الربع', '17x12cm', 0, NULL, false, 1),
  ((SELECT id FROM public.products WHERE slug = 'quran-tadabbur-wa-amal'), 'النص', '20x14cm', 400, NULL, true, 2),
  ((SELECT id FROM public.products WHERE slug = 'quran-tadabbur-wa-amal'), 'النص المحير', '24x17cm', 0, NULL, false, 3),
  ((SELECT id FROM public.products WHERE slug = 'quran-tadabbur-wa-amal'), 'الجوامعي', '35x25cm', 0, NULL, false, 4)
ON CONFLICT (product_id, title) DO UPDATE SET price = EXCLUDED.price,
  compare_at_price = EXCLUDED.compare_at_price, is_available = EXCLUDED.is_available;
