import type { MetadataRoute } from "next";
import { getCategories, getPublishedProducts } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/cart`, lastModified: new Date() },
    { url: `${base}/checkout`, lastModified: new Date() },
    { url: `${base}/info/about`, lastModified: new Date() },
    { url: `${base}/info/return-policy`, lastModified: new Date() },
    { url: `${base}/info/shipping-payment`, lastModified: new Date() },
    { url: `${base}/info/privacy`, lastModified: new Date() },
  ];
  try {
    const [products, categories] = await Promise.all([getPublishedProducts(), getCategories()]);
    for (const p of products)
      entries.push({ url: `${base}/p/${p.slug}`, lastModified: new Date() });
    for (const c of categories)
      entries.push({ url: `${base}/c/${c.slug}`, lastModified: new Date() });
  } catch {
    /* قبل الربط: الصفحات الثابتة فقط */
  }
  return entries;
}
