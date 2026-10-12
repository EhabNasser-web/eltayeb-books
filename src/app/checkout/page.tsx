"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { Input, Select, Textarea } from "@/components/Field";
import { SectionHeading } from "@/components/SectionHeading";
import { Turnstile } from "@/components/Turnstile";
import { useCart } from "@/components/CartProvider";
import { GOVERNORATES } from "@/lib/governorates";
import { createOrderAction, previewCartAction } from "@/server/actions/order";

type Totals = { subtotal: number; shippingFee: number; total: number; codAllowed: boolean };

export default function CheckoutPage() {
  const { lines, clear } = useCart();
  const router = useRouter();
  const idempotencyKey = useRef(crypto.randomUUID());

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phone2, setPhone2] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<"cod" | "prepaid">("cod");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"form" | "review">("form");
  const [totals, setTotals] = useState<Totals | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (lines.length === 0) {
    return (
      <Container className="pb-20 pt-12">
        <SectionHeading title="إتمام الطلب" />
        <p className="mt-4 text-ink-soft">
          العربة فارغة —{" "}
          <Link href="/#books" className="underline underline-offset-4">
            اختار كتبك الأول
          </Link>
          .
        </p>
      </Container>
    );
  }

  const items = lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity }));

  const doReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const r = await previewCartAction(items);
    setBusy(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setTotals(r.data);
    if (payment === "cod" && !r.data.codAllowed) {
      setPayment("prepaid");
      setNotice("الدفع عند الاستلام غير متاح لبعض الأصناف — الطلب كله دفع مسبق.");
    }
    setStep("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const doConfirm = async () => {
    if (!totals) return;
    setBusy(true);
    setError("");
    const r = await createOrderAction({
      items,
      customerName: name,
      customerPhone: phone,
      customerPhone2: phone2,
      governorate,
      address,
      notes,
      paymentMethod: totals.codAllowed ? payment : "prepaid",
      idempotencyKey: idempotencyKey.current,
      turnstileToken: token,
    });
    if (!r.ok) {
      setBusy(false);
      setError(r.error);
      setStep("form");
      return;
    }
    clear();
    router.push(`/checkout/success/${encodeURIComponent(r.data.orderNumber)}`);
  };

  return (
    <Container className="pb-20 pt-12">
      <SectionHeading title={step === "form" ? "إتمام الطلب" : "مراجعة وتأكيد"} />
      {error && (
        <p role="alert" className="mt-4 max-w-2xl font-medium text-error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-4 max-w-2xl font-medium text-warning">
          {notice}
        </p>
      )}

      {step === "form" ? (
        <form onSubmit={doReview} className="mt-6 grid max-w-2xl gap-5">
          <Input
            label="الاسم الكامل"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="الموبايل"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01xxxxxxxxx"
            dir="ltr"
            required
          />
          <Input
            label="رقم إضافي (اختياري)"
            value={phone2}
            onChange={(e) => setPhone2(e.target.value)}
            dir="ltr"
          />
          <Select
            label="المحافظة"
            value={governorate}
            onChange={(e) => setGovernorate(e.target.value)}
            required
          >
            <option value="" disabled>
              اختر المحافظة
            </option>
            {GOVERNORATES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
          <Textarea
            label="العنوان بالتفصيل"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <Textarea
            label="ملاحظات (اختياري)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <fieldset>
            <legend className="font-medium text-ink">طريقة الدفع</legend>
            <div className="mt-2 flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pay"
                  checked={payment === "cod"}
                  onChange={() => setPayment("cod")}
                />
                الدفع عند الاستلام (لو متاح لكل الأصناف)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pay"
                  checked={payment === "prepaid"}
                  onChange={() => setPayment("prepaid")}
                />
                دفع مسبق (إنستاباي / فودافون كاش بعد التواصل)
              </label>
            </div>
          </fieldset>
          <Turnstile onToken={setToken} />
          <div>
            <Button type="submit" variant="primary" disabled={busy}>
              {busy ? "جاري المراجعة…" : "مراجعة الطلب"}
            </Button>
          </div>
        </form>
      ) : (
        totals && (
          <div className="mt-6 max-w-2xl">
            <div className="rounded-book border border-line p-5">
              <p className="font-medium text-ink">
                {name} — <span dir="ltr">{phone}</span>
              </p>
              <p className="text-ink-soft">
                {governorate} — {address}
              </p>
              <p className="mt-2 text-ink">
                الدفع: {payment === "cod" && totals.codAllowed ? "عند الاستلام" : "مسبق"}
              </p>
            </div>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {lines.map((l) => (
                <li key={l.variantId} className="flex justify-between gap-4 py-3">
                  <span className="text-ink">
                    {l.productTitle} ({l.variantTitle}) × {l.quantity}
                  </span>
                  <span className="text-ink">{l.price * l.quantity} جنيه</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 text-lg">
              <p className="flex justify-between text-ink-soft">
                <span>المجموع الفرعي</span>
                <span>{totals.subtotal} جنيه</span>
              </p>
              <p className="flex justify-between text-ink-soft">
                <span>الشحن</span>
                <span>{totals.shippingFee} جنيه</span>
              </p>
              <p className="flex justify-between font-bold text-ink">
                <span>الإجمالي</span>
                <span>{totals.total} جنيه</span>
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="primary" onClick={doConfirm} disabled={busy}>
                {busy ? "جاري التأكيد…" : "تأكيد الطلب"}
              </Button>
              <Button variant="secondary" onClick={() => setStep("form")} disabled={busy}>
                تعديل البيانات
              </Button>
            </div>
          </div>
        )
      )}
    </Container>
  );
}
