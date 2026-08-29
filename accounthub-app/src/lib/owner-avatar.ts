// Deterministic color-per-owner for the pipeline's avatar chips, so two reps'
// cards read apart on a shared board at a glance. Only two gradient families
// right now (the palette Shiv picked has five colors, but raspberry-red is
// reserved solely for the Lost/danger state so it never loses that meaning —
// it's deliberately excluded here even though it would make a nice-looking
// gradient). Add more owners than gradients and they'll just repeat, which is
// fine — the point is reps sharing a board can tell each other apart, not
// that every possible owner gets a unique hue forever.

export type OwnerGradient = { from: string; to: string };

const GRADIENTS: OwnerGradient[] = [
  { from: "#0496ff", to: "#006ba6" }, // dodger-blue -> cornflower-ocean
  { from: "#b0447a", to: "#8f2d56" }, // lighter -> vintage-berry (no raspberry — that stays Lost-only)
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function ownerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ownerGradient(name: string): OwnerGradient {
  if (!name.trim()) return GRADIENTS[0];
  return GRADIENTS[hashString(name) % GRADIENTS.length];
}
