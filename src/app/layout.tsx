import type { Metadata } from "next";
import { Amiri, Aref_Ruqaa, IBM_Plex_Sans_Arabic, Reem_Kufi } from "next/font/google";
import { CartProvider } from "@/components/CartProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import "./globals.css";

// خط العناوين الفائز بالمقارنة (docs/DESIGN.md): Aref Ruqaa — روح كتابية تناسب اللوجو.
const display = Aref_Ruqaa({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-display",
});

// خط النص المقروء.
const body = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
});

// خطوط المقارنة — تُستخدم في /styleguide فقط.
const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
});
const ruqaa = Aref_Ruqaa({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-ruqaa",
});
const kufi = Reem_Kufi({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-kufi",
});

export const metadata: Metadata = {
  // يُضبط على دومين Railway بعد النشر (Variables) لتعمل صور المشاركة بشكل صحيح.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "الطيب للكتب | كتب قيّمة لحد باب بيتك",
  description: "متجر الطيب للكتب — كتب دينية وكتب تزكية النفس، توصيل لباب البيت في كل محافظات مصر.",
  // TODO(copy): راجع الوصف بعد كتابة المحتوى النهائي في المرحلة 1.
  openGraph: {
    title: "الطيب للكتب",
    description: "كتب قيّمة لحد باب بيتك",
    locale: "ar_EG",
    type: "website",
    images: [{ url: "/brand/og.svg", width: 1200, height: 630 }],
  },
  icons: {
    icon: "/brand/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${display.variable} ${body.variable} ${amiri.variable} ${ruqaa.variable} ${kufi.variable}`}
    >
      <body className="font-body min-h-screen bg-paper text-ink antialiased">
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <WhatsAppFloat />
        </CartProvider>
      </body>
    </html>
  );
}
