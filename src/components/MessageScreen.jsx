import { useEffect, useRef } from 'react';
import { getRevealText } from '../lib/birthLight';
import { panProgress } from '../lib/lookUpTimeline';

// When the camera pans up, the text stays put and drops away with the
// scene. It moves a bit faster than the eye (which moves 1×) and some of
// the stars, so the layers don't all slide at the same speed.
const TEXT_PARALLAX = 1.3;

// The "look up" button is the eye (see EyeButton in App).
export default function MessageScreen({ star, panStartAt = null }) {
  const text = getRevealText(star, star.revealVariant);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (panStartAt == null) return;
    let id;
    function frame(now) {
      const offset = panProgress(now, panStartAt) * window.innerHeight * TEXT_PARALLAX;
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
