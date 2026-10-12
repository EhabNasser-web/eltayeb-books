"use client";

import { useState } from "react";
import { Badge } from "@/components/Badge";
import { setWaitlistStatusAction } from "@/server/actions/admin";

export function WaitlistTable({
  entries,
}: {
  entries: Array<{
    id: string;
    contact: string;
    channel: string;
    status: string;
    created_at: string;
  }>;
}) {
  const [rows, setRows] = useState(entries);
  return (
    <ul className="mt-6 divide-y divide-line border-y border-line">
      {rows.map((w) => (
        <li key={w.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
          <span className="text-ink" dir="ltr">
            {w.contact}
          </span>
          <span className="text-sm text-ink-soft">
            {w.channel === "phone" ? "موبايل" : "إيميل"}
          </span>
          <Badge tone={w.status === "new" ? "warning" : "success"}>
            {w.status === "new" ? "جديد" : "تم إبلاغه"}
          </Badge>
          {w.status === "new" && (
            <button
              type="button"
              className="text-sm text-primary underline underline-offset-4"
              onClick={async () => {
                const r = await setWaitlistStatusAction(w.id, "notified");
                if (r.ok)
                  setRows((p) => p.map((x) => (x.id === w.id ? { ...x, status: "notified" } : x)));
              }}
            >
              تعليم كمُبلغ
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
