import { createServiceClient } from "./supabase";
import { getEnv } from "@/lib/env";

const MAX_ATTEMPTS = 10;

function backoffMinutes(attempts: number): number {
  return Math.min(2 ** attempts, 180);
}

/*
 * إرسال أحداث outbox المعلقة إلى n8n — يُستدعى من route محمي (جدولة n8n)
 * أو من زر الداشبورد. فشل الإرسال لا يؤثر على الطلبات المحفوظة.
 */
export async function dispatchPendingEvents(limit = 20): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  const base = getEnv("N8N_WEBHOOK_BASE_URL");
  const secret = getEnv("N8N_WEBHOOK_SECRET");
  const result = { processed: 0, sent: 0, failed: 0 };
  if (!base || !secret) return result;

  const db = createServiceClient();
  const { data: events } = await db
    .from("outbox_events")
    .select("id,event,payload,attempts,created_at")
    .eq("status", "pending")
    .lte("next_attempt_at", new Date().toISOString())
    .order("created_at", { ascending: true })
    .limit(limit);
  if (!events || events.length === 0) return result;

  for (const ev of events) {
    result.processed += 1;
    const attempts = (ev.attempts as number) + 1;
    try {
      const res = await fetch(`${base.replace(/\/$/, "")}/${ev.event}`, {
        method: "POST",
        headers: { "content-type": "application/json", "X-Webhook-Secret": secret },
        body: JSON.stringify({
          event: ev.event,
          occurred_at: ev.created_at,
          data: ev.payload,
        }),
      });
      if (!res.ok) throw new Error(`n8n رد ${res.status}`);
      await db.from("outbox_events").update({ status: "sent", attempts }).eq("id", ev.id);
      result.sent += 1;
    } catch (err) {
      const failed = attempts >= MAX_ATTEMPTS;
      await db
        .from("outbox_events")
        .update({
          status: failed ? "failed" : "pending",
          attempts,
          last_error: err instanceof Error ? err.message.slice(0, 500) : "خطأ مجهول",
          next_attempt_at: new Date(Date.now() + backoffMinutes(attempts) * 60_000).toISOString(),
        })
        .eq("id", ev.id);
      if (failed) result.failed += 1;
    }
  }
  return result;
}
