import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { LoginForm } from "@/components/LoginForm";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "دخول الإدارة | الطيب للكتب",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <Container className="pb-20 pt-12">
      <div className="max-w-md">
        <SectionHeading title="دخول الإدارة" description="للأدمن فقط — كل المحاولات مسجلة." />
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </Container>
  );
}
