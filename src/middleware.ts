import { NextResponse } from "next/server";

/*
 * بوابة /styleguide: محجوبة في الإنتاج بكود 404 حقيقي ما لم يُضبط ALLOW_STYLEGUIDE=1.
 * (الصفحة نفسها فيها بوابة ثانية كدفاع متعدد الطبقات.)
 */
export function middleware() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_STYLEGUIDE !== "1") {
    return new Response("Not Found", { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/styleguide/:path*"],
};
