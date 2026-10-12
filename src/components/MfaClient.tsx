"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Field";
import { mfaEnrollAction, mfaVerifyAction } from "@/server/actions/auth";

export function MfaClient({ factors }: { factors: Array<{ id: string; friendlyName: string }> }) {
  const [mode, setMode] = useState<"verify" | "setup">(factors.length > 0 ? "verify" : "setup");
  const [factorId, setFactorId] = useState("");
  const [secret, setSecret] = useState("");
  const [uri, setUri] = useState("");
  const [code, setCode] = useState("");
  const [selected, setSelected] = useState(factors[0]?.id ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const verify = async (fid: string) => {
    if (busy) return;
    setBusy(true);
    setError("");
    const r = await mfaVerifyAction({ factorId: fid, code });
    if (!r.ok) {
      setBusy(false);
      setError(r.error);
    }
  };

  return (
    <div className="flex max-w-md flex-col gap-5">
      <div className="flex gap-2">
        <Button
          variant={mode === "verify" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setMode("verify")}
        >
          عندي جهاز مسجل
        </Button>
        <Button
          variant={mode === "setup" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setMode("setup")}
        >
          تسجيل جهاز جديد
        </Button>
      </div>

      {mode === "setup" ? (
        <div className="flex flex-col gap-4">
          {!factorId ? (
            <>
              <p className="text-ink-soft">
                المصادقة الثنائية إجبارية. سجّل تطبيق مصادقة (مثل Google Authenticator) ثم اضغط بدء
                التسجيل.
              </p>
              <div>
                <Button
                  variant="primary"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    setError("");
                    const r = await mfaEnrollAction();
                    setBusy(false);
                    if (!r.ok) setError(r.error);
                    else {
                      setFactorId(r.factorId);
                      setSecret(r.secret);
                      setUri(r.uri);
                    }
                  }}
                >
                  {busy ? "…" : "بدء التسجيل"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-ink-soft">
                أدخل هذا المفتاح يدويًا في تطبيق المصادقة، ثم اكتب الرمز المكوّن من 6 أرقام:
              </p>
              <p
                className="rounded-book border border-line bg-paper-deep p-3 font-mono text-lg"
                dir="ltr"
              >
                {secret}
              </p>
              <p className="break-all text-sm text-muted" dir="ltr">
                {uri}
              </p>
              <Input
                label="رمز التحقق"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                dir="ltr"
                maxLength={6}
              />
              <div>
                <Button variant="primary" disabled={busy} onClick={() => verify(factorId)}>
                  {busy ? "…" : "تأكيد التسجيل"}
                </Button>
              </div>
            </>
          )}
        </div>
      ) : factors.length > 0 ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (selected) verify(selected);
          }}
        >
          <p className="text-ink-soft">اختر الجهاز واكتب الرمز من تطبيق المصادقة:</p>
          <div className="flex flex-col gap-2">
            {factors.map((f) => (
              <label key={f.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="factor"
                  checked={selected === f.id}
                  onChange={() => setSelected(f.id)}
                />
                <span className="text-ink">{f.friendlyName}</span>
              </label>
            ))}
          </div>
          <Input
            label="رمز التحقق"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            dir="ltr"
            maxLength={6}
            required
          />
          <div>
            <Button type="submit" variant="primary" disabled={busy || !selected}>
              {busy ? "…" : "تحقق ودخول"}
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-ink-soft">لا يوجد جهاز مسجل — سجّل جهازًا جديدًا من الأعلى.</p>
      )}
      {error && (
        <p role="alert" className="font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}
