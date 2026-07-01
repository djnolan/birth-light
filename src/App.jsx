import { useState, useEffect, useRef } from 'react';
import { getUpcomingStars } from './lib/birthLight';
import HomeScreen from './components/HomeScreen';
import MessageScreen from './components/MessageScreen';
import RevealScreen from './components/RevealScreen';
import CalendarScreen from './components/CalendarScreen';
import StarMap from './components/StarMap';
import StopMotionFigure from './components/StopMotionFigure';

const SWAP_DELAY = 600; // ms — wait for content fade before swapping screen

export default function App() {
  const [stars, setStars] = useState(() => {
    const saved = localStorage.getItem('birthlight_birthday');
    return saved ? getUpcomingStars(saved) : [];
  });
  const [starIdx, setStarIdx] = useState(0);

  const [screen, setScreen] = useState(() =>
    localStorage.getItem('birthlight_birthday') ? 'reveal' : 'home'
  );

  // 'home' | 'message' | 'offscreen'
  const [figureState, setFigureState] = useState(() =>
    localStorage.getItem('birthlight_birthday') ? 'offscreen' : 'home'
  );

  const [showStarMap, setShowStarMap] = useState(() =>
    !!localStorage.getItem('birthlight_birthday')
  );
  const [starMapEntering, setStarMapEntering] = useState(false);
  const [contentOut, setContentOut] = useState(false);

  // Prevent transition animation on first paint
  const [animated, setAnimated] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setAnimated(true)); }, []);

  const timerRef = useRef(null);
  function clearT() { if (timerRef.current) clearTimeout(timerRef.current); }

  // Fade out content → swap screen → fade in new content
  function transition(nextScreen, onSwap) {
    setContentOut(true);
    clearT();
    timerRef.current = setTimeout(() => {
      setScreen(nextScreen);
      onSwap?.();
      setTimeout(() => setContentOut(false), 30);
    }, SWAP_DELAY);
  }

  function handleBirthday(bd) {
    localStorage.setItem('birthlight_birthday', bd);
    const upcoming = getUpcomingStars(bd);
    setStars(upcoming);
    setStarIdx(0);
    setFigureState('message'); // begin zoom immediately
    transition('message');
  }

  function handleLookUp() {
    setFigureState('offscreen'); // begin slide-down immediately
    transition('reveal', () => {
      setShowStarMap(true);
      setStarMapEntering(true);
      setTimeout(() => setStarMapEntering(false), 800);
    });
  }

  function handleBack() {
    localStorage.removeItem('birthlight_birthday');
    setFigureState('home'); // begin slide-up immediately
    transition('home', () => {
      setShowStarMap(false);
      setStars([]);
    });
  }

  function handleStarSelect(idx) {
    setStarIdx(idx);
    setScreen('reveal');
  }

  const star = stars[starIdx];

  const figureClass = [
    'figure-layer',
    `figure-layer--${figureState}`,
    animated ? 'figure-layer--animated' : '',
  ].join(' ');

  return (
    <div className="app">
      {showStarMap && star && (
        <StarMap
          centerStar={star}
          extraClass={starMapEntering ? 'starmap-canvas--entering' : ''}
        />
      )}

      <div className={figureClass} aria-hidden="true">
        <StopMotionFigure />
      </div>

      <div className={`screen-content${contentOut ? ' content-out' : ''}`}>
        {screen === 'home' && (
          <HomeScreen onSubmit={handleBirthday} />
        )}
        {screen === 'message' && star && (
          <MessageScreen star={star} onLookUp={handleLookUp} />
        )}
        {screen === 'reveal' && star && (
          <RevealScreen
            stars={stars}
            currentIndex={starIdx}
            onIndexChange={setStarIdx}
            onBack={handleBack}
            onCalendar={() => setScreen('calendar')}
          />
        )}
        {screen === 'calendar' && (
          <CalendarScreen
            stars={stars}
            onClose={() => setScreen('reveal')}
            onStarSelect={handleStarSelect}
          />
        )}
      </div>
    </div>
  );
}
