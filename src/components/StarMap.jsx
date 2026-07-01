import { useEffect, useRef } from 'react';
import starsData from '../data/stars.json';

const DEG = Math.PI / 180;
const FOV_RADIUS_DEG = 25;
const FOV_RADIUS_RAD = FOV_RADIUS_DEG * DEG;

const STAR_PATH = new Path2D(
  'M719.349,186.544C714.037,184.331 708.504,181.011 702.749,176.584C696.995,172.158 692.457,167.731 689.137,163.304C692.015,157.107 695.667,151.297 700.093,145.874C704.52,140.452 708.947,136.191 713.373,133.092C719.128,135.527 724.661,139.124 729.973,143.882C735.285,148.641 739.491,153.234 742.589,157.66C740.376,162.972 737.111,168.34 732.795,173.762C728.479,179.185 723.997,183.446 719.349,186.544Z'
);
const STAR_CX = 715.863;
const STAR_CY = 159.818;
const STAR_HALF = 26.73;
const ROTATIONS = [0, -1.634, 1.634, -3.011]; // radians
// Size multipliers per frame — makes rotation frames visually distinct at small sizes
const FRAME_SIZE = [1.0, 0.76, 1.18, 0.88];

// Per-star base rotation index (0-3)
const BASE_ROT = new Map(starsData.map((s, i) => [s.id, i % 4]));
// Per-star phase offset — distributed by RA so stars aren't all in sync
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

export default function StarMap({ centerStar, extraClass = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId;
    let lastRotFrame = -1;
    let currentW = 0, currentH = 0;

    function draw(rotFrame) {
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
      const scale = (Math.min(w, h) / 2) / Math.sin(FOV_RADIUS_RAD);

      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, w, h);

      const ra0 = centerStar.ra, dec0 = centerStar.dec;

      for (const star of starsData) {
        if (star.id === centerStar.id) continue;
        const { x, y, z } = project(star.ra, star.dec, ra0, dec0);
        if (z <= 0.05) continue;
        const angDist = Math.acos(Math.min(1, z));
        if (angDist > FOV_RADIUS_RAD) continue;

        const px = cx + x * scale;
        const py = cy - y * scale;
        const r = magToSize(star.mag);
        const fade = 1 - (angDist / FOV_RADIUS_RAD) * 0.65;

        const base = BASE_ROT.get(star.id) ?? 0;
        const phase = PHASE_OFF.get(star.id) ?? 0;
        const rotIdx = (base + phase + rotFrame) % 4;
        const sr = r * FRAME_SIZE[rotIdx];

        ctx.fillStyle = `rgba(255,255,255,${(fade * 0.9).toFixed(2)})`;
        drawShape(ctx, px, py, sr, rotIdx);
      }

      // Center star: radial glow + cut-paper shape
      const cr = Math.max(2.5, magToSize(centerStar.mag) * 1.8);
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr * 14);
      grd.addColorStop(0,    'rgba(255,255,255,0.55)');
      grd.addColorStop(0.12, 'rgba(255,255,255,0.18)');
      grd.addColorStop(0.4,  'rgba(255,255,255,0.04)');
      grd.addColorStop(1,    'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, cr * 14, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      const cRotIdx = ((BASE_ROT.get(centerStar.id) ?? 0) + rotFrame) % 4;
      ctx.fillStyle = '#ffffff';
      drawShape(ctx, cx, cy, cr * FRAME_SIZE[cRotIdx], cRotIdx);
    }

    function loop(now) {
      const rotFrame = Math.floor(now / 300) % 4; // ~3fps stop-motion
      if (rotFrame !== lastRotFrame) {
        lastRotFrame = rotFrame;
        draw(rotFrame);
      }
      animId = requestAnimationFrame(loop);
    }

    function onResize() {
      currentW = 0; // force canvas resize on next draw
    }

    animId = requestAnimationFrame(loop);
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [centerStar]);

  return (
    <canvas
      ref={canvasRef}
      className={`starmap-canvas${extraClass ? ` ${extraClass}` : ''}`}
    />
  );
}
