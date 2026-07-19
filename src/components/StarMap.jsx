import { useEffect, useRef } from 'react';
import starsData from '../data/stars.json';

const DEG = Math.PI / 180;
const FOV_RADIUS_DEG = 25;
const FOV_RADIUS_RAD = FOV_RADIUS_DEG * DEG;
const STAR_TRANS_DUR = 650; // ms for star-to-star navigation pan

const STAR_PATH = new Path2D(
  'M719.349,186.544C714.037,184.331 708.504,181.011 702.749,176.584C696.995,172.158 692.457,167.731 689.137,163.304C692.015,157.107 695.667,151.297 700.093,145.874C704.52,140.452 708.947,136.191 713.373,133.092C719.128,135.527 724.661,139.124 729.973,143.882C735.285,148.641 739.491,153.234 742.589,157.66C740.376,162.972 737.111,168.34 732.795,173.762C728.479,179.185 723.997,183.446 719.349,186.544Z'
);
const STAR_CX = 715.863;
const STAR_CY = 159.818;
const STAR_HALF = 26.73;
const ROTATIONS = [0, -1.634, 1.634, -3.011];
const FRAME_SIZE = [1.0, 0.76, 1.18, 0.88];

const BASE_ROT = new Map(starsData.map((s, i) => [s.id, i % 4]));
const PHASE_OFF = new Map(starsData.map(s => [s.id, Math.floor(s.ra * 10) % 4]));

function project(ra, dec, ra0, dec0) {
  let dRa = ra - ra0;
  if (dRa > 12) dRa -= 24;
  if (dRa < -12) dRa += 24;
  const dRA = dRa * 15 * DEG;
  const decR = dec * DEG, dec0R = dec0 * DEG;
  const cosD = Math.cos(decR), sinD = Math.sin(decR);
  const cosD0 = Math.cos(dec0R), sinD0 = Math.sin(dec0R);
  const cosDRA = Math.cos(dRA), sinDRA = Math.sin(dRA);
  return {
    x: cosD * sinDRA,
    y: sinD * cosD0 - cosD * sinD0 * cosDRA,
    z: sinD * sinD0 + cosD * cosD0 * cosDRA,
  };
}

function magToSize(mag) {
  return Math.max(0.6, 3.2 - (mag + 1.5) * (2.6 / 8));
}

function hexToRgb(hex) {
  const h = hex.trim().replace('#', '');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

function drawShape(ctx, px, py, r, rotIdx) {
  const s = r / STAR_HALF;
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(ROTATIONS[rotIdx]);
  ctx.scale(s, s);
  ctx.translate(-STAR_CX, -STAR_CY);
  ctx.fill(STAR_PATH);
  ctx.restore();
}

function drawCenterStar(ctx, cx, cy, star, rotFrame, alpha, fgR, fgG, fgB) {
  const cr = Math.max(2.5, magToSize(star.mag) * 1.8);
  if (alpha < 1) ctx.globalAlpha = alpha;
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr * 14);
  grd.addColorStop(0,    `rgba(${fgR},${fgG},${fgB},${0.55 * alpha})`);
  grd.addColorStop(0.12, `rgba(${fgR},${fgG},${fgB},${0.18 * alpha})`);
  grd.addColorStop(0.4,  `rgba(${fgR},${fgG},${fgB},${0.04 * alpha})`);
  grd.addColorStop(1,    `rgba(${fgR},${fgG},${fgB},0)`);
  ctx.beginPath();
  ctx.arc(cx, cy, cr * 14, 0, Math.PI * 2);
  ctx.fillStyle = grd;
  ctx.fill();
  const rotIdx = ((BASE_ROT.get(star.id) ?? 0) + rotFrame) % 4;
  ctx.fillStyle = `rgb(${fgR},${fgG},${fgB})`;
  drawShape(ctx, cx, cy, cr * FRAME_SIZE[rotIdx], rotIdx);
  if (alpha < 1) ctx.globalAlpha = 1;
}

// Quadratic ease-in-out: smooth start and finish
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// Ease-out cubic: fast entry, graceful settle (used for camera pan-up)
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

