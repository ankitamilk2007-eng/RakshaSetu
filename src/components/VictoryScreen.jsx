import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Zap, RotateCcw, CheckCircle } from 'lucide-react';
import { soundEngine } from '../audio/synthAudio';

export function VictoryScreen({ timeRemaining, onRestart }) {
  useEffect(() => {
    soundEngine.playSuccess();
    // Fire confetti celebration
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  }, []);

  const elapsedSecs = 3600 - timeRemaining;
  const elapsedMins = Math.floor(elapsedSecs / 60);

  return (
    <div className="modal-backdrop">
      <div className="sci-fi-panel" style={{ width: '650px', padding: '40px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
          <Award size={64} color="#00ff88" style={{ filter: 'drop-shadow(0 0 15px #00ff88)' }} />
        </div>

        <h1 style={{ fontFamily: 'var(--font-header)', fontSize: '2.4rem', color: '#00ff88', marginBottom: '10px', textShadow: '0 0 20px rgba(0,255,136,0.6)' }}>
          NEXUS STABILIZED & LAUNCHED!
        </h1>

        <p style={{ fontSize: '1.1rem', color: '#e0f7fc', marginBottom: '25px' }}>
          Outstanding work Field Operator! All 4 key districts have been fully restored and NEXUS 2.0 has successfully launched globally!
        </p>

        <div style={{ background: 'rgba(3,8,20,0.8)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '8px', padding: '20px', marginBottom: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontFamily: 'var(--font-mono)' }}>
          <div style={{ textAlignment: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: '#8ab4f8' }}>TIME REMAINING</div>
            <div style={{ fontSize: '1.6rem', color: '#00f3ff', fontWeight: '800' }}>
              {Math.floor(timeRemaining / 60)} MINS
            </div>
          </div>

          <div style={{ textAlignment: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: '#8ab4f8' }}>CITY STABILITY INDEX</div>
            <div style={{ fontSize: '1.6rem', color: '#00ff88', fontWeight: '800' }}>
              100% SUCCESS
            </div>
          </div>
        </div>

        <button className="btn-primary" style={{ width: '100%', fontSize: '1.1rem', padding: '14px' }} onClick={onRestart}>
          <RotateCcw size={20} style={{ marginRight: '8px' }} /> REPLAY OPERATION
        </button>
      </div>
    </div>
  );
}
