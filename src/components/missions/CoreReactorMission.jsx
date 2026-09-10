import React, { useState, useEffect } from 'react';
import { Cpu, Flame, CheckCircle, ShieldAlert, Zap, RefreshCw } from 'lucide-react';
import { soundEngine } from '../../audio/synthAudio';

export function CoreReactorMission({ onComplete, onClose }) {
  const [schedulerPolicy, setSchedulerPolicy] = useState('FIFO'); // FIFO -> PRIORITY_PREEMPTIVE
  const [coreBalancing, setCoreBalancing] = useState('UNBALANCED'); // UNBALANCED -> MULTI_CORE_SYMMETRIC
  const [deadlockResolved, setDeadlockResolved] = useState(false);
  const [quantumTime, setQuantumTime] = useState(10); // 10ms -> 4ms optimal

  const [coreTemp, setCoreTemp] = useState(98); // 98°C critical initially
  const [cpuUtilization, setCpuUtilization] = useState(35); // 35% utilization
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let temp = 98;
    let util = 35;

    if (schedulerPolicy === 'PRIORITY_PREEMPTIVE') {
      temp -= 25;
      util += 25;
    }
    if (coreBalancing === 'MULTI_CORE_SYMMETRIC') {
      temp -= 30;
      util += 25;
    }
    if (deadlockResolved) {
      temp -= 20;
      util += 15;
    }
    if (quantumTime <= 4) {
      temp -= 10;
      util += 0;
    }

    setCoreTemp(Math.max(45, temp));
    setCpuUtilization(Math.min(100, util));

    if (temp <= 50 && util >= 95 && deadlockResolved) {
      setIsSuccess(true);
      soundEngine.playSuccess();
    }
  }, [schedulerPolicy, coreBalancing, deadlockResolved, quantumTime]);

  const cyclePolicy = () => {
    soundEngine.playClick();
    const policies = ['FIFO', 'ROUND_ROBIN', 'PRIORITY_PREEMPTIVE'];
    const idx = (policies.indexOf(schedulerPolicy) + 1) % policies.length;
    setSchedulerPolicy(policies[idx]);
  };

  const cycleBalancing = () => {
    soundEngine.playClick();
    const modes = ['UNBALANCED', 'SINGLE_THREAD', 'MULTI_CORE_SYMMETRIC'];
    const idx = (modes.indexOf(coreBalancing) + 1) % modes.length;
    setCoreBalancing(modes[idx]);
  };

  const toggleDeadlock = () => {
    soundEngine.playClick();
    setDeadlockResolved(prev => !prev);
  };

  return (
    <div className="sci-fi-panel mission-modal">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Cpu size={32} color="#ff007f" />
          <div>
            <h2 style={{ fontFamily: 'var(--font-header)', color: '#ff007f', fontSize: '1.6rem' }}>
              CORE REACTOR: CPU PROCESS SCHEDULER
            </h2>
            <p style={{ color: '#8ab4f8', fontSize: '0.9rem' }}>
              Concept: OS Process Scheduling, Symmetric Multiprocessing & Deadlock Preemption
            </p>
          </div>
        </div>
        <button className="btn-secondary" onClick={onClose}>ABORT</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Core Scheduler Configuration */}
        <div style={{ background: 'rgba(3, 8, 20, 0.8)', border: '1px solid rgba(255,0,127,0.3)', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-header)', fontSize: '1rem', color: '#ff007f', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} /> Interactive CPU Core Allocation
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Scheduler Algorithm */}
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#8ab4f8' }}>SCHEDULER ALGORITHM</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: '#ff007f' }}>{schedulerPolicy}</div>
              </div>
              <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px', borderColor: '#ff007f', color: '#ff007f' }} onClick={cyclePolicy}>
                CHANGE ALGORITHM
              </button>
            </div>

            {/* Core Load Balancing */}
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#8ab4f8' }}>SMP LOAD BALANCER</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: '#ff007f' }}>{coreBalancing}</div>
              </div>
              <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px', borderColor: '#ff007f', color: '#ff007f' }} onClick={cycleBalancing}>
                BALANCER MODE
              </button>
            </div>

            {/* Deadlock Detection */}
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#8ab4f8' }}>MUTEX DEADLOCK LOCK</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: deadlockResolved ? '#00ff88' : '#ff0055' }}>
                  {deadlockResolved ? 'THREAD MUTEX RESOLVED ✓' : 'DEADLOCK DETECTED (PID 4028)'}
                </div>
              </div>
              <button 
                className="btn-secondary" 
                style={{ borderColor: deadlockResolved ? '#00ff88' : '#ff0055', color: deadlockResolved ? '#00ff88' : '#ff0055', fontSize: '0.8rem', padding: '6px 12px' }}
                onClick={toggleDeadlock}
              >
                {deadlockResolved ? 'CLEARED' : 'PREEMPT DEADLOCK'}
              </button>
            </div>

            {/* Quantum Time Slice */}
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#8ab4f8', marginBottom: '6px' }}>
                <span>CPU TIME QUANTUM SLICE</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#ff007f' }}>{quantumTime} ms</span>
              </div>
              <input 
                type="range" 
                min="2" 
                max="20" 
                value={quantumTime} 
                onChange={(e) => setQuantumTime(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#ff007f', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Telemetry Diagnostics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: 'rgba(3, 8, 20, 0.8)', border: '1px solid rgba(255,0,127,0.3)', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-header)', fontSize: '1rem', color: '#ff007f', marginBottom: '15px' }}>
              Thermal & Core Metrics
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: 'var(--font-mono)' }}>
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '4px', borderLeft: `4px solid ${coreTemp <= 50 ? '#00ff88' : '#ff0055'}` }}>
                <div style={{ fontSize: '0.75rem', color: '#8ab4f8' }}>CORE TEMPERATURE</div>
                <div style={{ fontSize: '1.6rem', color: coreTemp <= 50 ? '#00ff88' : '#ff0055', fontWeight: '800' }}>{coreTemp} °C</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '4px', borderLeft: `4px solid ${cpuUtilization >= 90 ? '#00ff88' : '#ffaa00'}` }}>
                <div style={{ fontSize: '0.75rem', color: '#8ab4f8' }}>CPU UTILIZATION EFFICENCY</div>
                <div style={{ fontSize: '1.6rem', color: cpuUtilization >= 90 ? '#00ff88' : '#ffaa00', fontWeight: '800' }}>{cpuUtilization}%</div>
              </div>
            </div>
          </div>

          {isSuccess ? (
            <div style={{ background: 'rgba(0,255,136,0.15)', border: '1px solid #00ff88', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00ff88', fontWeight: '800', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>
                <CheckCircle size={20} /> CORE REACTOR STABILIZED!
              </div>
              <p style={{ fontSize: '0.85rem', color: '#e0f7fc', marginBottom: '12px' }}>
                Thermal load reduced to 45°C. SMP preemption active and deadlock resolved.
              </p>
              <button className="btn-primary" style={{ width: '100%' }} onClick={() => { soundEngine.playSuccess(); onComplete(); }}>
                CONFIRM & RESTORE REACTOR
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,0,127,0.1)', border: '1px solid rgba(255,0,127,0.3)', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', color: '#ff88cc' }}>
              <ShieldAlert size={20} />
              Set Algorithm to PRIORITY_PREEMPTIVE, Balancer to MULTI_CORE_SYMMETRIC, Preempt Deadlock, & Quantum &lt;= 4ms!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
