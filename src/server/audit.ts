import { createServiceClient } from "./supabase";

/** تسجيل تدقيق لكل تعديل في الداشبورد — الأخطاء هنا لا تُسقط العملية الأصلية. */
export async function audit(
  actor: string | null,
  action: string,
  entity: string,
  entityId = "",
  details: Record<string, unknown> = {}
): Promise<void> {
  try {
    const db = createServiceClient();
    await db.from("audit_log").insert({ actor, action, entity, entity_id: entityId, details });
  } catch {
    // يُسجَّل في لوح السيرفر فقط
    console.error("audit failed", { action, entity, entityId });
  }
}
