import { useEffect, useRef } from 'react';
import { easeInOutCubic, panProgress } from '../lib/lookUpTimeline';

// Faint bands behind the content, for depth, like layered hills. Each band
// sits below a gently curved horizon and has the same gradient: a touch of
// slate at its horizon, fading to the plain dark background by the time it
// reaches the next band's horizon (or the bottom of the screen). Up at the
// stars there are no bands, so the sky stays the background colour.
//
// Horizon heights are fractions of the art frame (the eye's frame), from
// the top, for each screen. 'out' = slid off the bottom (pan up / reveal).
const BANDS = [
  { home: 0.1, message: 0.06, panMult: 1.0 }, // up above the title
];
const TOP_OPACITY = 0.07; // slate at each band's horizon; fades to 0 at the bottom
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
  const gradRefs = useRef([]);
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

      const dip = CURVE * frameH;
      const horizon = f => frameTop + f * frameH; // centre of the curve
      ys.forEach((f, i) => {
        const el = pathRefs.current[i];
        if (!el) return;
        const y = horizon(f);
        el.setAttribute(
          'd',
          `M${-0.1 * w},${y + dip} Q${w / 2},${y - dip} ${1.1 * w},${y + dip} V${h + 10} H${-0.1 * w}Z`
        );
        // Fade from this band's crest down to the next band's crest
        const g = gradRefs.current[i];
        const top = y - dip / 2; // a quadratic's peak is halfway to its control point
        const below = i + 1 < ys.length ? horizon(ys[i + 1]) - dip / 2 : h;
        g?.setAttribute('y1', top.toFixed(1));
        g?.setAttribute('y2', Math.max(top + 40, below).toFixed(1));
      });

      id = requestAnimationFrame(frame);
    }

    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [frameRef]);

  return (
    <svg className="bg-bands" aria-hidden="true">
      <defs>
        {BANDS.map((_, i) => (
          <linearGradient
            key={i}
            id={`bg-band-fade-${i}`}
            ref={el => { gradRefs.current[i] = el; }}
            gradientUnits="userSpaceOnUse"
            x1="0" y1="0" x2="0" y2="1"
          >
            <stop offset="0" stopColor="var(--muted)" stopOpacity={TOP_OPACITY} />
            <stop offset="1" stopColor="var(--muted)" stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {BANDS.map((_, i) => (
        <path
          key={i}
          ref={el => { pathRefs.current[i] = el; }}
          fill={`url(#bg-band-fade-${i})`}
        />
      ))}
    </svg>
  );
}

