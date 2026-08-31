export const STAGES = [
  "Discovery",
  "SOW & Quote Sent",
  "Signed",
  "Assigned to PM/Work Session Scheduled",
  "Live",
] as const;
export type Stage = (typeof STAGES)[number];

export const CONTACT_ROLE_TAGS = ["Admin", "IT", "Rad champion", "Account holder"] as const;

export type Health = "green" | "yellow" | "red";
export type Segment = "managed" | "prospect";

export type Account = {
  id: string;
  name: string;
  segment: Segment;
  health: Health;
  contact: string;
  owner_id: string | null;
  owner_name: string;
  stage: Stage;
  lost: boolean;
  stage_changed_at: string;
  created_at: string;
  updated_at: string;
  portal_token: string;
};

export type PortalFileDirection = "shared_with_customer" | "uploaded_by_customer";

export type PortalFile = {
  id: string;
  account_id: string;
  direction: PortalFileDirection;
  file_name: string;
  file_size: number | null;
  storage_path: string;
  note: string;
  uploaded_at: string;
};

export type Site = {
  id: string;
  account_id: string;
  name: string;
  location: string;
  stage: Stage;
  target_date: string | null;
  owner: string;
  notes: string;
  lost: boolean;
  stage_changed_at: string;
};

export type Contact = {
  id: string;
  account_id: string;
  name: string;
  role: string;
  role_tags: string[];
  email: string;
  phone: string;
};

export type AccountNote = {
  id: string;
  account_id: string;
  note_date: string;
  body: string;
};

export type Doc = {
  id: string;
  account_id: string;
  kind: "quote" | "sow";
  title: string;
  facility_site_id: string | null;
  notes: string;
  file_name: string | null;
  file_size: number | null;
  storage_path: string | null;
  uploaded_at: string;
  updated_at: string;
};

export type Quote = {
  id: string;
  account_id: string | null;
  exhibit_label: string;
  name: string;
  customer: string;
  status: string;
  quote_date: string;
  stage: Stage;
  synthesis_contact: string;
  synthesis_email_phone: string;
  customer_contact: string;
  customer_email_phone: string;
  implementation_items: string[];
  rate_sel: Record<string, { checked: boolean; qty: number }>;
  po_rows: { qty: string; item: string; price: string; dueDate: string; source: string }[];
  lost: boolean;
  track_pipeline: boolean;
  stage_changed_at: string;
};

export type Sow = {
  id: string;
  account_id: string | null;
  customer: string;
  address: string;
  project_title: string;
  sow_date: string;
  status: string;
  stage: Stage;
  work_summary: string;
  work_details: string[];
  solutions_diagram: boolean;
  meeting_notes: string;
  contact_name: string;
  contact_email_phone: string;
  lost: boolean;
  track_pipeline: boolean;
  stage_changed_at: string;
};

export type SowDraft = {
  projectTitle: string;
  workSummary: string;
  workDetails: string[];
};

export const ITEM_STATUSES = ["open", "in_progress", "resolved"] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export const ITEM_STATUS_LABEL: Record<ItemStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
};

export type Item = {
  id: string;
  account_id: string;
  title: string;
  status: ItemStatus;
  priority: boolean;
  owner: string;
  due_date: string | null;
  zendesk: string;
  created_at: string;
  updated_at: string;
};
