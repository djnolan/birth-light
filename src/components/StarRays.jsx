import { useEffect, useRef } from 'react';
import { ART_W, ART_H, RAYS_BG, RAY_FORE, RAY_BASE_Y } from '../lib/eyeArt';
import {
  SHINE_AT, SHINE_MS, PAN_AT, RAYS_FADE_AT, RAYS_FADE_MS,
  easeOutCubic, panProgress, starParallax,
} from '../lib/lookUpTimeline';

// Per-layer idle sway: [speed, phase, sway amount (artboard units)]
const SWAY = [
  [0.00071, 0.0, 34],
  [0.00053, 1.7, 46],
  [0.00089, 3.1, 28],
  [0.00062, 4.4, 22],
  [0.00078, 2.2, 30],
  [0.00047, 5.3, 18],
];

/**
 * Light from the star shining down to the eye. The apex tracks the star as
 * the camera pans up, and the base tracks the eye as it drops off screen.
 * startedAt: when the look-up sequence began (performance.now()).
 */
export default function StarRays({ startedAt, starMag, frameRef }) {
  const groupRef = useRef(null);
  const bgRefs = useRef([]);
  const foreRef = useRef(null);

  useEffect(() => {
    const mult = starParallax(starMag);
    const panStartAt = startedAt + PAN_AT;
    let id;

    function frame(now) {
      const rect = frameRef.current?.getBoundingClientRect();
      const h = window.innerHeight;
      const k = (rect?.height || h) / ART_H;          // screen px per artboard unit
      const toArt = y => (y - (rect?.top || 0)) / k;

      // Star rides the pan from above the screen to the centre (as in StarMap)
      const e = panProgress(now, panStartAt);
      const apex = toArt(h / 2 - (1 - e) * h * mult);
      let base = RAY_BASE_Y + (h * e) / k;

      // Shine down: before the pan, the beam extends from the star to the eye
      const s = easeOutCubic(Math.max(0, Math.min(1, (now - startedAt - SHINE_AT) / SHINE_MS)));
      base = apex + (base - apex) * s;

      const fade = Math.max(0, Math.min(1, (now - startedAt - RAYS_FADE_AT) / RAYS_FADE_MS));
      const opacity = Math.min(1, s * 1.4) * (1 - fade);

      const len = base - apex;
      const cx = ART_W / 2;
      const pts = (src, sway = 0, widen = 1) => {
        let out = '';
        for (let i = 0; i < src.length; i += 2) {
          const u = src[i + 1];
          const x = cx + src[i] * (u > 0 ? widen : 1) + sway * u;
          out += `${x.toFixed(1)},${(apex + u * len).toFixed(1)} `;
        }
        return out;
      };

      RAYS_BG.forEach((ray, i) => {
        const el = bgRefs.current[i];
        if (!el) return;
        const [speed, phase, amt] = SWAY[i];
        const sway = Math.sin(now * speed + phase) * amt;
        const shimmer = 1 + 0.25 * Math.sin(now * speed * 1.7 + phase * 2);
        el.setAttribute('points', pts(ray.pts, sway, 1 + 0.06 * Math.sin(now * speed * 0.8 + phase)));
        el.setAttribute('fill-opacity', (ray.opacity * shimmer).toFixed(3));
      });
      foreRef.current?.setAttribute('points', pts(RAY_FORE, 0, 1 + 0.05 * Math.sin(now * 0.0013)));
      groupRef.current?.setAttribute('opacity', opacity.toFixed(3));

      id = requestAnimationFrame(frame);
    }

    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [startedAt, starMag, frameRef]);

  return (
    <svg className="rays-svg" viewBox={`0 0 ${ART_W} ${ART_H}`} aria-hidden="true">
      <g ref={groupRef} opacity="0">
        {RAYS_BG.map((_, i) => (
          <polygon key={i} ref={el => { bgRefs.current[i] = el; }} fill="var(--muted)" />
        ))}
        <polygon ref={foreRef} fill="var(--fg)" />
      </g>
    </svg>
  );
}
