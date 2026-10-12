import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { MfaClient } from "@/components/MfaClient";
import { SectionHeading } from "@/components/SectionHeading";
import { createServiceClient, createSessionClient } from "@/server/supabase";

export const metadata: Metadata = {
  title: "المصادقة الثنائية | الطيب للكتب",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function MfaPage() {
  try {
    const supa = await createSessionClient();
    const {
      data: { user },
    } = await supa.auth.getUser();
    if (!user) redirect("/admin/login");

    const service = createServiceClient();
    const { data: profile } = await service
      .from("admin_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!profile) redirect("/admin/login?e=forbidden");

    const { data: assurance } = await supa.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assurance?.currentLevel === "aal2") redirect("/admin");

    const { data: factors } = await supa.auth.mfa.listFactors();

    return (
      <Container className="pb-20 pt-12">
        <div className="max-w-md">
          <SectionHeading
            title="المصادقة الثنائية"
            description="خطوة إجبارية قبل دخول الإدارة — لا يمكن تخطيها."
          />
          <div className="mt-6">
            <MfaClient
              factors={(factors?.totp ?? []).map((f) => ({
                id: f.id,
                friendlyName: f.friendly_name ?? "جهاز",
              }))}
            />
          </div>
        </div>
      </Container>
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) throw err;
    return (
      <Container className="pb-20 pt-12">
        <div className="max-w-md">
          <SectionHeading title="المصادقة الثنائية" />
          <p className="mt-4 text-ink-soft">
            تعذر تحميل الصفحة — سجّل الدخول من جديد من{" "}
            <a href="/admin/login" className="underline underline-offset-4">
              هنا
            </a>
            .
          </p>
        </div>
      </Container>
    );
  }
}
