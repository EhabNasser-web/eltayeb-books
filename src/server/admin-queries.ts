import { createServiceClient } from "./supabase";
import { requireAdmin } from "./admin";

/* استعلامات لوحة الإدارة — كلها عبر service role بعد بوابة requireAdmin. */

export async function getDashboardStats() {
  await requireAdmin();
  const db = createServiceClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [newOrders, awaiting, outbox] = await Promise.all([
    db
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", today.toISOString()),
    db.from("orders").select("id", { count: "exact", head: true }).eq("status", "new"),
    db.from("outbox_events").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  const { data: recent } = await db
    .from("orders")
    .select("id,order_number,customer_name,total,status,created_at")
    .order("created_at", { ascending: false })
    .limit(8);
  return {
    today: newOrders.count ?? 0,
    awaiting: awaiting.count ?? 0,
    outboxPending: outbox.count ?? 0,
    recent: recent ?? [],
  };
}

export async function listOrdersAdmin(filter?: { status?: string; q?: string }) {
  await requireAdmin();
  const db = createServiceClient();
  let query = db
    .from("orders")
    .select("id,order_number,customer_name,customer_phone,total,status,payment_status,created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (filter?.status) query = query.eq("status", filter.status);
  if (filter?.q)
    query = query.or(`order_number.ilike.%${filter.q}%,customer_phone.ilike.%${filter.q}%`);
  const { data } = await query;
  return data ?? [];
}

export async function getOrderAdmin(id: string) {
  await requireAdmin();
  const db = createServiceClient();
  const { data: order } = await db.from("orders").select("*").eq("id", id).maybeSingle();
  if (!order) return null;
  const { data: items } = await db.from("order_items").select("*").eq("order_id", id);
  return { order, items: items ?? [] };
}

export async function listProductsAdmin() {
  await requireAdmin();
  const db = createServiceClient();
  const { data } = await db
    .from("products")
    .select("*,category:categories(title),variants:product_variants(*)")
    .order("created_at", { ascending: false });
  return (data ?? []) as Array<Record<string, unknown>>;
}

export async function getProductAdmin(id: string) {
  await requireAdmin();
  const db = createServiceClient();
  const { data } = await db.from("products").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  const { data: variants } = await db
    .from("product_variants")
    .select("*")
    .eq("product_id", id)
    .order("sort_order");
  const { data: categories } = await db.from("categories").select("id,title").order("sort_order");
  return { product: data, variants: variants ?? [], categories: categories ?? [] };
}

export async function listCategoriesAdmin() {
  await requireAdmin();
  const db = createServiceClient();
  const { data } = await db.from("categories").select("*").order("sort_order");
  return data ?? [];
}

export async function listContentAdmin() {
  await requireAdmin();
  const db = createServiceClient();
  const { data } = await db.from("content_blocks").select("*").order("key");
  return data ?? [];
}

export async function listSettingsAdmin() {
  await requireAdmin();
  const db = createServiceClient();
  const { data } = await db.from("site_settings").select("*").order("key");
  return data ?? [];
}

export async function listWaitlistAdmin() {
  await requireAdmin();
  const db = createServiceClient();
  const { data } = await db
    .from("waitlist")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  return data ?? [];
}

export async function listAuditAdmin() {
  await requireAdmin();
  const db = createServiceClient();
  const { data } = await db
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  return data ?? [];
}
