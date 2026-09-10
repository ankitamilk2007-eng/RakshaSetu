import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Keyboard } from 'lucide-react';
import { soundEngine } from '../audio/synthAudio';

export function PauseMenu({ isMuted, onToggleMute, onResume, onRestart }) {
  return (
    <div className="modal-backdrop">
      <div className="sci-fi-panel" style={{ width: '550px', padding: '35px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-header)', fontSize: '2rem', color: '#00f3ff', marginBottom: '20px' }}>
          MISSION PAUSED
        </h2>

        {/* Controls Reference */}
        <div style={{ background: 'rgba(3,8,20,0.8)', border: '1px solid rgba(0,243,255,0.3)', borderRadius: '8px', padding: '20px', marginBottom: '25px', textAlignment: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-header)', color: '#00f3ff', marginBottom: '12px', fontSize: '0.95rem' }}>
            <Keyboard size={18} /> OPERATOR CONTROLS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
            <div><span style={{ color: '#00f3ff' }}>WASD:</span> Move Avatar</div>
            <div><span style={{ color: '#00f3ff' }}>SHIFT:</span> Sprint Boost</div>
            <div><span style={{ color: '#00f3ff' }}>Mouse:</span> Orbit Camera</div>
            <div><span style={{ color: '#00f3ff' }}>E:</span> Interact / Enter District</div>
            <div><span style={{ color: '#00f3ff' }}>ESC:</span> Pause Menu</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={onResume}>
            <Play size={18} /> RESUME STABILIZATION
          </button>
          
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={onToggleMute}>
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />} {isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}
          </button>

          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderColor: '#ff0055', color: '#ff0055' }} onClick={onRestart}>
            <RotateCcw size={18} /> RESTART MISSION
          </button>
        </div>
      </div>
    </div>
  );
}
