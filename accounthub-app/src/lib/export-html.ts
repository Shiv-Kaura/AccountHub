import type { Quote, Sow } from "@/lib/types";

function esc(s: unknown): string {
  return (s == null ? "" : String(s)).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return "";
  const parts = d.split("-");
  if (parts.length !== 3) return d;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(parts[1], 10) - 1]} ${parseInt(parts[2], 10)}`;
}

const PRINT_SCRIPT = `document.getElementById("print-open-btn").addEventListener("click", function(){ document.getElementById("print-gate").style.display="flex"; }); document.getElementById("print-gate-go").addEventListener("click", function(){ document.getElementById("print-gate").style.display="none"; window.print(); });`;

/**
 * Ported from the original AccountHub artifact's buildSowHtml() so exported SOWs keep the same
 * Synthesis Health branded, print-to-PDF format.
 */
export function buildSowHtml(s: Sow): string {
  const details = (s.work_details || []).filter((d) => d.trim());
  const detailsLi = details.map((d) => `<li>${esc(d)}</li>`).join("") || "<li>—</li>";
  const summaryParas =
    (s.work_summary || "")
      .split(/\n{2,}/)
      .filter((p) => p.trim())
      .map((p) => `<p>${esc(p)}</p>`)
      .join("") || "<p>—</p>";
  const dateStr = s.sow_date ? `${fmtDate(s.sow_date)}, ${s.sow_date.slice(0, 4)}` : "";
  const contactName = (s as unknown as { contact_name?: string }).contact_name || "";
  const contactEmailPhone = (s as unknown as { contact_email_phone?: string }).contact_email_phone || "";

  return (
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(s.project_title || "Statement of Work")}</title>` +
    "<style>" +
    "@page{ margin:0.85in 0.75in 0.9in; }" +
    "*{box-sizing:border-box;}" +
    'body{font-family:Georgia, "Times New Roman", serif; color:#231832; font-size:13px; line-height:1.55; margin:0;}' +
    "h1.doctitle{font-family:Georgia,serif; font-size:22px; color:#3d1f6e; margin:0 0 4px;}" +
    ".sub{color:#6b4fa0; font-size:12.5px; margin-bottom:22px;}" +
    ".meta-table{width:100%; border-collapse:collapse; margin-bottom:24px;}" +
    ".meta-table td{padding:4px 0; vertical-align:top; font-size:13px;}" +
    ".meta-table td.k{font-weight:700; width:130px; color:#3d1f6e;}" +
    "h2.sect{font-family:Georgia,serif; font-size:15px; color:#3d1f6e; border-bottom:2px solid #8a5cd6; padding-bottom:4px; margin:26px 0 10px;}" +
    ".wd-list{margin:0; padding-left:22px;}" +
    ".wd-list li{margin-bottom:8px;}" +
    ".diagram-note{font-style:italic; color:#6b4fa0; border:1px dashed #b79fe0; border-radius:6px; padding:10px 14px; margin-top:8px; font-size:12.5px;}" +
    ".sig-grid{display:grid; grid-template-columns:1fr 1fr; gap:40px; margin-top:36px;}" +
    ".sig-block .party{font-weight:700; color:#3d1f6e; margin-bottom:18px;}" +
    ".sig-line{border-top:1px solid #231832; padding-top:4px; margin-top:34px; font-size:12px; color:#4a3a63;}" +
    ".footer{position:fixed; bottom:0; left:0; right:0; font-size:9px; color:#8a7aa3; border-top:1px solid #d8cdea; padding-top:6px; text-align:center; white-space:nowrap;}" +
    ".notice{font-size:11px; color:#6b4fa0; background:#f4effa; border:1px solid #d8cdea; border-radius:6px; padding:8px 12px; margin-bottom:18px;}" +
    "@media print{ .no-print{display:none !important;} }" +
    "</style></head><body>" +
    '<div class="no-print" style="position:fixed;top:14px;right:14px;">' +
    '<button id="print-open-btn" style="font-family:sans-serif;font-size:12px;padding:7px 14px;background:#5b3a99;color:#fff;border:none;border-radius:6px;cursor:pointer;">Print / Save as PDF</button>' +
    "</div>" +
    '<div id="print-gate" class="no-print" style="display:none;position:fixed;inset:0;background:rgba(35,24,50,0.55);align-items:center;justify-content:center;z-index:999;font-family:sans-serif;">' +
    '<div style="background:#fff;border-radius:10px;padding:22px 24px;max-width:360px;box-shadow:0 10px 40px rgba(0,0,0,0.25);">' +
    '<div style="font-weight:700;font-size:15px;margin-bottom:10px;color:#231832;">Before you print</div>' +
    '<div style="font-size:13px;line-height:1.6;color:#3d1f6e;margin-bottom:16px;">In the print dialog, click <b>More settings</b> and turn <b>off</b> "Headers and footers" — this removes the browser\'s own file path/date/URL line, which would otherwise print above and below this document.</div>' +
    '<button id="print-gate-go" style="width:100%;padding:10px;background:#5b3a99;color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">Continue to print</button>' +
    "</div></div>" +
    '<h1 class="doctitle">Statement of Work</h1>' +
    `<div class="sub">${esc(s.project_title || "")}</div>` +
    '<table class="meta-table">' +
    `<tr><td class="k">Customer</td><td>${esc(s.customer || "")}</td></tr>` +
    (s.address ? `<tr><td class="k">Address</td><td>${esc(s.address)}</td></tr>` : "") +
    (contactName
      ? `<tr><td class="k">Contact</td><td>${esc(contactName)}${contactEmailPhone ? ` — ${esc(contactEmailPhone)}` : ""}</td></tr>`
      : "") +
    `<tr><td class="k">Date</td><td>${esc(dateStr)}</td></tr>` +
    "</table>" +
    '<h2 class="sect">Work Summary</h2>' +
    summaryParas +
    '<h2 class="sect">Work Details</h2>' +
    `<ol class="wd-list">${detailsLi}</ol>` +
    (s.solutions_diagram
      ? '<h2 class="sect">Solutions Diagram</h2><div class="diagram-note">Solutions Diagram Attached</div>'
      : "") +
    '<h2 class="sect">Signatures</h2>' +
    '<div class="sig-grid">' +
    '<div class="sig-block"><div class="party">Synthesis Health</div><div class="sig-line">Signed:</div><div class="sig-line">Date:</div></div>' +
    `<div class="sig-block"><div class="party">${esc(s.customer || "Customer")}</div><div class="sig-line">Signed:</div><div class="sig-line">Date:</div></div>` +
    "</div>" +
    `<div class="footer">Confidential — do not distribute without authorization from Synthesis Health. &nbsp;&middot;&nbsp; &copy; ${new Date().getFullYear()} Synthesis Health. All rights reserved.</div>` +
    `<script>${PRINT_SCRIPT}<\/script>` +
    "</body></html>"
  );
}

