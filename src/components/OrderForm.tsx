"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Select, Textarea } from "@/components/Field";
import { updateOrderAction } from "@/server/actions/admin";

export function OrderForm({
  orderId,
  initial,
}: {
  orderId: string;
  initial: { status: string; paymentStatus: string; internalNotes: string };
}) {
  const [status, setStatus] = useState(initial.status);
  const [paymentStatus, setPaymentStatus] = useState(initial.paymentStatus);
  const [notes, setNotes] = useState(initial.internalNotes);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="grid max-w-2xl gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMsg("");
        const r = await updateOrderAction(orderId, { status, paymentStatus, internalNotes: notes });
        setBusy(false);
        setMsg(r.ok ? "تم الحفظ." : r.error);
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Select label="الحالة" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="new">جديد</option>
          <option value="confirmed">مؤكد</option>
          <option value="paid">مدفوع</option>
          <option value="shipped">اتشحن</option>
          <option value="delivered">اتسلّم</option>
          <option value="cancelled">ملغي</option>
        </Select>
        <Select
          label="الدفع"
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
        >
          <option value="unpaid">غير مدفوع</option>
          <option value="paid">مدفوع</option>
        </Select>
      </div>
      <Textarea label="ملاحظات داخلية" value={notes} onChange={(e) => setNotes(e.target.value)} />
      {msg && (
        <p role="status" className="font-medium text-ink">
          {msg}
        </p>
      )}
      <div>
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? "…" : "حفظ"}
        </Button>
      </div>
    </form>
  );
}
