/** أنواع صفوف قاعدة البيانات (المرحلة 1). */

export type Category = {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover_image: string | null;
  status: "active" | "coming_soon";
  sort_order: number;
};

export type Product = {
  id: string;
  category_id: string | null;
  slug: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  stock_status: "in_stock" | "out_of_stock";
  allow_cod: boolean;
  is_new: boolean;
  new_until: string | null;
  is_published: boolean;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  title: string;
  dimensions: string;
  price: number;
  compare_at_price: number | null;
  is_available: boolean;
  sort_order: number;
};

export type OrderStatus = "new" | "confirmed" | "paid" | "shipped" | "delivered" | "cancelled";

export type Order = {
  id: string;
  order_number: string;
  status: OrderStatus;
  payment_method: "cod" | "prepaid";
  payment_status: "unpaid" | "paid";
  subtotal: number;
  shipping_fee: number;
  total: number;
  customer_name: string;
  customer_phone: string;
  customer_phone2: string;
  governorate: string;
  address: string;
  notes: string;
  internal_notes: string;
  created_at: string;
};

export type OrderItem = {
  id: string;
  title: string;
  variant_title: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type WaitlistEntry = {
  id: string;
  contact: string;
  channel: "phone" | "email";
  category_id: string | null;
  product_id: string | null;
  variant_id: string | null;
  status: "new" | "notified";
  created_at: string;
};

export type OutboxEvent = {
  id: string;
  event: string;
  payload: Record<string, unknown>;
  status: "pending" | "sent" | "failed";
  attempts: number;
};
