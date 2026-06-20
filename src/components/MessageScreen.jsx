import { useState, useEffect } from 'react';
import { getRevealText } from '../lib/birthLight';

// Placeholder frame — user will supply stop-motion SVG frames
const FRAME_1 = (
  <svg viewBox="0 0 200 265" width="100%" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    {/* Head */}
    <ellipse cx="100" cy="76" rx="51" ry="60" />
    {/* Neck */}
    <path d="M82 132 Q80 148 76 160" />
    <path d="M118 132 Q120 148 124 160" />
    {/* Shoulders */}
    <path d="M76 160 Q52 170 22 194 Q10 204 0 222" />
    <path d="M124 160 Q148 170 178 194 Q190 204 200 222" />
    {/* Collar */}
    <path d="M76 160 Q88 178 100 180 Q112 178 124 160" />
  </svg>
);

const DEFAULT_FRAMES = [FRAME_1];

function StopMotionFigure({ frames = DEFAULT_FRAMES, fps = 5 }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (frames.length <= 1) return;
    const id = setInterval(() => setI(n => (n + 1) % frames.length), 1000 / fps);
    return () => clearInterval(id);
  }, [frames, fps]);
  return <div className="figure-frame">{frames[i]}</div>;
}

export default function MessageScreen({ star, onLookUp }) {
  const text = getRevealText(star, star.revealVariant);

  return (
    <div className="message-screen">
      <button className="lookup-btn" onClick={onLookUp} aria-label="Look up at the stars">
        <span className="lookup-arrow">↑</span>
        <span className="lookup-label">look up</span>
      </button>

      <div className="message-body">
        <p className="message-text">{text}</p>
      </div>

      <div className="figure-area" aria-hidden="true">
        <StopMotionFigure />
      </div>
    </div>
  );
}
