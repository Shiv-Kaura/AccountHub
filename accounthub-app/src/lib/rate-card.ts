export type RateItem = {
  key: string;
  label: string;
  price: number | null; // null = "TBD, negotiated"
  unit: string;
  recurring: boolean;
  needsQty: boolean;
  qtyLabel?: string;
};

// Mirrors the rate card from the original artifact's Quote Generator, so quotes built here price
// out identically to ones built there.
export const RATE_CARD: RateItem[] = [
  { key: "dicom_sr_5", label: "DICOM Structured Reporting — 5 Modalities", price: 3500, unit: "flat", recurring: false, needsQty: false },
  { key: "dicom_sr_10", label: "DICOM Structured Reporting — 10 Modalities", price: 7000, unit: "flat", recurring: false, needsQty: false },
  { key: "dicom_sr_15", label: "DICOM Structured Reporting — 15 Modalities", price: 10500, unit: "flat", recurring: false, needsQty: false },
  { key: "dicom_sr_extra", label: "DICOM Structured Reporting — Additional Modality (after 15)", price: 500, unit: "/modality", recurring: false, needsQty: true, qtyLabel: "Modalities" },
  { key: "adt_interface", label: "ADT Interface", price: 250, unit: "/month", recurring: true, needsQty: false },
  { key: "hl7_dicom_interface", label: "Additional HL7 or DICOM Interface (incl. gateway)", price: 500, unit: "/month", recurring: true, needsQty: false },
  { key: "dicom_gateway_config", label: "DICOM Gateway Configuration, Installation & Third-Party Security Review", price: 250, unit: "/hour", recurring: false, needsQty: true, qtyLabel: "Hours" },
  { key: "cloud_archive", label: "Synthesis Cloud Archive", price: 55, unit: "/TB/month", recurring: true, needsQty: true, qtyLabel: "TB" },
  { key: "advanced_tech", label: "Advanced Technical Services (upon mutual agreement)", price: null, unit: "tbd", recurring: false, needsQty: false },
  { key: "additional_ai", label: "Additional AI from Synthesis and/or Third-Party Vendors", price: null, unit: "tbd", recurring: false, needsQty: false },
  { key: "mrn_conversion", label: "MRN Conversion", price: 10000, unit: "flat", recurring: false, needsQty: false },
  { key: "pro_service_hours", label: "Professional Service Hours", price: 250, unit: "/hour", recurring: false, needsQty: true, qtyLabel: "Hours" },
];

export function formatPrice(price: number | null) {
  if (price == null) return "TBD";
  return `$${price.toLocaleString()}`;
}

export type PoRow = {
  qty: string;
  item: string;
  price: string;
  dueDate: string;
  source: string;
};

export function poRowFor(item: RateItem, qty: number): PoRow {
  return {
    qty: String(qty),
    item: item.label,
    price: item.price == null ? "TBD" : `$${(item.price * qty).toLocaleString()}`,
    dueDate: item.recurring ? "Monthly" : "Due on signing",
    source: `rate:${item.key}`,
  };
}
