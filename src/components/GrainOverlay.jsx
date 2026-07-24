export default function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60]"
      style={{ opacity: 'var(--pi-grain)', mixBlendMode: 'multiply', filter: 'hue-rotate(var(--pi-hue))' }}
      aria-hidden="true"
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="pi-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#pi-noise)" />
      </svg>
    </div>
  );
}