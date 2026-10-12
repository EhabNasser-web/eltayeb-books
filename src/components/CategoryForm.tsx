"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Input, Select, Textarea } from "@/components/Field";
import { saveCategoryAction } from "@/server/actions/admin";

export function CategoryForm({
  categoryId,
  initial,
}: {
  categoryId?: string;
  initial: { title: string; slug: string; description: string; status: "active" | "coming_soon" };
}) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="grid max-w-2xl gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMsg("");
        const r = await saveCategoryAction(f, categoryId);
        setBusy(false);
        if (!r.ok) setMsg(r.error);
        else if (!categoryId) router.push(`/admin/categories/${r.id}`);
        else {
          setMsg("تم الحفظ.");
          router.refresh();
        }
      }}
    >
      <Input
        label="العنوان"
        value={f.title}
        onChange={(e) => setF({ ...f, title: e.target.value })}
      />
      <Input
        label="الرابط (slug)"
        value={f.slug}
        onChange={(e) => setF({ ...f, slug: e.target.value })}
        dir="ltr"
      />
      <Textarea
        label="الوصف"
        value={f.description}
        onChange={(e) => setF({ ...f, description: e.target.value })}
      />
      <Select
        label="الحالة"
        value={f.status}
        onChange={(e) => setF({ ...f, status: e.target.value as "active" | "coming_soon" })}
      >
        <option value="active">نشط (يُباع منه)</option>
        <option value="coming_soon">قريبًا (تشويقي فقط)</option>
      </Select>
      {msg && (
        <p role="status" className="font-medium text-error">
          {msg}
        </p>
      )}
      <div>
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? "…" : categoryId ? "حفظ" : "إنشاء القسم"}
        </Button>
      </div>
    </form>
  );
}
