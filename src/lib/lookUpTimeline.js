// Timing for the "look up" sequence (message → reveal), in ms from the tap.
//
//   eye opens wide and looks up → star rays shine down → camera pans up
//   to the stars → rays fade → reveal text and UI fade in
export const SHINE_AT = 400;
export const SHINE_MS = 800;
export const RAYS_HOLD_MS = 1300; // pause on the rays before the camera moves
export const PAN_AT = SHINE_AT + SHINE_MS + RAYS_HOLD_MS;
export const PAN_MS = 2800;
export const RAYS_FADE_AT = PAN_AT + 2000;
export const RAYS_FADE_MS = 700;
export const REVEAL_AT = PAN_AT + 2350;
export const LOOK_UP_END = RAYS_FADE_AT + RAYS_FADE_MS;

// Same easing the star map uses for its camera pan, so the eye, rays and
// stars all move together.
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function panProgress(now, panStartAt) {
  if (panStartAt == null || now < panStartAt) return 0;
  return easeOutCubic(Math.min(1, (now - panStartAt) / PAN_MS));
}

// The star map gives brighter stars more parallax during the pan.
export function starParallax(mag) {
  const normBright = Math.max(0, Math.min(1, (6 - mag) / 7.5));
  return 1 + normBright * 0.45;
}