export default function StarMap({ centerStar, isPanning = false, panDuration = 2800, extraClass = '' }) {
  const canvasRef = useRef(null);

  // All animation state in refs so the RAF loop never needs to restart
  const centerStarRef = useRef(centerStar);
  const panRef = useRef({ isPanning: false, startTime: null, dur: panDuration });
  const starTransRef = useRef({ from: null, to: null, startTime: null });

  // Detect centerStar changes → start star-to-star pan transition
  useEffect(() => {
    if (centerStar !== centerStarRef.current) {
      // If already transitioning, chain from previous target to avoid a jump
      const existing = starTransRef.current;
      const fromStar = (existing.from && existing.to) ? existing.to : centerStarRef.current;
      starTransRef.current = { from: fromStar, to: centerStar, startTime: null };
      centerStarRef.current = centerStar;
    }
  }, [centerStar]);

  // Sync pan state to ref
  useEffect(() => {
    const p = panRef.current;
    if (isPanning && !p.isPanning) {
      p.isPanning = true;
      p.startTime = null;
    } else if (!isPanning && p.isPanning) {
      p.isPanning = false;
    }
    p.dur = panDuration;
  }, [isPanning, panDuration]);

  // RAF loop — empty deps: runs once on mount, reads all state from refs
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId;
    let lastRotFrame = -1;
    let currentW = 0, currentH = 0;

    function draw(rotFrame, now) {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      if (w !== currentW || h !== currentH) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        currentW = w;
        currentH = h;
      }

      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cx = w / 2, cy = h / 2;
      const halfDiag = Math.sqrt(w * w + h * h) / 2;
      const scale = halfDiag / Math.sin(FOV_RADIUS_RAD);

      // ── Camera pan-up progress (message → reveal transition) ──
      const p = panRef.current;
      if (p.isPanning && p.startTime === null) p.startTime = now;
      let panProgress = 1.0;
      if (p.startTime !== null) {
        const t = Math.min(1, (now - p.startTime) / p.dur);
        panProgress = easeOut(t);
      }

      // ── Star-to-star navigation transition ──
      const tr = starTransRef.current;
      let ra0, dec0, activeTrans = null;

      if (tr.from && tr.to) {
        if (tr.startTime === null) tr.startTime = now;
        const t = Math.min(1, (now - tr.startTime) / STAR_TRANS_DUR);
        const ease = easeInOut(t);

        // Interpolate projection center along the shortest RA arc
        let dRa = tr.to.ra - tr.from.ra;
        if (dRa > 12) dRa -= 24;
        if (dRa < -12) dRa += 24;
        ra0 = tr.from.ra + dRa * ease;
        dec0 = tr.from.dec + (tr.to.dec - tr.from.dec) * ease;

        if (t < 1) {
          activeTrans = { from: tr.from, to: tr.to, ease };
        } else {
          // Transition complete — snap to final position
          tr.from = null;
          tr.to = null;
          tr.startTime = null;
        }
      }

      if (!activeTrans) {
        const cs = centerStarRef.current;
        ra0 = cs.ra;
        dec0 = cs.dec;
      }

      const centerStar = activeTrans ? activeTrans.to : centerStarRef.current;

      const style = getComputedStyle(document.documentElement);
      const bgColor = style.getPropertyValue('--bg').trim() || '#1e152a';
      const [fgR, fgG, fgB] = hexToRgb(style.getPropertyValue('--fg').trim() || '#ffeaec');

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);

      // ── Background stars ──
      for (const star of starsData) {
        // Skip the center star and (during nav transition) the from-star — both drawn specially
        if (star.id === centerStar.id) continue;
        if (activeTrans && star.id === activeTrans.from.id) continue;

        const { x, y, z } = project(star.ra, star.dec, ra0, dec0);
        if (z <= 0.05) continue;
        const angDist = Math.acos(Math.min(1, z));
        if (angDist > FOV_RADIUS_RAD) continue;

        const finalPy = cy - y * scale;

        // Camera pan-up parallax: brighter stars start farther above → travel more → feel closer
        const normBright = Math.max(0, Math.min(1, (6 - star.mag) / 7.5));
        const parallaxMult = 1 + normBright * 0.45;
        const panOffsetY = (1 - panProgress) * (-h) * parallaxMult;

        const px = cx + x * scale;
        const py = finalPy + panOffsetY;

        const r = magToSize(star.mag);
        const fade = 1 - (angDist / FOV_RADIUS_RAD) * 0.65;
        const base = BASE_ROT.get(star.id) ?? 0;
        const phase = PHASE_OFF.get(star.id) ?? 0;
        const rotIdx = (base + phase + rotFrame) % 4;

        ctx.fillStyle = `rgba(${fgR},${fgG},${fgB},${(fade * 0.9).toFixed(2)})`;
        drawShape(ctx, px, py, r * FRAME_SIZE[rotIdx], rotIdx);
      }

      // ── Center star glow + shape ──
      if (activeTrans) {
        // From-star: project it relative to the moving ra0/dec0, fade out
        const { x: fx, y: fy, z: fz } = project(activeTrans.from.ra, activeTrans.from.dec, ra0, dec0);
        if (fz > 0.05) {
          const fromNormBright = Math.max(0, Math.min(1, (6 - activeTrans.from.mag) / 7.5));
          const fromPanOffY = (1 - panProgress) * (-h) * (1 + fromNormBright * 0.45);
          drawCenterStar(
            ctx,
            cx + fx * scale,
            cy - fy * scale + fromPanOffY,
            activeTrans.from, rotFrame,
            1 - activeTrans.ease,
            fgR, fgG, fgB
          );
        }

        // To-star: also projected, moves to center — draw at full alpha
        const { x: tx, y: ty, z: tz } = project(activeTrans.to.ra, activeTrans.to.dec, ra0, dec0);
        if (tz > 0.05) {
          const toNormBright = Math.max(0, Math.min(1, (6 - activeTrans.to.mag) / 7.5));
          const toPanOffY = (1 - panProgress) * (-h) * (1 + toNormBright * 0.45);
          drawCenterStar(
            ctx,
            cx + tx * scale,
            cy - ty * scale + toPanOffY,
            activeTrans.to, rotFrame, 1,
            fgR, fgG, fgB
          );
        }
      } else {
        // Normal: center star always at screen center (plus pan offset)
        const normBright = Math.max(0, Math.min(1, (6 - centerStar.mag) / 7.5));
        const panOffsetY = (1 - panProgress) * (-h) * (1 + normBright * 0.45);
        drawCenterStar(ctx, cx, cy + panOffsetY, centerStar, rotFrame, 1, fgR, fgG, fgB);
      }
    }

    function loop(now) {
      const rotFrame = Math.floor(now / 300) % 4;
      const p = panRef.current;
      const tr = starTransRef.current;

      const panActive   = p.startTime !== null && (now - p.startTime) < p.dur;
      const starActive  = tr.from !== null;

      if (panActive || starActive || rotFrame !== lastRotFrame) {
        lastRotFrame = rotFrame;
        draw(rotFrame, now);
      }
      animId = requestAnimationFrame(loop);
    }

    function onResize() { currentW = 0; }

    animId = requestAnimationFrame(loop);
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      className={`starmap-canvas${extraClass ? ` ${extraClass}` : ''}`}
    />
  );
}
