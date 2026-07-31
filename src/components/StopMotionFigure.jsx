import { useState, useEffect } from 'react';

const introModules = import.meta.glob('../assets/intro-*.png', { eager: true });
const INTRO_FRAMES = Object.entries(introModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, m]) => m.default);

const figureModules = import.meta.glob('../assets/figure-*.png', { eager: true });
const FIGURE_FRAMES = Object.entries(figureModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, m]) => m.default);

// phase: 'static' (flat line, frozen) | 'intro' (play intro→loop) | 'loop' (figure loop only)
export default function StopMotionFigure({ phase = 'loop', fps = 3, introFps = 9, className = '' }) {
  const [src, setSrc] = useState(
    phase === 'loop' ? FIGURE_FRAMES[0] : INTRO_FRAMES[0]
  );

  useEffect(() => {
    if (phase === 'static') {
      setSrc(INTRO_FRAMES[0]);
      return;
    }

    let frames = phase === 'intro' ? INTRO_FRAMES : FIGURE_FRAMES;
    let idx = 0;
    let inIntro = phase === 'intro';
    setSrc(frames[0]);

    let id;
    function tick() {
      idx++;
      if (inIntro && idx >= INTRO_FRAMES.length) {
        frames = FIGURE_FRAMES;
        idx = 0;
        inIntro = false;
      } else {
        idx = idx % frames.length;
      }
      setSrc(frames[idx]);
      id = setTimeout(tick, 1000 / (inIntro ? introFps : fps));
    }
    id = setTimeout(tick, 1000 / (inIntro ? introFps : fps));

    return () => clearTimeout(id);
  }, [phase, fps, introFps]);

  return (
    <img
      src={src}
      className={`stop-motion ${className}`.trim()}
      alt=""
      aria-hidden="true"
    />
  );
}
