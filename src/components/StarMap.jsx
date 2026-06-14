import { useEffect, useRef } from 'react';
import starsData from '../data/stars.json';

const DEG = Math.PI / 180;
const FOV_RADIUS_DEG = 25;
const FOV_RADIUS_RAD = FOV_RADIUS_DEG * DEG;

function project(ra, dec, ra0, dec0) {
  // Normalize RA difference to [-12, 12] hours to handle wrap-around
  let dRaHours = ra - ra0;
  if (dRaHours > 12) dRaHours -= 24;
  if (dRaHours < -12) dRaHours += 24;

  const dRA = dRaHours * 15 * DEG;
  const decRad = dec * DEG;
  const dec0Rad = dec0 * DEG;

  const cosD = Math.cos(decRad);
  const sinD = Math.sin(decRad);
  const cosD0 = Math.cos(dec0Rad);
  const sinD0 = Math.sin(dec0Rad);
  const cosDRA = Math.cos(dRA);
  const sinDRA = Math.sin(dRA);

  return {
    x: cosD * sinDRA,
    y: sinD * cosD0 - cosD * sinD0 * cosDRA,
    z: sinD * sinD0 + cosD * cosD0 * cosDRA,
  };
}

function magToRadius(mag) {
  return Math.max(0.7, 3.5 - (mag + 1.5) * (2.8 / 8));
}

export default function StarMap({ centerStar }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const displaySize = container.clientWidth;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;
    canvas.style.width = displaySize + 'px';
    canvas.style.height = displaySize + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const size = displaySize;
    const cx = size / 2;
    const cy = size / 2;
    const scale = (size / 2) / Math.sin(FOV_RADIUS_RAD);

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, size, size);

    const ra0 = centerStar.ra;
    const dec0 = centerStar.dec;

    // Draw background stars
    for (const star of starsData) {
      if (star.id === centerStar.id) continue;
      const { x, y, z } = project(star.ra, star.dec, ra0, dec0);
      if (z <= 0.05) continue;
      const angDist = Math.acos(Math.min(1, z));
      if (angDist > FOV_RADIUS_RAD) continue;

      const px = cx + x * scale;
      const py = cy - y * scale;
      const r = magToRadius(star.mag);
      const fade = 1 - (angDist / FOV_RADIUS_RAD) * 0.65;

      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${(fade * 0.9).toFixed(2)})`;
      ctx.fill();
    }

    // Center star: outer glow
    const cr = Math.max(2.5, magToRadius(centerStar.mag) * 1.8);
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr * 10);
    grd.addColorStop(0, 'rgba(255,255,255,0.75)');
    grd.addColorStop(0.2, 'rgba(255,255,255,0.25)');
    grd.addColorStop(0.6, 'rgba(255,255,255,0.06)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, cr * 10, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    // Center star: dot
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Center star: sparkle rays (4-point cross)
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 0.75;
    const rayAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    for (const angle of rayAngles) {
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * cr * 2.2, cy + Math.sin(angle) * cr * 2.2);
      ctx.lineTo(cx + Math.cos(angle) * cr * 7, cy + Math.sin(angle) * cr * 7);
      ctx.stroke();
    }
    // Diagonal rays, shorter
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    const diagAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
    for (const angle of diagAngles) {
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * cr * 2.2, cy + Math.sin(angle) * cr * 2.2);
      ctx.lineTo(cx + Math.cos(angle) * cr * 4.5, cy + Math.sin(angle) * cr * 4.5);
      ctx.stroke();
    }
    ctx.restore();
  }, [centerStar]);

  return (
    <div ref={containerRef} className="starmap-container">
      <canvas ref={canvasRef} className="starmap-canvas" />
    </div>
  );
}
