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

export function stagePillClass(stage: string) {
  switch (stage) {
    case "Live":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "Signed":
    case "Assigned to PM/Work Session Scheduled":
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
    case "SOW & Quote Sent":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    default:
      return "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200";
  }
}
