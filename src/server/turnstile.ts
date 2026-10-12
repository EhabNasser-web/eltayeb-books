import { getEnv } from "@/lib/env";

/** التحقق من Turnstile على السيرفر. يفشل مغلقًا في الإنتاج لو المفاتيح غائبة. */
export async function verifyTurnstile(token: string | undefined, ip?: string): Promise<boolean> {
  const secret = getEnv("TURNSTILE_SECRET_KEY");
  if (!secret) {
    if (process.env.NODE_ENV === "production") return false;
    console.warn("TURNSTILE_SECRET_KEY غائب — التحقق متجاوَز في التطوير فقط.");
    return true;
  }
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
