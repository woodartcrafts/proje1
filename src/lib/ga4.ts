/** GA4 Measurement ID: G-XXXXXXXX */
const GA4_ID_RE = /^G-[A-Z0-9]+$/;

export function normalizeGa4MeasurementId(raw: string | null | undefined): string {
  const value = (raw ?? "").trim().toUpperCase();
  if (!value) return "";
  return GA4_ID_RE.test(value) ? value : "";
}

export function isValidGa4MeasurementId(raw: string): boolean {
  const value = raw.trim();
  return value === "" || GA4_ID_RE.test(value.toUpperCase());
}
