import { LegalDocument, legalPageMetadata } from "@/components/LegalDocument";

export async function generateMetadata() {
  return legalPageMetadata("kullanim");
}

export default function KullanimKosullariPage() {
  return <LegalDocument pageKey="kullanim" />;
}
