import { useState, useEffect, useRef } from 'react';
import { getUpcomingStars } from './lib/birthLight';
import HomeScreen from './components/HomeScreen';
import MessageScreen from './components/MessageScreen';
import RevealScreen from './components/RevealScreen';
import CalendarScreen from './components/CalendarScreen';
import StarMap from './components/StarMap';
import StopMotionFigure from './components/StopMotionFigure';

const SWAP_DELAY = 500;
const PAN_DURATION = 2300;

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
  const [contentOut, setContentOut] = useState(false);

  // Continuous pan-up transition: both message + reveal render simultaneously
  const [isPanningUp, setIsPanningUp] = useState(false);
  // Controls star map entrance animation
  const [starMapEntering, setStarMapEntering] = useState(false);

  // Prevent figure transition animation on first paint
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
    // Figure appears at message position without animating up from below
    transition('message', () => {
      setAnimated(false);
      setFigureState('message');
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(true)));
    });
  }

  function handleLookUp() {
    setShowStarMap(true);
    setStarMapEntering(true);
    // Figure slides off the bottom while stars rise
    setFigureState('offscreen');
    setIsPanningUp(true);
    clearT();
    timerRef.current = setTimeout(() => {
      setIsPanningUp(false);
      setStarMapEntering(false);
      setScreen('reveal');
    }, PAN_DURATION);
  }

  function handleBack() {
    localStorage.removeItem('birthlight_birthday');
    setFigureState('home');
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
        <StarMap centerStar={star} extraClass={starMapEntering ? 'starmap-canvas--entering' : ''} />
      )}

      <div className={figureClass} aria-hidden="true">
        <StopMotionFigure />
      </div>

      <div className={`screen-content${contentOut ? ' content-out' : ''}`}>
        {isPanningUp ? (
          // Pan-up: both screens render simultaneously; foregrounds fade, stars/figure do the work
          <>
            <div className="pan-slide pan-slide--out">
              {star && <MessageScreen star={star} onLookUp={() => {}} />}
            </div>
            <div className="pan-slide pan-slide--in">
              {star && (
                <RevealScreen
                  stars={stars}
                  currentIndex={starIdx}
                  onIndexChange={setStarIdx}
                  onBack={handleBack}
                  onCalendar={() => setScreen('calendar')}
                />
              )}
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
