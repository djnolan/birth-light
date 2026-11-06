import { useEffect, useRef } from 'react';
import { easeInOutCubic, panProgress } from '../lib/lookUpTimeline';

// Faint slate-blue bands behind the content, for depth. Each band fills
// everything below a gently curved horizon, so where they overlap toward
// the bottom of the screen it gets a little lighter. Up at the stars there
// are no bands, so the sky stays the plain background colour.
//
// Horizon heights are fractions of the art frame (the eye's frame), from
// the top, for each screen. 'out' = slid off the bottom (pan up / reveal).
const BANDS = [
  { opacity: 0.035, home: 0.21, message: -0.04, panMult: 1.1 },
  { opacity: 0.035, home: 0.34, message: 0.1, panMult: 1.0 },
  { opacity: 0.045, home: 0.71, message: 0.68, panMult: 1.0 },
];
const CURVE = 0.035;  // how far the horizon dips at the screen edges (× frame height)
const MOVE_MS = 1100; // moving between home and message, or sliding back in

// hr = screen height ÷ frame height. 'out' is where the pan leaves them:
// pushed down a full screen (plus the curve), so they're off the bottom.
function horizonsFor(mode, hr) {
  return BANDS.map(b => (mode === 'out' ? b.message + b.panMult * hr * (1 + CURVE * 2) : b[mode]));
}

/**
 * mode: 'home' | 'message' | 'out'
 * panStartAt: while set, the bands ride the camera pan off the bottom.
 */
export default function BackgroundBands({ mode, panStartAt, frameRef }) {
  const pathRefs = useRef([]);
  const live = useRef({ mode, panStartAt, cur: null, tween: null });

  useEffect(() => {
    const l = live.current;
    if (l.mode !== mode && l.cur) {
      l.tween = { from: l.cur.slice(), to: mode, start: performance.now() };
    }
    l.mode = mode;
  }, [mode]);

  useEffect(() => {
    live.current.panStartAt = panStartAt;
  }, [panStartAt]);

  useEffect(() => {
    const l = live.current;
    let id;

    function frame(now) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const rect = frameRef.current?.getBoundingClientRect();
      const frameH = rect?.height || h;
      const frameTop = rect?.top ?? 0;
      const hr = h / frameH;

      // Horizon positions, as fractions of the frame height
      let ys;
      if (l.panStartAt != null) {
        // Camera pans up: bands drop away with the ground, like the eye
        const e = panProgress(now, l.panStartAt);
        ys = BANDS.map(b => b.message + e * b.panMult * hr * (1 + CURVE * 2));
      } else if (l.tween) {
        const t = Math.min(1, (now - l.tween.start) / MOVE_MS);
        const to = horizonsFor(l.tween.to, hr);
        const k = easeInOutCubic(t);
        ys = l.tween.from.map((v, i) => v + (to[i] - v) * k);
        if (t >= 1) l.tween = null;
      } else {
        ys = horizonsFor(l.mode, hr);
      }
      l.cur = ys;

      ys.forEach((f, i) => {
        const el = pathRefs.current[i];
        if (!el) return;
        const y = frameTop + f * frameH;
        const dip = CURVE * frameH;
        el.setAttribute(
          'd',
          `M${-0.1 * w},${y + dip} Q${w / 2},${y - dip} ${1.1 * w},${y + dip} V${h + 10} H${-0.1 * w}Z`
        );
      });

      id = requestAnimationFrame(frame);
    }

    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [frameRef]);

  return (
    <svg className="bg-bands" aria-hidden="true">
      {BANDS.map((b, i) => (
        <path
          key={i}
          ref={el => { pathRefs.current[i] = el; }}
          fill="var(--muted)"
          fillOpacity={b.opacity}
        />
      ))}
    </svg>
  );
}

