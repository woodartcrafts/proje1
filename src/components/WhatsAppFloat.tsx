import { buildWhatsAppChatUrl } from "@/lib/whatsapp";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="26" height="26">
      <path
        fill="currentColor"
        d="M12 3a8.5 8.5 0 0 0-7.4 12.7L3.5 20.5l4.9-1.3A8.5 8.5 0 1 0 12 3zm4.8 12a6.2 6.2 0 0 1-6.7 1.4l-.5-.2-2.9.8.8-2.8-.2-.5a6.2 6.2 0 1 1 9.5 1.3zm-2.1-3.4c-.1-.2-.5-.3-1-.6s-.6-.2-.8.1l-.5.6c-.2.2-.3.2-.6.1a5 5 0 0 1-1.5-.9 5.5 5.5 0 0 1-1-1.3c-.1-.3 0-.4.1-.6l.4-.5c.1-.2.2-.3.2-.5s0-.4-.1-.5l-.6-1.4c-.2-.4-.3-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.1 5 5 0 0 0 1.1 2.6 11.5 11.5 0 0 0 4.4 3.7c.5.2 1 .4 1.4.5a3.3 3.3 0 0 0 1.5.1 2.5 2.5 0 0 0 1.6-1.1 2 2 0 0 0 .1-1.1c-.1 0-.2-.1-.4-.2z"
      />
    </svg>
  );
}

/** Sağ alt sabit WhatsApp düğmesi (numara Admin’den). */
export function WhatsAppFloat({
  href,
  message = "",
  enabled = true,
}: {
  href: string;
  message?: string;
  enabled?: boolean;
}) {
  if (!enabled) return null;
  const chatUrl = buildWhatsAppChatUrl(href, message);
  if (!chatUrl) return null;

  return (
    <a
      href={chatUrl}
      className="wa-float"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp ile yazın"
      title="WhatsApp ile yazın"
    >
      <WhatsAppIcon />
      <span className="wa-float-label">WhatsApp</span>
    </a>
  );
}
