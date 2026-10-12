"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Field";
import { Turnstile } from "@/components/Turnstile";
import { loginAction } from "@/server/actions/auth";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="flex max-w-md flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true);
        setError("");
        const r = await loginAction({ email, password, turnstileToken: token });
        // النجاح يعيد التوجيه من السيرفر؛ الفشل يرجع رسالة عامة
        if (!r.ok) {
          setBusy(false);
          setError(r.error);
        }
      }}
    >
      <Input
        label="الإيميل"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        dir="ltr"
        required
      />
      <Input
        label="كلمة السر"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        dir="ltr"
        required
      />
      <Turnstile onToken={setToken} />
      {error && (
        <p role="alert" className="font-medium text-error">
          {error}
        </p>
      )}
      <div>
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? "جاري الدخول…" : "دخول"}
        </Button>
      </div>
    </form>
  );
}
