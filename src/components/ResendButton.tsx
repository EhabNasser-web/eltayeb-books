"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { resendOutboxAction } from "@/server/actions/admin";

export function ResendButton({ pending }: { pending: number }) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  if (pending === 0) return <p className="text-ink-soft">لا توجد أحداث معلقة.</p>;
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="secondary"
        size="sm"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          const r = await resendOutboxAction();
          setBusy(false);
          setMsg(r.ok ? `أُرسل ${r.sent} من ${r.processed}.` : r.error);
        }}
      >
        {busy ? "…" : `إعادة إرسال المعلّق (${pending})`}
      </Button>
      {msg && <span className="text-base text-ink-soft">{msg}</span>}
    </div>
  );
}
