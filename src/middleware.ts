import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/*
 * 1) بوابة /styleguide: 404 حقيقي في الإنتاج ما لم يُضبط ALLOW_STYLEGUIDE=1.
 * 2) حماية /admin: تحديث الجلسة + تحويل غير المسجلين لصفحة الدخول.
 *    (فحص الدور وMFA والخمول يتم على السيرفر في layout الإدارة.)
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/styleguide")) {
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_STYLEGUIDE !== "1") {
      return new Response("Not Found", { status: 404 });
    }
    return NextResponse.next();
  }

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    if (!url || !anon) throw new Error("supabase غير مضبوط");
    const res = NextResponse.next({ request: req });
    const supa = createServerClient(url, anon, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    });
    const {
      data: { user },
    } = await supa.auth.getUser();
    if (!user && pathname !== "/admin/login") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return res;
  } catch {
    if (pathname === "/admin/login") return NextResponse.next();
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}

export const config = {
  matcher: ["/styleguide/:path*", "/admin/:path*"],
};
