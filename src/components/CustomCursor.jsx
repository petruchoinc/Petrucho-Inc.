import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    const move = (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          el.style.transform = `translate(${tx}px, ${ty}px)`;
          raf = 0;
        });
      }
    };
    window.addEventListener('mousemove', move);
    return () => {
      window.removeEventListener('mousemove', move);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="pi-cursor pointer-events-none fixed left-0 top-0 z-[80] hidden md:block"
      style={{ mixBlendMode: 'difference' }}
      aria-hidden="true"
    >
      <div className="pi-cursor-ring" />
    </div>
  );
}