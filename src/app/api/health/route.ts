import { notFound } from "next/navigation";

export async function GET() {
  return Response.json({ ok: true });
}

// حماية زائدة: الصفحة تُستخدم للفحص فقط ولا تعرض أي بيانات.
export async function POST() {
  return notFound();
}
