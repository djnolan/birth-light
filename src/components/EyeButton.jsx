import { useEffect, useRef, useState } from 'react';
import { ART_W, ART_H, BG_OPACITY, EYE_STATES, blendStates, toPath } from '../lib/eyeArt';
import { easeInOutCubic, panProgress } from '../lib/lookUpTimeline';

// How long each state change takes to morph into
const MORPH_MS = { closed: 650, open: 950, up: 750 };
const BLINK_MS = 230;
const SLIDE_TAU = 260; // ms; smoothing for sliding on/off screen

// Hit area around the eye, in artboard units
const HIT = { x: 800, y: 3220, w: 740, h: 760 };

function randomBlinkDelay() {
  return 2600 + Math.random() * 3800;
}

/**
 * The eye button. It lives in a fixed frame and morphs between states:
 *   closed (home) → open (message, blinks) → up (look-up sequence)
 * position: 'in' (resting on screen) | 'out' (below the screen)
 * panStartAt: while set, the eye rides the camera pan off the bottom.
 */
export default function EyeButton({ state, position, panStartAt, frameRef, onClick, label }) {
  const svgRef = useRef(null);
  const moveRef = useRef(null);
  const bg3Ref = useRef(null);
  const bg2Ref = useRef(null);
  const bg1Ref = useRef(null);
  const eyeRef = useRef(null);
  const pupilRef = useRef(null);
  const clipRef = useRef(null);
  const [hover, setHover] = useState(false);

  const live = useRef({
    shape: EYE_STATES[state],
    morph: null,           // { from, to, start, dur }
    blink: null,           // { start }
    nextBlinkAt: 0,
    offsetPx: position === 'out' ? window.innerHeight : 0,
    lastNow: null,
    state, position, panStartAt,
  });

  // Start a morph whenever the target state changes
  useEffect(() => {
    const l = live.current;
    if (l.state === state) return;
    const now = performance.now();
    l.morph = { from: l.shape, to: EYE_STATES[state], start: now, dur: MORPH_MS[state] };
    l.blink = null;
    l.nextBlinkAt = now + MORPH_MS[state] + randomBlinkDelay();
    l.state = state;
  }, [state]);

  useEffect(() => {
    live.current.position = position;
    live.current.panStartAt = panStartAt;
  }, [position, panStartAt]);

  useEffect(() => {
    const l = live.current;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let id;

    function frame(now) {
      const dt = l.lastNow == null ? 16 : Math.min(64, now - l.lastNow);
      l.lastNow = now;

      // ── Shape: morph between states, plus blinking while open ──
      let shape;
      if (l.morph) {
        const t = Math.min(1, (now - l.morph.start) / l.morph.dur);
        shape = blendStates(l.morph.from, l.morph.to, easeInOutCubic(t));
        if (t >= 1) l.morph = null;
      } else {
        shape = EYE_STATES[l.state];
      }
      l.shape = shape;

      let drawn = shape;
      if (l.state === 'open' && !l.morph && !reduceMotion) {
        if (!l.blink && now >= l.nextBlinkAt) {
          l.blink = { start: now };
        }
        if (l.blink) {
          const t = (now - l.blink.start) / BLINK_MS;
          if (t >= 1) {
            l.blink = null;
            // Now and then, a quick double blink
            l.nextBlinkAt = now + (Math.random() < 0.2 ? 140 : randomBlinkDelay());
          } else {
            drawn = blendStates(shape, EYE_STATES.closed, Math.sin(Math.PI * t));
          }
        }
      }

      // Pupil drifts slightly while the eye is open and idle
      let pupilDx = 0;
      if (l.state === 'open' && !reduceMotion) {
        pupilDx = 16 * Math.sin(now / 2300) + 6 * Math.sin(now / 1100 + 1.3);
      }

      // ── Position: ride the camera pan, or slide to rest ──
      const h = window.innerHeight;
      if (l.panStartAt != null) {
        l.offsetPx = h * panProgress(now, l.panStartAt);
      } else {
        const target = l.position === 'out' ? h : 0;
        l.offsetPx += (target - l.offsetPx) * (1 - Math.exp(-dt / SLIDE_TAU));
        if (Math.abs(target - l.offsetPx) < 0.5) l.offsetPx = target;
      }

      const frameH = frameRef.current?.getBoundingClientRect().height || h;
      const offsetArt = l.offsetPx * ART_H / frameH;

      // ── Write to the DOM ──
      moveRef.current?.setAttribute('transform', `translate(0 ${offsetArt.toFixed(1)})`);
      bg3Ref.current?.setAttribute('d', toPath(drawn.bg3));
      bg2Ref.current?.setAttribute('d', toPath(drawn.bg2));
      bg1Ref.current?.setAttribute('d', toPath(drawn.bg1));
      const eyeD = toPath(drawn.eye);
      eyeRef.current?.setAttribute('d', eyeD);
      clipRef.current?.setAttribute('d', eyeD);
      pupilRef.current?.setAttribute('d', toPath(drawn.pupil, pupilDx));
      pupilRef.current?.setAttribute('opacity', Math.max(0, Math.min(1, drawn.pupilOpacity * 1.6 - 0.3)).toFixed(3));

      id = requestAnimationFrame(frame);
    }

    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [frameRef]);

  const interactive = position === 'in' && panStartAt == null && state !== 'up';

  return (
    <>
      <svg
        ref={svgRef}
        className={`eye-svg${hover && interactive ? ' eye-svg--hover' : ''}`}
        viewBox={`0 0 ${ART_W} ${ART_H}`}
        aria-hidden="true"
      >
        <defs>
          <clipPath id="eye-clip">
            <path ref={clipRef} />
          </clipPath>
        </defs>
        <g ref={moveRef}>
          <g className="eye-hover">
            <g className="eye-idle eye-idle--3">
              <path ref={bg3Ref} fill="var(--accent)" fillOpacity={BG_OPACITY.bg3} />
            </g>
            <g className="eye-idle eye-idle--2">
              <path ref={bg2Ref} fill="var(--accent)" fillOpacity={BG_OPACITY.bg2} />
            </g>
            <g className="eye-idle eye-idle--1">
              <path ref={bg1Ref} fill="var(--accent)" fillOpacity={BG_OPACITY.bg1} />
            </g>
            <path ref={eyeRef} fill="var(--fg)" />
            <g clipPath="url(#eye-clip)">
              <path ref={pupilRef} fill="var(--bg)" />
            </g>
          </g>
        </g>
      </svg>
      <button
        type="button"
        className="eye-hit"
        style={{
          left: `${(HIT.x / ART_W) * 100}%`,
          top: `${(HIT.y / ART_H) * 100}%`,
          width: `${(HIT.w / ART_W) * 100}%`,
          height: `${(HIT.h / ART_H) * 100}%`,
        }}
        onClick={interactive ? onClick : undefined}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        disabled={!interactive}
        hidden={position === 'out' && panStartAt == null}
        aria-label={label}
      />
    </>
  );
}
