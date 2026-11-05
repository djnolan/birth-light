import { useState, useRef, useEffect } from 'react';
import { getUpcomingStars } from './lib/birthLight';
import { PAN_AT, PAN_MS, REVEAL_AT, LOOK_UP_END } from './lib/lookUpTimeline';
import HomeScreen from './components/HomeScreen';
import MessageScreen from './components/MessageScreen';
import RevealScreen from './components/RevealScreen';
import CalendarScreen from './components/CalendarScreen';
import StarMap from './components/StarMap';
import EyeButton from './components/EyeButton';
import StarRays from './components/StarRays';

const SWAP_DELAY = 500;

export default function App() {
  const hasSaved = () => !!localStorage.getItem('birthlight_birthday');

  const [stars, setStars] = useState(() => {
    const saved = localStorage.getItem('birthlight_birthday');
    return saved ? getUpcomingStars(saved) : [];
  });
  const [starIdx, setStarIdx] = useState(0);
  const [screen, setScreen] = useState(() => (hasSaved() ? 'reveal' : 'home'));

  // Eye: 'closed' (home) | 'open' (message) | 'up' (look-up sequence)
  const [eyeState, setEyeState] = useState(() => (hasSaved() ? 'up' : 'closed'));
  // 'in' (on screen) | 'out' (below the screen)
  const [eyePosition, setEyePosition] = useState(() => (hasSaved() ? 'out' : 'in'));

  const [showStarMap, setShowStarMap] = useState(hasSaved);
  const [contentOut, setContentOut] = useState(false);

  // Look-up sequence (message → reveal): start time, or null when idle
  const [lookUpAt, setLookUpAt] = useState(null);
  const [isPanningUp, setIsPanningUp] = useState(false);
  const [revealEntering, setRevealEntering] = useState(false);

  const [pendingDate, setPendingDate] = useState('');
  const frameRef = useRef(null);

  const timersRef = useRef([]);
  function later(fn, ms) { timersRef.current.push(setTimeout(fn, ms)); }
  function clearTimers() { timersRef.current.forEach(clearTimeout); timersRef.current = []; }
  useEffect(() => clearTimers, []);

  function transition(nextScreen, onSwap) {
    setContentOut(true);
    clearTimers();
    later(() => {
      setScreen(nextScreen);
      onSwap?.();
      later(() => setContentOut(false), 30);
    }, SWAP_DELAY);
  }

  function handleBirthday(bd) {
    localStorage.setItem('birthlight_birthday', bd);
    setStars(getUpcomingStars(bd));
    setStarIdx(0);
    setEyeState('open');
    transition('message');
  }

  function handleLookUp() {
    clearTimers();
    const t0 = performance.now();
    setLookUpAt(t0);
    setEyeState('up');
    later(() => {
      setShowStarMap(true);
      setIsPanningUp(true);
    }, PAN_AT);
    later(() => setIsPanningUp(false), PAN_AT + PAN_MS);
    later(() => {
      setRevealEntering(true);
      setScreen('reveal');
    }, REVEAL_AT);
    later(() => {
      setLookUpAt(null);
      setEyePosition('out');
    }, LOOK_UP_END);
    later(() => setRevealEntering(false), REVEAL_AT + 1200);
  }

  function handleEyeClick() {
    if (screen === 'home') {
      if (pendingDate) handleBirthday(pendingDate);
    } else if (screen === 'message' && lookUpAt == null) {
      handleLookUp();
    }
  }

  function handleBack() {
    localStorage.removeItem('birthlight_birthday');
    transition('home', () => {
      setShowStarMap(false);
      setStars([]);
      setPendingDate('');
      setLookUpAt(null);
      setIsPanningUp(false);
      setRevealEntering(false);
      setEyeState('closed');
      setEyePosition('in');
    });
  }

  function handleStarSelect(idx) {
    setStarIdx(idx);
    setScreen('reveal');
  }

  const star = stars[starIdx];
  const panStartAt = lookUpAt != null ? lookUpAt + PAN_AT : null;

  const revealScreen = star && (
    <RevealScreen
      stars={stars}
      currentIndex={starIdx}
      onIndexChange={setStarIdx}
      onBack={handleBack}
      onCalendar={() => setScreen('calendar')}
    />
  );

  return (
    <div className="app">
      {showStarMap && star && (
        <StarMap
          centerStar={star}
          isPanning={isPanningUp}
          panDuration={PAN_MS}
          panStartAt={panStartAt}
        />
      )}

      <div className={`screen-content${contentOut ? ' content-out' : ''}`}>
        {screen === 'home' && (
          <HomeScreen
            onSubmit={handleBirthday}
            onDateChange={setPendingDate}
          />
        )}
        {screen === 'message' && star && (
          <MessageScreen star={star} leaving={lookUpAt != null} />
        )}
        {screen === 'reveal' && (
          <div className={`reveal-wrap${revealEntering ? ' reveal-wrap--entering' : ''}`}>
            {revealScreen}
          </div>
        )}
        {screen === 'calendar' && (
          <CalendarScreen
            stars={stars}
            onClose={() => setScreen('reveal')}
            onStarSelect={handleStarSelect}
          />
        )}
      </div>

      <div className="art-frame" ref={frameRef}>
        {lookUpAt != null && star && (
          <StarRays startedAt={lookUpAt} starMag={star.mag} frameRef={frameRef} />
        )}
        <EyeButton
          state={eyeState}
          position={eyePosition}
          panStartAt={panStartAt}
          disabled={screen === 'home' && !pendingDate}
          frameRef={frameRef}
          onClick={handleEyeClick}
          label={screen === 'home' ? 'Begin' : 'Look up at the stars'}
        />
      </div>
    </div>
  );
}
