import { createAnonClient } from "./supabase";
import { isSupabaseConfigured } from "@/lib/env";
import type { Category, Product, ProductVariant } from "./db-types";

/* استعلامات الواجهة العامة — عبر anon وRLS. أي فشل يرجع فارغًا (تدهور لطيف). */

export type ProductWithExtras = Product & {
  category: Pick<Category, "title" | "slug" | "status"> | null;
  variants: ProductVariant[];
};

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isSupabaseConfigured()) return fallback;
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export function getPublishedProducts(): Promise<ProductWithExtras[]> {
  return safe(async () => {
    const db = createAnonClient();
    const { data, error } = await db
      .from("products")
      .select("*,category:categories(title,slug,status),variants:product_variants(*)")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const rows = (data ?? []) as ProductWithExtras[];
    for (const r of rows) r.variants.sort((a, b) => a.sort_order - b.sort_order);
    return rows;
  }, []);
}

export function getProductBySlug(slug: string): Promise<ProductWithExtras | null> {
  return safe(async () => {
    const db = createAnonClient();
    const { data, error } = await db
      .from("products")
      .select("*,category:categories(title,slug,status),variants:product_variants(*)")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw error;
    const row = data as ProductWithExtras | null;
    if (row) row.variants.sort((a, b) => a.sort_order - b.sort_order);
    return row;
  }, null);
}

export type CategoryWithProducts = Category & { products: ProductWithExtras[] };

export function getCategoryBySlug(slug: string): Promise<CategoryWithProducts | null> {
  return safe(async () => {
    const db = createAnonClient();
    const { data: category, error } = await db
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !category) return null;
    const cat = category as Category;
    let products: ProductWithExtras[] = [];
    if (cat.status === "active") {
      const { data: prods } = await db
        .from("products")
        .select("*,variants:product_variants(*)")
        .eq("category_id", cat.id)
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      products = ((prods ?? []) as ProductWithExtras[]).map((p) => ({
        ...p,
        category: { title: cat.title, slug: cat.slug, status: cat.status },
        variants: [...p.variants].sort((a, b) => a.sort_order - b.sort_order),
      }));
    }
    return { ...cat, products };
  }, null);
}

export function getCategories(): Promise<Category[]> {
  return safe(async () => {
    const db = createAnonClient();
    const { data, error } = await db
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Category[];
  }, []);
}

export function getContentBlock(key: string): Promise<{ title: string; body: string } | null> {
  return safe(async () => {
    const db = createAnonClient();
    const { data, error } = await db
      .from("content_blocks")
      .select("title,body_html")
      .eq("key", key)
      .eq("is_public", true)
      .maybeSingle();
    if (error || !data) return null;
    return { title: data.title as string, body: data.body_html as string };
  }, null);
}
