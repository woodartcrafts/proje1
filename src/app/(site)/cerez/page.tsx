import { LegalDocument, legalPageMetadata } from "@/components/LegalDocument";

export async function generateMetadata() {
  return legalPageMetadata("cerez");
}

export default function CerezPage() {
  return <LegalDocument pageKey="cerez" />;
}
