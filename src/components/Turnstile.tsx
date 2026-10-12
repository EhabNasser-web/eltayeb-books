"use client";

import { useEffect, useId, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

/** ودجت Cloudflare Turnstile — يسلّم الرمز للأب عبر onToken. */
export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const boxId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const tokenRef = useRef(onToken);
  tokenRef.current = onToken;

  useEffect(() => {
    if (!siteKey || !boxRef.current) return;
    let cancelled = false;
    const render = () => {
      if (cancelled || !boxRef.current || !window.turnstile) return;
      window.turnstile.render(boxRef.current, {
        sitekey: siteKey,
        callback: (t: string) => tokenRef.current(t),
        "expired-callback": () => tokenRef.current(""),
        "error-callback": () => tokenRef.current(""),
      });
    };
    if (window.turnstile) render();
    else {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      s.async = true;
      s.onload = render;
      document.head.appendChild(s);
    }
    return () => {
      cancelled = true;
    };
  }, [siteKey, boxId]);

  if (!siteKey) {
    return (
      <p className="text-base text-error" role="alert">
        {process.env.NODE_ENV === "production"
          ? "خدمة الحماية غير مفعّلة حاليًا — جرّب لاحقًا."
          : "اضبط NEXT_PUBLIC_TURNSTILE_SITE_KEY لعرض ودجت الحماية."}
      </p>
    );
  }
  return <div ref={boxRef} id={boxId} />;
}