/**
 * Ported from the original AccountHub artifact's buildQuoteHtml() — the black-and-white legal
 * "Add-On Order" exhibit format, distinct from the SOW's purple/serif branded document.
 */
export function buildQuoteHtml(q: Quote): string {
  const customerUpper = (q.customer || "[CUSTOMER NAME]").toUpperCase();
  const items = [
    "Weekly meetings (or more frequently as needed), architectural diagrams, documentation.",
    ...(q.implementation_items || []).filter((i) => i.trim()),
  ];
  const itemsLi = items.map((i) => `<li>${esc(i)}</li>`).join("");
  const poRows = q.po_rows?.length ? q.po_rows : [{ qty: "1", item: "", price: "", dueDate: "Order execution" }];
  const poRowsTr = poRows
    .map(
      (r) =>
        `<tr><td>${esc(r.qty || "")}</td><td>${esc(r.item || "")}</td><td>${esc(r.price || "")}</td><td>${esc(r.dueDate || "")}</td></tr>`
    )
    .join("");
  const dateStr = q.quote_date ? `${fmtDate(q.quote_date)}, ${q.quote_date.slice(0, 4)}` : "";

  return (
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(q.name || q.customer || "Add-On Order")}</title>` +
    "<style>" +
    "@page{ margin:0.85in 0.75in; }" +
    "*{box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact; color-adjust:exact;}" +
    "body{font-family:Calibri,Arial,sans-serif; color:#000; font-size:11pt; line-height:1.45; margin:0;}" +
    "h1{font-size:14pt; font-weight:700; margin:0 0 16px;}" +
    "p{margin:0 0 14px;}" +
    ".u{text-decoration:underline; font-weight:700;}" +
    "table{width:100%; border-collapse:collapse; margin:0 0 18px;}" +
    "td,th{border:1px solid #000; padding:6px 9px; vertical-align:top; font-size:10.5pt; text-align:left;}" +
    "th{background:#D9D9D9; font-weight:700;}" +
    "ul{margin:0 0 16px; padding-left:22px;}" +
    "li{margin-bottom:6px;}" +
    ".date-line{font-size:10pt;color:#555;margin-bottom:18px;}" +
    ".sig-page{page-break-before:always; break-before:page; padding-top:0.3in;}" +
    ".sig-block{margin-top:26px; page-break-inside:avoid; break-inside:avoid;}" +
    ".sig-block b{display:block; margin-bottom:14px;}" +
    ".sig-line{margin:16px 0; font-size:11pt;}" +
    "@media print{ .no-print{display:none !important;} }" +
    "</style></head><body>" +
    '<div class="no-print" style="position:fixed;top:14px;right:14px;">' +
    '<button id="print-open-btn" style="font-family:sans-serif;font-size:12px;padding:7px 14px;background:#5b3a99;color:#fff;border:none;border-radius:6px;cursor:pointer;">Print / Save as PDF</button>' +
    "</div>" +
    '<div id="print-gate" class="no-print" style="display:none;position:fixed;inset:0;background:rgba(35,24,50,0.55);align-items:center;justify-content:center;z-index:999;font-family:sans-serif;">' +
    '<div style="background:#fff;border-radius:10px;padding:22px 24px;max-width:380px;box-shadow:0 10px 40px rgba(0,0,0,0.25);">' +
    '<div style="font-weight:700;font-size:15px;margin-bottom:10px;color:#231832;">Before you print</div>' +
    '<div style="font-size:13px;line-height:1.6;color:#3d1f6e;margin-bottom:16px;">In the print dialog, click <b>More settings</b> and:<br>&bull; turn <b>off</b> "Headers and footers" (removes the browser\'s own file path/date line)<br>&bull; turn <b>on</b> "Background graphics" (keeps the table shading below)</div>' +
    '<button id="print-gate-go" style="width:100%;padding:10px;background:#5b3a99;color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">Continue to print</button>' +
    "</div></div>" +
    `<h1>EXHIBIT ${esc(q.exhibit_label || "A-1")}: Synthesis Intelligent Imaging Application and Service Order</h1>` +
    (dateStr ? `<div class="date-line">${esc(dateStr)}</div>` : "") +
    `<p>This Exhibit ${esc(q.exhibit_label || "A-1")} (“<span class="u" style="text-decoration:underline;">Additional Order</span>”) is an additional Order under the Master Services Agreement by and between Synthesis Health Partners, Inc. (“<span style="text-decoration:underline;">Synthesis</span>”) and ${esc(customerUpper)} (“<span style="text-decoration:underline;">Customer</span>”) (the “<span style="text-decoration:underline;">Agreement</span>”) for additional products and/or services to be provided to Customer and/or at Customer's locations that are to have access to the Application and Services, in exchange for payment of the Fees below. This Additional Order is subject to the terms and conditions of the Agreement and is hereby incorporated into and made a part of the Agreement.</p>` +
    '<table><tr><th></th><th>Contact Name</th><th>Email and Phone</th></tr>' +
    `<tr><td><b>Synthesis Health</b></td><td>${esc(q.synthesis_contact || "")}</td><td>${esc(q.synthesis_email_phone || "")}</td></tr>` +
    `<tr><td><b>${esc(customerUpper)}</b></td><td>${esc(q.customer_contact || "")}</td><td>${esc(q.customer_email_phone || "")}</td></tr>` +
    "</table>" +
    '<p style="text-decoration:underline; font-weight:700; margin-bottom:8px;">Implementation Statement of Work</p>' +
    `<ul>${itemsLi}</ul>` +
    '<p style="text-decoration:underline; font-weight:700; margin-bottom:4px;">Billing Terms</p>' +
    '<p style="font-weight:700;">PAYMENT DUE UPON SIGNED ORDER</p>' +
    '<p style="text-decoration:underline; font-weight:700; margin-bottom:8px;">Purchase Order</p>' +
    `<table><tr><th>Quantity</th><th>Item</th><th>Price</th><th>Due Date</th></tr>${poRowsTr}</table>` +
    '<div class="sig-page">' +
    '<div class="sig-block"><b>SYNTHESIS HEALTH INC.</b>' +
    '<div class="sig-line">By: _______________________________</div>' +
    '<div class="sig-line">Print Name: _______________________________</div>' +
    '<div class="sig-line">Title: _______________________________</div>' +
    '<div class="sig-line">Date: _______________________________</div></div>' +
    `<div class="sig-block"><b>${esc(customerUpper)}</b>` +
    '<div class="sig-line">By: _______________________________</div>' +
    '<div class="sig-line">Print Name: _______________________________</div>' +
    '<div class="sig-line">Title: _______________________________</div>' +
    '<div class="sig-line">Date: _______________________________</div></div>' +
    "</div>" +
    `<script>${PRINT_SCRIPT}<\/script>` +
    "</body></html>"
  );
}
