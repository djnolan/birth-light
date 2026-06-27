import { useEffect, useRef } from 'react';
import starsData from '../data/stars.json';

const DEG = Math.PI / 180;
const FOV_RADIUS_DEG = 25;
const FOV_RADIUS_RAD = FOV_RADIUS_DEG * DEG;

// Cut-paper star shape path from star-shapes.svg
const STAR_PATH = new Path2D(
  'M719.349,186.544C714.037,184.331 708.504,181.011 702.749,176.584C696.995,172.158 692.457,167.731 689.137,163.304C692.015,157.107 695.667,151.297 700.093,145.874C704.52,140.452 708.947,136.191 713.373,133.092C719.128,135.527 724.661,139.124 729.973,143.882C735.285,148.641 739.491,153.234 742.589,157.66C740.376,162.972 737.111,168.34 732.795,173.762C728.479,179.185 723.997,183.446 719.349,186.544Z'
);
const STAR_CX = 715.863;
const STAR_CY = 159.818;
const STAR_HALF_EXTENT = 26.73;
const ROTATIONS = [0, -1.634, 1.634, -3.011];

const ROTATION_MAP = new Map(starsData.map((s, i) => [s.id, i % 4]));

function project(ra, dec, ra0, dec0) {
  let dRaHours = ra - ra0;
  if (dRaHours > 12) dRaHours -= 24;
  if (dRaHours < -12) dRaHours += 24;

  const dRA = dRaHours * 15 * DEG;
  const decRad = dec * DEG;
  const dec0Rad = dec0 * DEG;
  const cosD = Math.cos(decRad), sinD = Math.sin(decRad);
  const cosD0 = Math.cos(dec0Rad), sinD0 = Math.sin(dec0Rad);
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

function drawStarShape(ctx, px, py, r, rotIdx) {
  const s = r / STAR_HALF_EXTENT;
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(ROTATIONS[rotIdx]);
  ctx.scale(s, s);
  ctx.translate(-STAR_CX, -STAR_CY);
  ctx.fill(STAR_PATH);
  ctx.restore();
}

export default function StarMap({ centerStar }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      const cx = w / 2;
      const cy = h / 2;
      const scale = (Math.min(w, h) / 2) / Math.sin(FOV_RADIUS_RAD);

      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, w, h);

      const ra0 = centerStar.ra;
      const dec0 = centerStar.dec;

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
        const rotIdx = ROTATION_MAP.get(star.id) ?? 0;

        ctx.fillStyle = `rgba(255,255,255,${(fade * 0.9).toFixed(2)})`;
        drawStarShape(ctx, px, py, r, rotIdx);
      }

      // Center star: radial glow + cut-paper shape
      const cr = Math.max(2.5, magToSize(centerStar.mag) * 1.8);

      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr * 14);
      grd.addColorStop(0, 'rgba(255,255,255,0.55)');
      grd.addColorStop(0.12, 'rgba(255,255,255,0.18)');
      grd.addColorStop(0.4, 'rgba(255,255,255,0.04)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, cr * 14, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      const rotIdx = ROTATION_MAP.get(centerStar.id) ?? 0;
      ctx.fillStyle = '#ffffff';
      drawStarShape(ctx, cx, cy, cr, rotIdx);
    }

    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [centerStar]);

  return <canvas ref={canvasRef} className="starmap-canvas" />;
}
