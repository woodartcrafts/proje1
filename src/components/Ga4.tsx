import Script from "next/script";
import { normalizeGa4MeasurementId } from "@/lib/ga4";

/** ID doluysa GA4 gtag yükler. Raporlar analytics.google.com’da. */
export function Ga4({ measurementId }: { measurementId: string }) {
  const id = normalizeGa4MeasurementId(measurementId);
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-config" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  );
}
