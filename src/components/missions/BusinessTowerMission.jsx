import React, { useState, useEffect } from 'react';
import { Briefcase, TrendingUp, CheckCircle, ShieldAlert, DollarSign, Award, Users } from 'lucide-react';
import { soundEngine } from '../../audio/synthAudio';

export function BusinessTowerMission({ onComplete, onClose }) {
  const [infraTier, setInfraTier] = useState('SINGLE_ZONE'); // SINGLE_ZONE -> MULTI_REGION_HA
  const [securityCompliance, setSecurityCompliance] = useState('BASIC'); // BASIC -> SOC2_ISO27001
  const [rdCapital, setRdCapital] = useState(30); // $30M -> $80M
  const [slaTarget, setSlaTarget] = useState('99.0%'); // 99.0% -> 99.99%

  const [riskScore, setRiskScore] = useState(78); // 78% risk initial
  const [customerTrust, setCustomerTrust] = useState(42); // 42% trust
  const [launchReadiness, setLaunchReadiness] = useState(35);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let risk = 78;
    let trust = 42;
    let readiness = 35;

    if (infraTier === 'MULTI_REGION_HA') {
      risk -= 25;
      trust += 25;
      readiness += 25;
    }
    if (securityCompliance === 'SOC2_ISO27001') {
      risk -= 35;
      trust += 20;
      readiness += 25;
    }
    if (rdCapital >= 75) {
      readiness += 25;
      trust += 10;
    }
    if (slaTarget === '99.99%') {
      risk -= 18;
      trust += 3; // 3% extra
      readiness += 25;
    }

    setRiskScore(Math.max(0, risk));
    setCustomerTrust(Math.min(100, trust));
    setLaunchReadiness(Math.min(100, readiness));

    if (risk <= 5 && trust >= 90 && readiness >= 100) {
      setIsSuccess(true);
      soundEngine.playSuccess();
    }
  }, [infraTier, securityCompliance, rdCapital, slaTarget]);

  const cycleInfraTier = () => {
    soundEngine.playClick();
    const tiers = ['SINGLE_ZONE', 'DUAL_ZONE', 'MULTI_REGION_HA'];
    const idx = (tiers.indexOf(infraTier) + 1) % tiers.length;
    setInfraTier(tiers[idx]);
  };

  const cycleSecurity = () => {
    soundEngine.playClick();
    const tiers = ['BASIC', 'PCI_DSS', 'SOC2_ISO27001'];
    const idx = (tiers.indexOf(securityCompliance) + 1) % tiers.length;
    setSecurityCompliance(tiers[idx]);
  };

  const cycleSla = () => {
    soundEngine.playClick();
    const slas = ['99.0%', '99.9%', '99.99%'];
    const idx = (slas.indexOf(slaTarget) + 1) % slas.length;
    setSlaTarget(slas[idx]);
  };

  return (
    <div className="sci-fi-panel mission-modal">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Briefcase size={32} color="#00ff88" />
          <div>
            <h2 style={{ fontFamily: 'var(--font-header)', color: '#00ff88', fontSize: '1.6rem' }}>
              BUSINESS TOWER: STRATEGIC RESOURCE & RISK ALLOCATION
            </h2>
            <p style={{ color: '#8ab4f8', fontSize: '0.9rem' }}>
              Concept: Enterprise Systems, SLA Commitments, Risk Mitigation & Capital R&D
            </p>
          </div>
        </div>
        <button className="btn-secondary" onClick={onClose}>ABORT</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Executive Resource Matrix */}
        <div style={{ background: 'rgba(3, 8, 20, 0.8)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-header)', fontSize: '1rem', color: '#00ff88', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} /> Interactive Capital & Risk Controls
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Infrastructure Architecture Tier */}
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#8ab4f8' }}>INFRASTRUCTURE REDUNDANCY</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: '#00ff88' }}>{infraTier}</div>
              </div>
              <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px', borderColor: '#00ff88', color: '#00ff88' }} onClick={cycleInfraTier}>
                CYCLE INFRA TIER
              </button>
            </div>

            {/* Cyber Compliance Certification */}
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#8ab4f8' }}>CYBER SECURITY COMPLIANCE</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: '#00ff88' }}>{securityCompliance}</div>
              </div>
              <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px', borderColor: '#00ff88', color: '#00ff88' }} onClick={cycleSecurity}>
                CYCLE SECURITY TIER
              </button>
            </div>

            {/* SLA Target */}
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#8ab4f8' }}>SERVICE LEVEL AGREEMENT (SLA)</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: '#00ff88' }}>{slaTarget} UPTIME</div>
              </div>
              <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px', borderColor: '#00ff88', color: '#00ff88' }} onClick={cycleSla}>
                CYCLE SLA TIER
              </button>
            </div>

            {/* R&D Budget Slider */}
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#8ab4f8', marginBottom: '6px' }}>
                <span>CAPITAL R&D ALLOCATION</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#00ff88' }}>${rdCapital}M USD</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={rdCapital} 
                onChange={(e) => setRdCapital(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#00ff88', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Strategic Dashboard Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: 'rgba(3, 8, 20, 0.8)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-header)', fontSize: '1rem', color: '#00ff88', marginBottom: '15px' }}>
              Strategic Business Telemetry
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: 'var(--font-mono)' }}>
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '4px', borderLeft: `4px solid ${riskScore <= 5 ? '#00ff88' : '#ff0055'}` }}>
                <div style={{ fontSize: '0.75rem', color: '#8ab4f8' }}>COMPLIANCE RISK SCORE</div>
                <div style={{ fontSize: '1.5rem', color: riskScore <= 5 ? '#00ff88' : '#ff0055', fontWeight: '800' }}>{riskScore}%</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '4px', borderLeft: `4px solid ${customerTrust >= 90 ? '#00ff88' : '#ffaa00'}` }}>
                <div style={{ fontSize: '0.75rem', color: '#8ab4f8' }}>CUSTOMER TRUST INDEX</div>
                <div style={{ fontSize: '1.5rem', color: customerTrust >= 90 ? '#00ff88' : '#ffaa00', fontWeight: '800' }}>{customerTrust}%</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '4px', borderLeft: `4px solid ${launchReadiness >= 100 ? '#00ff88' : '#00f3ff'}` }}>
                <div style={{ fontSize: '0.75rem', color: '#8ab4f8' }}>LAUNCH READINESS INDEX</div>
                <div style={{ fontSize: '1.5rem', color: launchReadiness >= 100 ? '#00ff88' : '#00f3ff', fontWeight: '800' }}>{launchReadiness}%</div>
              </div>
            </div>
          </div>

          {isSuccess ? (
            <div style={{ background: 'rgba(0,255,136,0.15)', border: '1px solid #00ff88', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00ff88', fontWeight: '800', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>
                <CheckCircle size={20} /> BUSINESS TOWER STABILIZED!
              </div>
              <p style={{ fontSize: '0.85rem', color: '#e0f7fc', marginBottom: '12px' }}>
                Risk minimized, SLAs guaranteed & 100% Launch Readiness achieved!
              </p>
              <button className="btn-primary" style={{ width: '100%' }} onClick={() => { soundEngine.playSuccess(); onComplete(); }}>
                CONFIRM & RESTORE BUSINESS TOWER
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', color: '#a0ffd0' }}>
              <ShieldAlert size={20} />
              Set Infra to MULTI_REGION_HA, Security to SOC2_ISO27001, SLA to 99.99%, & R&D Budget &gt;= $75M!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
