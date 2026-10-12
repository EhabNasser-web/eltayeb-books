import { SectionHeading } from "@/components/SectionHeading";
import { SettingsForm } from "@/components/SettingsForm";
import { listSettingsAdmin } from "@/server/admin-queries";

export default async function SettingsPage() {
  const settings = (await listSettingsAdmin()) as Array<{ key: string; value: string }>;
  return (
    <div>
      <SectionHeading
        title="الإعدادات"
        description="التواصل ورسوم الشحن وبيانات التحويل — تُطبق على الموقع فورًا."
      />
      <div className="mt-6">
        <SettingsForm initial={settings.map((s) => ({ key: s.key, value: s.value }))} />
      </div>
    </div>
  );
}
