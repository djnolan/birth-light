// Timing for the "look up" sequence (message → reveal), in ms from the tap.
//
//   eye opens wide and looks up → short beat → camera pans up to the
//   stars, and the message text drops away with the scene → reveal
//   text and UI fade in
export const EYE_HOLD_MS = 850; // eye looks up (≈330ms of frames), then a beat
export const PAN_AT = EYE_HOLD_MS;
export const PAN_MS = 2800;
export const REVEAL_AT = PAN_AT + 2600;
export const LOOK_UP_END = PAN_AT + PAN_MS;

// ── Star rays: switched off for now, kept for later ──
// The rays shine down from the star to the eye before the pan. To bring
// them back:
//   1. In App.jsx, uncomment the StarRays import and the <StarRays> line.
//   2. Here, replace PAN_AT and LOOK_UP_END above with:
//        export const PAN_AT = SHINE_AT + SHINE_MS + RAYS_HOLD_MS;
//        export const LOOK_UP_END = RAYS_FADE_AT + RAYS_FADE_MS;
export const SHINE_AT = 400;
export const SHINE_MS = 800;
export const RAYS_HOLD_MS = 1300; // pause on the rays before the camera moves
export const RAYS_FADE_AT = PAN_AT + 2300;
export const RAYS_FADE_MS = 700;

export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function panProgress(now, panStartAt) {
  if (panStartAt == null || now < panStartAt) return 0;
  // Same easing the star map uses for its camera pan (slow-fast-slow), so
  // the eye, rays and stars all move together.
  return easeInOutCubic(Math.min(1, (now - panStartAt) / PAN_MS));
}

// The star map gives brighter stars more parallax during the pan.
export function starParallax(mag) {
  const normBright = Math.max(0, Math.min(1, (6 - mag) / 7.5));
  return 1 + normBright * 0.45;
}
