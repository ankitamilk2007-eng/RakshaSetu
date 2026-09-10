import React, { useState } from 'react';
import { Play, FastForward, ShieldAlert } from 'lucide-react';
import { STORY_INTRO_DIALOGUES } from '../utils/gameData';
import { soundEngine } from '../audio/synthAudio';

export function CinematicIntro({ onStartGame }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    soundEngine.playClick();
    if (currentSlide < STORY_INTRO_DIALOGUES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      soundEngine.startAmbientMusic();
      onStartGame();
    }
  };

  const handleSkip = () => {
    soundEngine.playClick();
    soundEngine.startAmbientMusic();
    onStartGame();
  };

  const dialogue = STORY_INTRO_DIALOGUES[currentSlide];

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100,
      width: '640px',
      maxWidth: '92vw',
      pointerEvents: 'auto'
    }}>
      <div className="sci-fi-panel" style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff007f', marginBottom: '8px', fontFamily: 'var(--font-header)', letterSpacing: '1px', fontSize: '0.85rem' }}>
          <ShieldAlert size={20} /> FIELD TRANSMISSION :: {dialogue.title}
        </div>

        <p style={{ fontSize: '1rem', color: '#e0f7fc', lineHeight: '1.4', marginBottom: '18px' }}>
          "{dialogue.text}"
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '6px 14px' }} onClick={handleSkip}>
            <FastForward size={14} /> CLOSE BRIEFING
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '6px 16px' }} onClick={handleNext}>
            {currentSlide < STORY_INTRO_DIALOGUES.length - 1 ? 'NEXT TRANSMISSION' : 'BEGIN OPERATION'} <Play size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
