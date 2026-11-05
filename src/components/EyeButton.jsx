import { useEffect, useRef, useState } from 'react';
import {
  ART_W, ART_H, BG_OPACITY, EYE_STATES, CLOSED_EYE_PATH, CLOSED_EYE_TRANSFORM,
  blendStates, toPath,
} from '../lib/eyeArt';
import { panProgress } from '../lib/lookUpTimeline';

// Stop-motion: each state change plays a few held frames, not a smooth tween.
// steps = how far along each frame is (0 = start state, 1 = end state);
// ms = how long each frame holds.
const MORPH_FRAMES = {
  open:   { steps: [0.45, 0.8, 1], ms: 70 },
  up:     { steps: [0.35, 0.7, 1], ms: 110 },
  closed: { steps: [0.5, 1], ms: 90 },
};
// Blink frames: how closed the eye is on each frame, and how long it holds
const BLINK_FRAMES = [[0.55, 60], [1, 90], [0.55, 60]];
const PUPIL_FRAME_MS = 330; // idle pupil drift updates at ~3fps
const SLIDE_TAU = 260;      // ms; smoothing for sliding on/off screen

// Hit area around the eye, in artboard units
const HIT = { x: 800, y: 3220, w: 740, h: 760 };

function randomBlinkDelay() {
  return 2600 + Math.random() * 3800;
}

// Which frame of a sequence we're on, given the time since it started
function frameAt(elapsed, frames) {
  let t = 0;
  for (let i = 0; i < frames.length; i++) {
    t += frames[i][1];
    if (elapsed < t) return i;
  }
  return -1; // finished
}

/**
 * The eye button. It lives in a fixed frame and steps between states:
 *   closed (home) → open (message, blinks) → up (look-up sequence)
 * position: 'in' (resting on screen) | 'out' (below the screen)
 * panStartAt: while set, the eye rides the camera pan off the bottom.
 * disabled: shown dimmed and can't be tapped (home, before a date is picked).
 */
export default function EyeButton({ state, position, panStartAt, disabled = false, frameRef, onClick, label }) {
  const moveRef = useRef(null);
  const bg3Ref = useRef(null);
  const bg2Ref = useRef(null);
  const bg1Ref = useRef(null);
  const eyeRef = useRef(null);
  const pupilRef = useRef(null);
  const openGroupRef = useRef(null);
  const closedRef = useRef(null);
  const clipRef = useRef(null);
  const [hover, setHover] = useState(false);

  const live = useRef({
    shape: EYE_STATES[state],
    morph: null,           // { from, to, start }
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
    l.morph = { from: l.shape, to: state, start: now };
    l.blink = null;
    l.nextBlinkAt = now + randomBlinkDelay();
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

      // ── Shape: stepped morph between states, plus blinking while open ──
      let shape = EYE_STATES[l.state];
      let closedAmount = l.state === 'closed' ? 1 : 0; // 1 = draw the original closed eye
      if (l.morph) {
        const { steps, ms } = MORPH_FRAMES[l.morph.to];
        const i = Math.floor((now - l.morph.start) / ms);
        if (i >= steps.length) {
          l.morph = null;
        } else {
          shape = blendStates(l.morph.from, EYE_STATES[l.morph.to], steps[i]);
          closedAmount = 0;
        }
      }
      l.shape = shape;

      let drawn = shape;
      if (l.state === 'open' && !l.morph && !reduceMotion) {
        if (!l.blink && now >= l.nextBlinkAt) l.blink = { start: now };
        if (l.blink) {
          const i = frameAt(now - l.blink.start, BLINK_FRAMES);
          if (i < 0) {
            l.blink = null;
            // Now and then, a quick double blink
            l.nextBlinkAt = now + (Math.random() < 0.2 ? 150 : randomBlinkDelay());
          } else {
            const amt = BLINK_FRAMES[i][0];
            if (amt >= 1) closedAmount = 1;
            // A blink moves the lids only; the glow layers stay put
            else drawn = { ...blendStates(shape, EYE_STATES.closed, amt), bg1: shape.bg1, bg2: shape.bg2, bg3: shape.bg3 };
          }
        }
      }

      // Pupil drifts slightly while the eye is open, held a few frames at a time
      let pupilDx = 0;
      if (l.state === 'open' && !reduceMotion) {
        const tq = Math.floor(now / PUPIL_FRAME_MS) * PUPIL_FRAME_MS;
        pupilDx = 16 * Math.sin(tq / 2300) + 6 * Math.sin(tq / 1100 + 1.3);
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

      const showClosed = closedAmount === 1;
      closedRef.current?.setAttribute('visibility', showClosed ? 'visible' : 'hidden');
      openGroupRef.current?.setAttribute('visibility', showClosed ? 'hidden' : 'visible');
      if (!showClosed) {
        const eyeD = toPath(drawn.eye);
        eyeRef.current?.setAttribute('d', eyeD);
        clipRef.current?.setAttribute('d', eyeD);
        pupilRef.current?.setAttribute('d', toPath(drawn.pupil, pupilDx));
        pupilRef.current?.setAttribute('opacity', Math.max(0, Math.min(1, drawn.pupilOpacity * 1.6 - 0.3)).toFixed(3));
      }

      id = requestAnimationFrame(frame);
    }

    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [frameRef]);

  const interactive = position === 'in' && panStartAt == null && state !== 'up' && !disabled;
  const svgClass = [
    'eye-svg',
    hover && interactive ? 'eye-svg--hover' : '',
    disabled ? 'eye-svg--disabled' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <svg className={svgClass} viewBox={`0 0 ${ART_W} ${ART_H}`} aria-hidden="true">
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
            <path
              ref={closedRef}
              d={CLOSED_EYE_PATH}
              transform={CLOSED_EYE_TRANSFORM}
              fill="var(--fg)"
              visibility={state === 'closed' ? 'visible' : 'hidden'}
            />
            <g ref={openGroupRef} visibility={state === 'closed' ? 'hidden' : 'visible'}>
              <path ref={eyeRef} fill="var(--fg)" />
              <g clipPath="url(#eye-clip)">
                <path ref={pupilRef} fill="var(--bg)" />
              </g>
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
