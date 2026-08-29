export function healthDotClass(health: string) {
  switch (health) {
    case "green":
      return "bg-[#1fae7a]"; // meadow-green
    case "yellow":
      return "bg-[#ffbc42]"; // sunflower-gold
    case "red":
      return "bg-[#d81159]"; // raspberry-red
    default:
      return "bg-white/30";
  }
}

export function itemStatusPillClass(status: string) {
  switch (status) {
    case "resolved":
      // meadow-green (#1fae7a) — the live/success color from the approved design
      // system, not a stock Tailwind green, so it stays exact brand hex site-wide.
      return "bg-[#1fae7a]/[0.12] text-[#3fd39c] ring-1 ring-[#1fae7a]/[0.3]";
    case "in_progress":
      return "bg-[#0496ff]/[0.12] text-[#4fc3ff] ring-1 ring-[#0496ff]/25";
    default:
      return "bg-[#ffbc42]/[0.14] text-[#ffbc42] ring-1 ring-[#ffbc42]/25";
  }
}

export function isOverdue(due: string | null | undefined) {
  if (!due) return false;
  const today = new Date().toISOString().slice(0, 10);
  return due < today;
}

export function daysInStage(stageChangedAt: string): number {
  const changed = new Date(stageChangedAt).getTime();
  const ms = Date.now() - changed;
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export function daysInStageLabel(stageChangedAt: string): string {
  const days = daysInStage(stageChangedAt);
  if (days === 0) return "today";
  return days === 1 ? "1 day in stage" : `${days} days in stage`;
}

export function stagePillClass(stage: string) {
  switch (stage) {
    case "Live":
      // meadow-green (#1fae7a) — same live/success color as itemStatusPillClass
      return "bg-[#1fae7a]/[0.12] text-[#3fd39c] ring-1 ring-[#1fae7a]/[0.3]";
    case "Signed":
    case "Assigned to PM/Work Session Scheduled":
      return "bg-[#0496ff]/[0.12] text-[#4fc3ff] ring-1 ring-[#0496ff]/25";
    case "SOW & Quote Sent":
      return "bg-[#ffbc42]/[0.14] text-[#ffbc42] ring-1 ring-[#ffbc42]/25";
    default:
      return "bg-white/[0.06] text-[#aeb1b8] ring-1 ring-white/[0.08]";
  }
}

/**
 * True Elevation's slim left accent bar, one hex per stage — the exact
 * same mapping stagePillClass already uses, just rendered as a 3px bar
 * instead of a pill. Keeping ONE function as the source of truth for
 * "what color means what stage" is what keeps color from turning into
 * noise as it shows up in more places (cards, list rows, pills): a
 * color only ever means the one thing it's assigned here, app-wide.
 */
export function stageAccentHex(stage: string): string {
  switch (stage) {
    case "Live":
      return "#1fae7a"; // meadow-green — live/success
    case "Signed":
    case "Assigned to PM/Work Session Scheduled":
      return "#0496ff"; // dodger-blue — reserved for brand/primary/nav/Signed
    case "SOW & Quote Sent":
      return "#ffbc42"; // sunflower-gold — pending / awaiting a response
    default:
      return "#5b5d64"; // neutral — Prospect / no status yet
  }
}

/** Same idea as stageAccentHex, for the account health traffic-light. */
export function healthAccentHex(health: string): string {
  switch (health) {
    case "green":
      return "#1fae7a";
    case "yellow":
      return "#ffbc42";
    case "red":
      return "#d81159"; // raspberry-red — reserved for lost/danger
    default:
      return "#5b5d64";
  }
}

// Owner-avatar color (identity, not status) already lives in
// lib/owner-avatar.ts (ownerGradient/ownerInitials) — reuse that
// instead of a second color-per-owner scheme here.
