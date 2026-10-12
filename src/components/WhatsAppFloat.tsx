import { SITE } from "@/lib/site";
import { getSetting } from "@/server/settings";

/** زر واتساب عائم — الرقم من الإعدادات مع fallback ثابت. */
export async function WhatsAppFloat() {
  const number = (await getSetting("whatsapp_number", "")).trim() || SITE.whatsappDisplay;
  const digits = number.replace(/\D/g, "").replace(/^(0020|20)/, "20");
  const href = digits.startsWith("20") ? `https://wa.me/${digits}` : SITE.whatsappHref;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل واتساب"
      className="fixed bottom-5 end-5 z-20 flex items-center justify-center rounded-full bg-primary text-paper shadow-[0_10px_25px_-10px_rgba(34,48,42,0.6)] transition-[background-color,transform] duration-200 hover:bg-primary-dark active:scale-95"
      style={{ height: 52, width: 52 }}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 2a8 8 0 1 1-4.1 14.9l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 0 1 12 4Zm-3.2 4c-.2 0-.5 0-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.9 3.1 4.8 4.1 2.4.9 2.9.7 3.4.7.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4l-.5-.2c-.2-.1-1.2-.6-1.4-.6l-.5-.1c-.2 0-.4.1-.5.3l-.7.9c-.1.2-.3.2-.5.1a7.6 7.6 0 0 1-2.2-1.4 8.3 8.3 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5L9.4 8.6c-.2-.4-.4-.6-.6-.6Z" />
      </svg>
    </a>
  );
}
