import { MessageCircle } from "lucide-react";
import { WHATSAPP_URL } from "@/lib/contact";

export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with PeterParts on WhatsApp"
      className="fixed right-4 bottom-4 z-60 inline-flex h-14 items-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(37,211,102,0.9)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#20ba5a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/35 sm:right-6 sm:bottom-6"
    >
      <MessageCircle className="h-5 w-5" aria-hidden="true" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}