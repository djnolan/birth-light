// Timing for the "look up" sequence (message → reveal), in ms from the tap.
//
//   eye opens wide and looks up → short beat → camera pans up to the
//   stars → reveal text and UI fade in
export const EYE_HOLD_MS = 850; // eye looks up (≈330ms of frames), then a beat
export const PAN_AT = EYE_HOLD_MS;
export const PAN_MS = 2800;
export const REVEAL_AT = PAN_AT + 2600;
export const LOOK_UP_END = PAN_AT + PAN_MS;

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
