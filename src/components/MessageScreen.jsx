import { getRevealText } from '../lib/birthLight';

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

      {/* Reserves space for the fixed figure-layer below */}
      <div className="figure-spacer" />
    </div>
  );
}
