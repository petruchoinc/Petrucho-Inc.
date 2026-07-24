import { useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function AmbientAudio() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef(null);

  const toggle = () => {
    if (!on) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        const ctx = new AC();
        const o1 = ctx.createOscillator();
        o1.type = 'sawtooth';
        o1.frequency.value = 55;
        const o2 = ctx.createOscillator();
        o2.type = 'sine';
        o2.frequency.value = 58.7;
        const o3 = ctx.createOscillator();
        o3.type = 'triangle';
        o3.frequency.value = 27.5;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 180;
        const gain = ctx.createGain();
        gain.gain.value = 0;
        gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 1.5);
        o1.connect(filter);
        o2.connect(filter);
        o3.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        o1.start();
        o2.start();
        o3.start();
        ctxRef.current = { ctx, nodes: [o1, o2, o3] };
        setOn(true);
      } catch {
        setOn(false);
      }
    } else {
      const ref = ctxRef.current;
      if (ref) {
        try {
          ref.nodes.forEach((n) => n.stop());
          ref.ctx.close();
        } catch {
          /* noop */
        }
        ctxRef.current = null;
      }
      setOn(false);
    }
  };

  return (
    <button
      onClick={toggle}
      className="pi-glass pi-stamp fixed bottom-5 left-5 z-[75] flex items-center gap-2 px-3 py-2 transition-transform hover:translate-x-0.5 hover:translate-y-0.5"
      aria-label={on ? 'Выключить эмбиент' : 'Включить эмбиент'}
    >
      {on ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      <span className="pi-mono-label">{on ? 'sound on' : 'ambient'}</span>
    </button>
  );
}