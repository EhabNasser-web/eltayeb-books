"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Input, Textarea } from "@/components/Field";
import { saveSettingsAction } from "@/server/actions/admin";

const LABELS: Record<string, string> = {
  whatsapp_number: "رقم الواتساب",
  facebook_url: "رابط الفيسبوك",
  instagram_url: "رابط انستجرام",
  tiktok_url: "رابط تيك توك",
  shipping_fee: "رسوم الشحن (جنيه)",
  transfer_details: "بيانات الدفع المسبق",
  team_name: "اسم فريق التواصل",
  contact_sla: "مدة التواصل بعد الطلب",
};

export function SettingsForm({ initial }: { initial: Array<{ key: string; value: string }> }) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(initial.map((s) => [s.key, s.value]))
  );
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="grid max-w-2xl gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMsg("");
        const r = await saveSettingsAction(
          initial.map((s) => ({ key: s.key, value: values[s.key] ?? "" }))
        );
        setBusy(false);
        setMsg(r.ok ? "تم الحفظ." : r.error);
      }}
    >
      {initial.map((s) =>
        s.key === "transfer_details" ? (
          <Textarea
            key={s.key}
            label={LABELS[s.key] ?? s.key}
            value={values[s.key] ?? ""}
            onChange={(e) => setValues({ ...values, [s.key]: e.target.value })}
            rows={3}
          />
        ) : (
          <Input
            key={s.key}
            label={LABELS[s.key] ?? s.key}
            value={values[s.key] ?? ""}
            onChange={(e) => setValues({ ...values, [s.key]: e.target.value })}
            dir={/url|number|fee/.test(s.key) ? "ltr" : undefined}
          />
        )
      )}
      {msg && (
        <p role="status" className="font-medium text-ink">
          {msg}
        </p>
      )}
      <div>
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? "…" : "حفظ الإعدادات"}
        </Button>
      </div>
    </form>
  );
}
