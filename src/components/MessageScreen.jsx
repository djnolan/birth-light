import { getRevealText } from '../lib/birthLight';

// The "look up" button is the eye (see EyeButton in App).
export default function MessageScreen({ star, leaving = false }) {
  const text = getRevealText(star, star.revealVariant);

  return (
    <div className={`message-screen${leaving ? ' message-screen--leaving' : ''}`}>
      <div className="message-body">
        <p className="message-text">{text}</p>
      </div>
    </div>
  );
}
