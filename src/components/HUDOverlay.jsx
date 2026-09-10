import React from 'react';
import { Volume2, VolumeX, Pause, Compass, Zap, Shield, CheckCircle, Navigation } from 'lucide-react';
import { soundEngine } from '../audio/synthAudio';
import { DISTRICTS } from '../utils/gameData';

export function HUDOverlay({ 
  timeRemaining, 
  stability, 
  districtStates, 
  activeObjective, 
  playerPos, 
  isMuted, 
  onToggleMute, 
  onPause 
}) {
  // Format seconds into MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Convert 3D world coords [x, y, z] to minimap coords relative to center (0,0)
  const mapScale = 0.8; // Scale factor for minimap display

  return (
    <div className="hud-overlay">
      {/* Top Header Row */}
      <div className="hud-header">
        <div className="brand-badge">
          <Zap color="#00f3ff" size={28} />
          <span>NEXUS 2.0</span>
        </div>

        {/* Live 60-Minute Countdown Clock */}
        <div className="sci-fi-panel timer-box">
          <span className="timer-label">TIME TO LAUNCH</span>
          <span className="timer-clock">{formatTime(timeRemaining)}</span>
        </div>

        {/* City Stability Meter */}
        <div className="sci-fi-panel stability-bar-container">
          <div className="stability-header">
            <span>CITY STABILITY</span>
            <span>{stability}%</span>
          </div>
          <div className="stability-track">
            <div className="stability-fill" style={{ width: `${stability}%` }} />
          </div>
        </div>

        {/* Quick Controls */}
        <div style={{ display: 'flex', gap: '10px', pointerEvents: 'auto' }}>
          <button className="btn-secondary" style={{ padding: '8px 12px' }} onClick={onToggleMute}>
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button className="btn-secondary" style={{ padding: '8px 12px' }} onClick={onPause}>
            <Pause size={18} />
          </button>
        </div>
      </div>

      {/* Main HUD Body (Objectives & Minimap) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
        {/* Left Objective Tracker */}
        <div className="sci-fi-panel" style={{ width: '320px', padding: '16px', pointerEvents: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-header)', color: '#00f3ff', marginBottom: '10px', fontSize: '0.9rem' }}>
            <Compass size={18} /> ACTIVE FIELD OBJECTIVE
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>
            {activeObjective}
          </div>

          {/* District Completion List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {Object.values(DISTRICTS).map(d => (
              <div 
                key={d.id}
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                  padding: '4px 8px',
                  background: districtStates[d.id] ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.04)',
                  borderRadius: '4px',
                  borderLeft: `3px solid ${districtStates[d.id] ? '#00ff88' : d.color}`
                }}
              >
                <span>{d.name}</span>
                <span style={{ color: districtStates[d.id] ? '#00ff88' : '#8ab4f8', fontFamily: 'var(--font-mono)' }}>
                  {districtStates[d.id] ? 'STABILIZED ✓' : 'ONLINE'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Radar Minimap */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
          <div className="minimap-panel">
            <div className="minimap-radar-line" />
            {/* Player Center Dot */}
            <div className="minimap-player-dot" />

            {/* Render District Markers on Minimap */}
            {Object.values(DISTRICTS).map(d => {
              const [dx, dy, dz] = d.position;
              // Map 3D coords relative to player position
              const relX = (dx - playerPos[0]) * mapScale + 80;
              const relZ = (dz - playerPos[2]) * mapScale + 80;

              // Keep within minimap circular bounds
              if (relX >= 10 && relX <= 150 && relZ >= 10 && relZ <= 150) {
                return (
                  <div 
                    key={d.id}
                    className="minimap-marker"
                    style={{
                      left: `${relX}px`,
                      top: `${relZ}px`,
                      background: districtStates[d.id] ? '#00ff88' : d.color,
                      boxShadow: `0 0 6px ${d.color}`
                    }}
                  />
                );
              }
              return null;
            })}
          </div>

          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#8ab4f8', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '4px' }}>
            POS: X:{Math.round(playerPos[0])} Z:{Math.round(playerPos[2])}
          </div>
        </div>
      </div>

      {/* Screen Center Crosshair */}
      <div className="crosshair" />

      {/* Bottom Controls Hint Footer */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: '#8ab4f8', background: 'rgba(5,12,28,0.7)', padding: '6px 20px', borderRadius: '20px', alignSelf: 'center' }}>
        <span>WASD: Move</span>
        <span>SHIFT: Sprint</span>
        <span>Mouse: Orbit Camera</span>
        <span>E: Interact</span>
        <span>ESC: Pause</span>
      </div>
    </div>
  );
}
