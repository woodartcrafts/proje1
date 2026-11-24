import { LegalDocument, legalPageMetadata } from "@/components/LegalDocument";

export async function generateMetadata() {
  return legalPageMetadata("gizlilik");
}

export default function GizlilikPage() {
  return <LegalDocument pageKey="gizlilik" />;
}
