import { dispatchPendingEvents } from "@/server/outbox";
import { rateLimit } from "@/server/ratelimit";
import { getEnv } from "@/lib/env";

/*
 * عامل صندوق الصادر — POST فقط بمفتاح OUTBOX_WORKER_KEY.
 * يُستدعى من جدولة n8n الخارجية (كل دقيقة) — مفيش cron داخل التطبيق.
 */
export async function POST(req: Request) {
  const key = getEnv("OUTBOX_WORKER_KEY");
  if (!key) return Response.json({ error: "العامل غير مضبوط" }, { status: 503 });
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${key}`) return Response.json({ error: "مرفوض" }, { status: 401 });
  if (!rateLimit("outbox-worker", 30, 60_000)) {
    return Response.json({ error: "معدل مرتفع" }, { status: 429 });
  }
  try {
    const result = await dispatchPendingEvents(20);
    return Response.json({ ok: true, ...result });
  } catch {
    return Response.json({ error: "فشل التنفيذ" }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ error: "غير مسموح" }, { status: 405 });
}
