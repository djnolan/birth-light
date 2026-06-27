import { useState, useEffect } from 'react';

const frameModules = import.meta.glob('../assets/figure-*.png', { eager: true });
const FRAMES = Object.entries(frameModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, m]) => m.default);

export default function StopMotionFigure({ fps = 6, className = '' }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI(n => (n + 1) % FRAMES.length), 1000 / fps);
    return () => clearInterval(id);
  }, [fps]);

  return (
    <img
      src={FRAMES[i]}
      className={`stop-motion ${className}`.trim()}
      alt=""
      aria-hidden="true"
    />
  );
}
