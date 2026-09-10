import React, { useState, useEffect } from 'react';
import { Network, RefreshCw, CheckCircle, ShieldAlert, Cpu, Activity, Zap } from 'lucide-react';
import { soundEngine } from '../../audio/synthAudio';

export function NetworkMission({ onComplete, onClose }) {
  // Graph Nodes
  const [nodes, setNodes] = useState([
    { id: 'GW', label: 'Main Gateway', type: 'source', status: 'active', freq: '10G', angle: 0 },
    { id: 'R1', label: 'Router Alpha (Core)', type: 'router', status: 'blocked', mode: 'DIRECT', freq: '2.4G', angle: 90 },
    { id: 'R2', label: 'Router Beta (Mesh)', type: 'router', status: 'degraded', mode: 'BALANCED', freq: '5G', angle: 180 },
    { id: 'FW', label: 'Cyber Firewall', type: 'firewall', status: 'strict', filter: 'DROP_ALL', angle: 270 },
    { id: 'HUB', label: 'NEXUS Central Hub', type: 'target', status: 'offline', connected: false, angle: 360 }
  ]);

  const [bandwidthLimit, setBandwidthLimit] = useState(40); // 40 Gbps default
  const [firewallRule, setFirewallRule] = useState('STRICT');
  const [activeRoute, setActiveRoute] = useState([]);
  const [packetLoss, setPacketLoss] = useState(85); // 85% loss initially
  const [latency, setLatency] = useState(320); // 320ms initial
  const [throughput, setThroughput] = useState(15);
  const [isSuccess, setIsSuccess] = useState(false);

  // Recalculate network metrics when player changes router configurations
  useEffect(() => {
    let loss = 85;
    let lat = 320;
    let tp = 15;

    const r1 = nodes.find(n => n.id === 'R1');
    const r2 = nodes.find(n => n.id === 'R2');

    if (r1.mode === 'MESH_FORWARD') loss -= 30;
    if (r2.mode === 'OPTIMIZED_CACHE') loss -= 25;
    if (firewallRule === 'ALLOW_NEXUS_TRAFFIC') {
      loss -= 20;
      lat -= 180;
    }
    if (bandwidthLimit >= 80) {
      loss -= 10;
      tp += 65;
      lat -= 90;
    }

    loss = Math.max(0, loss);
    lat = Math.max(12, lat);
    tp = Math.min(100, tp + (100 - loss) * 0.7);

    setPacketLoss(loss);
    setLatency(Math.round(lat));
    setThroughput(Math.round(tp));

    if (loss === 0 && tp >= 80 && lat <= 30) {
      setIsSuccess(true);
      soundEngine.playSuccess();
    }
  }, [nodes, firewallRule, bandwidthLimit]);

  const handleToggleRouterMode = (nodeId) => {
    soundEngine.playClick();
    setNodes(prev => prev.map(node => {
      if (node.id === nodeId) {
        let newMode = 'DIRECT';
        if (node.id === 'R1') {
          newMode = node.mode === 'DIRECT' ? 'MESH_FORWARD' : 'DIRECT';
        } else if (node.id === 'R2') {
          newMode = node.mode === 'BALANCED' ? 'OPTIMIZED_CACHE' : 'BALANCED';
        }
        return { ...node, mode: newMode, status: 'active' };
      }
      return node;
    }));
  };

  const handleFirewallChange = () => {
    soundEngine.playClick();
    const rules = ['DROP_ALL', 'STRICT', 'ALLOW_NEXUS_TRAFFIC'];
    const nextIdx = (rules.indexOf(firewallRule) + 1) % rules.length;
    setFirewallRule(rules[nextIdx]);
  };

  const handleBandwidthChange = (e) => {
    setBandwidthLimit(Number(e.target.value));
  };

  const handleFinish = () => {
    soundEngine.playSuccess();
    onComplete();
  };

  return (
    <div className="sci-fi-panel mission-modal">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Network size={32} color="#00f3ff" />
          <div>
            <h2 style={{ fontFamily: 'var(--font-header)', color: '#00f3ff', fontSize: '1.6rem' }}>
              NETWORK DISTRICT: PACKET ROUTING TOPOLOGY
            </h2>
            <p style={{ color: '#8ab4f8', fontSize: '0.9rem' }}>
              Concept: Graph Routing Algorithms, Firewalls & Subnet Bandwidth Control
            </p>
          </div>
        </div>
        <button className="btn-secondary" onClick={onClose}>ABORT</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Interactive Topology Graph */}
        <div style={{ background: 'rgba(3, 8, 20, 0.8)', border: '1px solid rgba(0,243,255,0.3)', borderRadius: '8px', padding: '20px', position: 'relative', minHeight: '340px' }}>
          <h3 style={{ fontFamily: 'var(--font-header)', fontSize: '1rem', color: '#00f3ff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} /> Interactive Node Topology Matrix
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {nodes.map(node => (
              <div 
                key={node.id}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: node.id === 'HUB' ? 'rgba(0, 243, 255, 0.1)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${node.id === 'HUB' ? '#00f3ff' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: node.id === 'FW' ? '#ff0055' : node.id === 'HUB' ? (isSuccess ? '#00ff88' : '#ffaa00') : '#00f3ff' }} />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{node.label}</div>
                    <div style={{ fontSize: '0.8rem', color: '#8ab4f8', fontFamily: 'var(--font-mono)' }}>ID: {node.id} | Mode: {node.mode || firewallRule}</div>
                  </div>
                </div>

                {node.type === 'router' && (
                  <button 
                    className="btn-secondary" 
                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                    onClick={() => handleToggleRouterMode(node.id)}
                  >
                    SWITCH ROUTE ({node.mode})
                  </button>
                )}
                {node.type === 'firewall' && (
                  <button 
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '6px 12px', borderColor: '#ff0055', color: '#ff0055' }}
                    onClick={handleFirewallChange}
                  >
                    RULE: {firewallRule}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Real-time System Metrics & Control Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: 'rgba(3, 8, 20, 0.8)', border: '1px solid rgba(0,243,255,0.3)', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-header)', fontSize: '1rem', color: '#00f3ff', marginBottom: '15px' }}>
              Subnet Bandwidth Limit
            </h3>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={bandwidthLimit} 
              onChange={handleBandwidthChange}
              style={{ width: '100%', accentColor: '#00f3ff', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#8ab4f8', marginTop: '6px' }}>
              <span>Capacity: {bandwidthLimit} Gbps</span>
              <span>Target: 100 Gbps</span>
            </div>
          </div>

          <div style={{ background: 'rgba(3, 8, 20, 0.8)', border: '1px solid rgba(0,243,255,0.3)', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-header)', fontSize: '1rem', color: '#00f3ff', marginBottom: '12px' }}>
              Telemetry Diagnostics
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontFamily: 'var(--font-mono)' }}>
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '4px', borderLeft: `3px solid ${packetLoss === 0 ? '#00ff88' : '#ff0055'}` }}>
                <div style={{ fontSize: '0.75rem', color: '#8ab4f8' }}>PACKET LOSS</div>
                <div style={{ fontSize: '1.4rem', color: packetLoss === 0 ? '#00ff88' : '#ff0055', fontWeight: '800' }}>{packetLoss}%</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '4px', borderLeft: `3px solid ${latency <= 30 ? '#00ff88' : '#ffaa00'}` }}>
                <div style={{ fontSize: '0.75rem', color: '#8ab4f8' }}>LATENCY</div>
                <div style={{ fontSize: '1.4rem', color: latency <= 30 ? '#00ff88' : '#ffaa00', fontWeight: '800' }}>{latency} ms</div>
              </div>
            </div>

            <div style={{ marginTop: '12px', background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '4px', borderLeft: `3px solid ${throughput >= 80 ? '#00ff88' : '#00f3ff'}` }}>
              <div style={{ fontSize: '0.75rem', color: '#8ab4f8', fontFamily: 'var(--font-mono)' }}>NETWORK THROUGHPUT</div>
              <div style={{ fontSize: '1.4rem', color: '#00f3ff', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>{throughput} Gbps</div>
            </div>
          </div>

          {isSuccess ? (
            <div style={{ background: 'rgba(0,255,136,0.15)', border: '1px solid #00ff88', borderRadius: '8px', padding: '16px', textAlignment: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00ff88', fontWeight: '800', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>
                <CheckCircle size={20} /> NETWORK TOPOLOGY STABILIZED!
              </div>
              <p style={{ fontSize: '0.85rem', color: '#e0f7fc', marginBottom: '12px' }}>
                Packet loss reduced to 0%. Optical routes fully online.
              </p>
              <button className="btn-primary" style={{ width: '100%' }} onClick={handleFinish}>
                CONFIRM & RESTORE DISTRICT
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,0,85,0.1)', border: '1px solid rgba(255,0,85,0.3)', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', color: '#ff88aa' }}>
              <ShieldAlert size={20} />
              Set Router Alpha to MESH_FORWARD, Router Beta to OPTIMIZED_CACHE, Firewall to ALLOW_NEXUS_TRAFFIC, & max Bandwidth!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
