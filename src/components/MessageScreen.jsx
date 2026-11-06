import { useEffect, useRef } from 'react';
import { getRevealText } from '../lib/birthLight';
import { panProgress } from '../lib/lookUpTimeline';

// When the camera pans up, the text drops away with the scene, a little
// faster than the eye (which moves 1×), for some parallax between the
// layers. The stars move 1–1.45× depending on brightness.
const TEXT_PARALLAX = 1.15;

// The "look up" button is the eye (see EyeButton in App).
export default function MessageScreen({ star, panStartAt = null }) {
  const text = getRevealText(star, star.revealVariant);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (panStartAt == null) return;
    let id;
    const travel = window.innerHeight * TEXT_PARALLAX;
    function frame(now) {
      const offset = panProgress(now, panStartAt) * travel;
      if (bodyRef.current) bodyRef.current.style.transform = `translateY(${offset.toFixed(1)}px)`;
      id = requestAnimationFrame(frame);
    }
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [panStartAt]);

  return (
    <div className="message-screen">
      <div className="message-body" ref={bodyRef}>
        <p className="message-text">{text}</p>
      </div>
    </div>
  );
}
