export function healthDotClass(health: string) {
  switch (health) {
    case "green":
      return "bg-emerald-500";
    case "yellow":
      return "bg-amber-500";
    case "red":
      return "bg-red-500";
    default:
      return "bg-neutral-300";
  }
}

export function itemStatusPillClass(status: string) {
  switch (status) {
    case "resolved":
      return "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/25";
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
      return "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/25";
    case "Signed":
    case "Assigned to PM/Work Session Scheduled":
      return "bg-[#0496ff]/[0.12] text-[#4fc3ff] ring-1 ring-[#0496ff]/25";
    case "SOW & Quote Sent":
      return "bg-[#ffbc42]/[0.14] text-[#ffbc42] ring-1 ring-[#ffbc42]/25";
    default:
      return "bg-white/[0.06] text-[#aeb1b8] ring-1 ring-white/[0.08]";
  }
}
