/**
 * Site-wide ambient background: the grain texture + three discreet color
 * washes from the approved "G — Layered Glow, final pass" design mockups.
 * Rendered once in the app layout (fixed, behind everything) so every page
 * gets the exact same treatment automatically — no per-page glow markup to
 * keep in sync, and no risk of a wash landing behind a button again (blue
 * is always the same top-left anchor; gold/berry always sit low, clear of
 * any banner control).
 *
 * Purely decorative and purely cosmetic — pointer-events-none, no effect on
 * layout, interaction, or data.
 */
export function AmbientGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <svg className="absolute h-0 w-0">
        <filter id="app-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.4 0" />
        </filter>
      </svg>
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{ filter: "url(#app-grain)" }} />

      {/* blue — the one constant, anchors the brand corner on every page */}
      <div
        className="absolute -top-[200px] -left-[140px] h-[360px] w-[500px]"
        style={{ background: "radial-gradient(circle, rgba(4,150,255,0.13) 0%, rgba(4,150,255,0) 70%)" }}
      />
      {/* gold — pending/attention, kept low so it never sits near a banner control */}
      <div
        className="absolute -bottom-[180px] right-[120px] h-[380px] w-[460px]"
        style={{ background: "radial-gradient(circle, rgba(255,188,66,0.08) 0%, rgba(255,188,66,0) 70%)" }}
      />
      {/* berry — decorative accent, also kept low */}
      <div
        className="absolute -bottom-[160px] left-[340px] h-[340px] w-[440px]"
        style={{ background: "radial-gradient(circle, rgba(143,45,86,0.10) 0%, rgba(143,45,86,0) 70%)" }}
      />
    </div>
  );
}
