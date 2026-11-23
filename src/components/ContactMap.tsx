/** İletişim sayfasındaki Google Haritalar yerleştirme (src önceden doğrulanmış olmalı). */
export function ContactMap({ embedSrc }: { embedSrc: string }) {
  if (!embedSrc) return null;

  return (
    <div className="contact-map">
      <iframe
        title="Ofis konumu — Google Haritalar"
        src={embedSrc}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
