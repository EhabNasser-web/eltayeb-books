"use client";

import { useState } from "react";
import { Button } from "./Button";
import { Input, Select } from "./Field";
import { Turnstile } from "./Turnstile";
import { joinWaitlistAction } from "@/server/actions/waitlist";

/** فورم «ابلغني لما يتوفر» — موبايل أو إيميل، بدون شراء. */
export function WaitlistForm({
  categoryId,
  productId,
  variantId,
}: {
  categoryId?: string;
  productId?: string;
  variantId?: string;
}) {
  const [channel, setChannel] = useState<"phone" | "email">("phone");
  const [contact, setContact] = useState("");
  const [token, setToken] = useState("");
  const [state, setState] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="flex max-w-md flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true);
        setState(null);
        const r = await joinWaitlistAction({
          contact,
          channel,
          categoryId: categoryId ?? null,
          productId: productId ?? null,
          variantId: variantId ?? null,
          turnstileToken: token,
        });
        setBusy(false);
        setState(
          r.ok
            ? { ok: true, message: "تم — هنبلغك أول ما يتوفر." }
            : { ok: false, message: r.error }
        );
        if (r.ok) setContact("");
      }}
    >
      <Select
        label="طريقة التواصل"
        value={channel}
        onChange={(e) => {
          setChannel(e.target.value as "phone" | "email");
          setContact("");
        }}
      >
        <option value="phone">موبايل</option>
        <option value="email">إيميل</option>
      </Select>
      <Input
        label={channel === "phone" ? "رقم الموبايل" : "الإيميل"}
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        placeholder={channel === "phone" ? "01xxxxxxxxx" : "name@mail.com"}
        dir={channel === "phone" ? "ltr" : undefined}
        required
      />
      <Turnstile onToken={setToken} />
      {state && (
        <p
          role={state.ok ? "status" : "alert"}
          className={state.ok ? "text-success" : "text-error"}
        >
          {state.message}
        </p>
      )}
      <div>
        <Button type="submit" variant="secondary" disabled={busy}>
          {busy ? "جاري الحفظ…" : "ابلغني لما يتوفر"}
        </Button>
      </div>
    </form>
  );
}
