"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Input, Textarea } from "@/components/Field";
import { saveContentAction } from "@/server/actions/admin";

export function ContentForm({
  blockKey,
  title,
  body,
}: {
  blockKey: string;
  title: string;
  body: string;
}) {
  const [t, setT] = useState(title);
  const [b, setB] = useState(body);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="flex max-w-3xl flex-col gap-3 rounded-book border border-line p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMsg("");
        const r = await saveContentAction(blockKey, t, b);
        setBusy(false);
        setMsg(r.ok ? "تم الحفظ (نُظّف من أي أكواد ضارة)." : r.error);
      }}
    >
      <p className="font-mono text-sm text-muted" dir="ltr">
        {blockKey}
      </p>
      <Input label="العنوان" value={t} onChange={(e) => setT(e.target.value)} />
      <Textarea
        label="المحتوى (HTML بسيط: p strong em ul ol li a)"
        value={b}
        onChange={(e) => setB(e.target.value)}
        rows={6}
        dir="ltr"
      />
      {msg && (
        <p role="status" className="font-medium text-ink">
          {msg}
        </p>
      )}
      <div>
        <Button type="submit" variant="secondary" size="sm" disabled={busy}>
          {busy ? "…" : "حفظ"}
        </Button>
      </div>
    </form>
  );
}
