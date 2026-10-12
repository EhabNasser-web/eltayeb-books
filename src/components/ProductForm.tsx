"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Input, Select, Textarea } from "@/components/Field";
import {
  removeImageAction,
  saveProductAction,
  saveVariantsAction,
  uploadImageAction,
} from "@/server/actions/admin";

type VariantRow = {
  title: string;
  dimensions: string;
  price: string;
  compareAtPrice: string;
  isAvailable: boolean;
};

type Props = {
  productId?: string;
  initial: {
    title: string;
    slug: string;
    description: string;
    categoryId: string;
    price: string;
    stockStatus: "in_stock" | "out_of_stock";
    allowCod: boolean;
    isNew: boolean;
    isPublished: boolean;
    images: string[];
  };
  categories: Array<{ id: string; title: string }>;
  initialVariants: VariantRow[];
};

export function ProductForm({ productId, initial, categories, initialVariants }: Props) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [variants, setVariants] = useState<VariantRow[]>(initialVariants);
  const [images, setImages] = useState<string[]>(initial.images);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  const saveAll = async () => {
    setBusy(true);
    setMsg("");
    const r = await saveProductAction(
      {
        title: f.title,
        slug: f.slug,
        description: f.description,
        categoryId: f.categoryId || null,
        price: Number(f.price),
        stockStatus: f.stockStatus,
        allowCod: f.allowCod,
        isNew: f.isNew,
        isPublished: f.isPublished,
      },
      productId
    );
    if (!r.ok) {
      setBusy(false);
      setMsg(r.error);
      return;
    }
    const pid = r.id;
    const vr = await saveVariantsAction(
      pid,
      variants.map((v) => ({
        title: v.title,
        dimensions: v.dimensions,
        price: Number(v.price),
        compareAtPrice: v.compareAtPrice === "" ? null : Number(v.compareAtPrice),
        isAvailable: v.isAvailable,
      }))
    );
    setBusy(false);
    if (!vr.ok) {
      setMsg(vr.error);
      return;
    }
    if (!productId) router.push(`/admin/products/${pid}`);
    else {
      setMsg("تم الحفظ.");
      router.refresh();
    }
  };

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div className="grid gap-4">
        <Input label="العنوان" value={f.title} onChange={(e) => set("title", e.target.value)} />
        <Input
          label="الرابط (slug)"
          value={f.slug}
          onChange={(e) => set("slug", e.target.value)}
          dir="ltr"
        />
        <Textarea
          label="الوصف"
          value={f.description}
          onChange={(e) => set("description", e.target.value)}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="القسم"
            value={f.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
          >
            <option value="">بدون قسم</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </Select>
          <Input
            label="السعر المرجعي (جنيه)"
            value={f.price}
            onChange={(e) => set("price", e.target.value)}
            dir="ltr"
            inputMode="decimal"
          />
          <Select
            label="حالة المخزون"
            value={f.stockStatus}
            onChange={(e) => set("stockStatus", e.target.value as "in_stock" | "out_of_stock")}
          >
            <option value="in_stock">متوفر</option>
            <option value="out_of_stock">غير متوفر</option>
          </Select>
        </div>
        <div className="flex flex-wrap gap-5">
          <Check
            label="الدفع عند الاستلام"
            checked={f.allowCod}
            onChange={(v) => set("allowCod", v)}
          />
          <Check label="جديد" checked={f.isNew} onChange={(v) => set("isNew", v)} />
          <Check label="منشور" checked={f.isPublished} onChange={(v) => set("isPublished", v)} />
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl text-ink">المقاسات والأسعار</h3>
        <p className="text-base text-ink-soft">
          المقاس المتاح بسعر صفر مرفوض — حدّد سعرًا أو أبقه غير متاح.
        </p>
        <div className="mt-3 space-y-3">
          {variants.map((v, i) => (
            <div key={i} className="grid gap-2 rounded-book border border-line p-3 md:grid-cols-5">
              <Input
                label="المقاس"
                value={v.title}
                onChange={(e) => editRow(i, "title", e.target.value)}
              />
              <Input
                label="الأبعاد"
                value={v.dimensions}
                onChange={(e) => editRow(i, "dimensions", e.target.value)}
                dir="ltr"
              />
              <Input
                label="السعر"
                value={v.price}
                onChange={(e) => editRow(i, "price", e.target.value)}
                dir="ltr"
                inputMode="decimal"
              />
              <Input
                label="قبل الخصم"
                value={v.compareAtPrice}
                onChange={(e) => editRow(i, "compareAtPrice", e.target.value)}
                dir="ltr"
                inputMode="decimal"
              />
              <div className="flex items-end gap-2">
                <Check
                  label="متاح"
                  checked={v.isAvailable}
                  onChange={(val) => editRow(i, "isAvailable", val)}
                />
                <Button
                  variant="text"
                  size="sm"
                  onClick={() => setVariants((p) => p.filter((_, j) => j !== i))}
                >
                  حذف
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setVariants((p) => [
                ...p,
                { title: "", dimensions: "", price: "", compareAtPrice: "", isAvailable: false },
              ])
            }
          >
            إضافة مقاس
          </Button>
        </div>
      </div>

      {productId && (
        <div>
          <h3 className="font-display text-xl text-ink">الصور</h3>
          <div className="mt-2 flex flex-wrap gap-3">
            {images.map((u) => (
              <div key={u} className="w-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="" className="w-full rounded-book border border-line" />
                <button
                  type="button"
                  className="mt-1 text-sm text-error underline underline-offset-4"
                  onClick={async () => {
                    const r = await removeImageAction(productId, u);
                    if (r.ok) setImages((p) => p.filter((x) => x !== u));
                    else setMsg(r.error);
                  }}
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
          <label className="mt-3 block max-w-md">
            <span className="text-base text-ink-soft">رفع صورة (jpg/png/webp حتى 2 ميجا)</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mt-1 block w-full text-ink"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const fd = new FormData();
                fd.append("file", file);
                const r = await uploadImageAction(productId, fd);
                if (r.ok) setImages((p) => [...p, r.url]);
                else setMsg(r.error);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      )}

      {msg && (
        <p role="status" className="font-medium text-error">
          {msg}
        </p>
      )}
      <div>
        <Button variant="primary" disabled={busy} onClick={saveAll}>
          {busy ? "جاري الحفظ…" : productId ? "حفظ التعديلات" : "إنشاء المنتج"}
        </Button>
      </div>
    </div>
  );

  function editRow(i: number, k: keyof VariantRow, v: string | boolean) {
    setVariants((p) => p.map((row, j) => (j === i ? { ...row, [k]: v } : row)));
  }
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-ink">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
