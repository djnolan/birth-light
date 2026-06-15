import { useEffect, useRef } from 'react';
import starsData from '../data/stars.json';

const DEG = Math.PI / 180;
const FOV_RADIUS_DEG = 25;
const FOV_RADIUS_RAD = FOV_RADIUS_DEG * DEG;

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

function drawDiamond(ctx, x, y, rw, rh) {
  ctx.beginPath();
  ctx.moveTo(x, y - rh);
  ctx.lineTo(x + rw, y);
  ctx.lineTo(x, y + rh);
  ctx.lineTo(x - rw, y);
  ctx.closePath();
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

        drawDiamond(ctx, px, py, r, r * 1.6);
        ctx.fillStyle = `rgba(255,255,255,${(fade * 0.9).toFixed(2)})`;
        ctx.fill();
      }

      // Center star: subtle glow only, no rays
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

      drawDiamond(ctx, cx, cy, cr, cr * 1.6);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [centerStar]);

  return <canvas ref={canvasRef} className="starmap-canvas" />;
}
