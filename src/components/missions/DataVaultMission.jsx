import React, { useState, useEffect } from 'react';
import { Database, Link, CheckCircle, ShieldAlert, Key, Server, Lock } from 'lucide-react';
import { soundEngine } from '../../audio/synthAudio';

export function DataVaultMission({ onComplete, onClose }) {
  // Relational Tables and Key Mappings
  const [relations, setRelations] = useState({
    userKeyMatch: false,
    transactionKeyMatch: false,
    indexMode: 'NONE', // NONE -> B_TREE
    isolationLevel: 'READ_UNCOMMITTED' // READ_UNCOMMITTED -> SERIALIZABLE
  });

  const [dbIntegrity, setDbIntegrity] = useState(25); // 25% integrity initially
  const [queryLatency, setQueryLatency] = useState(840); // 840ms initial
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let integrity = 25;
    let lat = 840;

    if (relations.userKeyMatch) {
      integrity += 30;
      lat -= 300;
    }
    if (relations.transactionKeyMatch) {
      integrity += 25;
      lat -= 250;
    }
    if (relations.indexMode === 'B_TREE_CLUSTERED') {
      integrity += 20;
      lat -= 200;
    }
    if (relations.isolationLevel === 'REPEATABLE_READ_ACID') {
      integrity += 20;
      lat -= 70;
    }

    setDbIntegrity(integrity);
    setQueryLatency(Math.max(15, lat));

    if (integrity >= 100 && lat <= 20) {
      setIsSuccess(true);
      soundEngine.playSuccess();
    }
  }, [relations]);

  const toggleUserRelation = () => {
    soundEngine.playClick();
    setRelations(prev => ({ ...prev, userKeyMatch: !prev.userKeyMatch }));
  };

  const toggleTransactionRelation = () => {
    soundEngine.playClick();
    setRelations(prev => ({ ...prev, transactionKeyMatch: !prev.transactionKeyMatch }));
  };

  const cycleIndexMode = () => {
    soundEngine.playClick();
    const modes = ['NONE', 'HASH_INDEX', 'B_TREE_CLUSTERED'];
    const idx = (modes.indexOf(relations.indexMode) + 1) % modes.length;
    setRelations(prev => ({ ...prev, indexMode: modes[idx] }));
  };

  const cycleIsolationLevel = () => {
    soundEngine.playClick();
    const levels = ['READ_UNCOMMITTED', 'READ_COMMITTED', 'REPEATABLE_READ_ACID'];
    const idx = (levels.indexOf(relations.isolationLevel) + 1) % levels.length;
    setRelations(prev => ({ ...prev, isolationLevel: levels[idx] }));
  };

  return (
    <div className="sci-fi-panel mission-modal">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Database size={32} color="#ffaa00" />
          <div>
            <h2 style={{ fontFamily: 'var(--font-header)', color: '#ffaa00', fontSize: '1.6rem' }}>
              DATA VAULT: RELATIONAL SCHEMA RECONSTRUCTION
            </h2>
            <p style={{ color: '#8ab4f8', fontSize: '0.9rem' }}>
              Concept: Primary/Foreign Keys, B-Tree Indexing & ACID Transactions
            </p>
          </div>
        </div>
        <button className="btn-secondary" onClick={onClose}>ABORT</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Schema Relationship Builder */}
        <div style={{ background: 'rgba(3, 8, 20, 0.8)', border: '1px solid rgba(255,170,0,0.3)', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-header)', fontSize: '1rem', color: '#ffaa00', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link size={18} /> Interactive Relational Schema Matrix
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Foreign Key 1 */}
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.85rem', color: '#8ab4f8', marginBottom: '6px' }}>TABLE: `users` ↔ `sessions`</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                  {relations.userKeyMatch ? 'FOREIGN KEY (user_id) REFERENCES users(id) [CONNECTED]' : 'ORPHANED FOREIGN KEY (user_id)'}
                </span>
                <button 
                  className="btn-secondary" 
                  style={{ borderColor: relations.userKeyMatch ? '#00ff88' : '#ffaa00', color: relations.userKeyMatch ? '#00ff88' : '#ffaa00', fontSize: '0.8rem', padding: '4px 10px' }}
                  onClick={toggleUserRelation}
                >
                  {relations.userKeyMatch ? 'LINKED ✓' : 'LINK KEYS'}
                </button>
              </div>
            </div>

            {/* Foreign Key 2 */}
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.85rem', color: '#8ab4f8', marginBottom: '6px' }}>TABLE: `vault_logs` ↔ `access_keys`</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                  {relations.transactionKeyMatch ? 'FOREIGN KEY (vault_id) REFERENCES vault(id) [CONNECTED]' : 'DANGLING REFERENCE (vault_id)'}
                </span>
                <button 
                  className="btn-secondary" 
                  style={{ borderColor: relations.transactionKeyMatch ? '#00ff88' : '#ffaa00', color: relations.transactionKeyMatch ? '#00ff88' : '#ffaa00', fontSize: '0.8rem', padding: '4px 10px' }}
                  onClick={toggleTransactionRelation}
                >
                  {relations.transactionKeyMatch ? 'LINKED ✓' : 'LINK KEYS'}
                </button>
              </div>
            </div>

            {/* Indexing Selection */}
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#8ab4f8' }}>SEARCH INDEX TYPE</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#ffaa00' }}>{relations.indexMode}</div>
              </div>
              <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={cycleIndexMode}>
                CYCLE INDEX
              </button>
            </div>

            {/* Transaction Isolation */}
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#8ab4f8' }}>ACID TRANSACTION ISOLATION</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#ffaa00' }}>{relations.isolationLevel}</div>
              </div>
              <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={cycleIsolationLevel}>
                CYCLE ACID LEVEL
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Diagnostics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: 'rgba(3, 8, 20, 0.8)', border: '1px solid rgba(255,170,0,0.3)', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-header)', fontSize: '1rem', color: '#ffaa00', marginBottom: '15px' }}>
              Database Health Status
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: 'var(--font-mono)' }}>
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '4px', borderLeft: `4px solid ${dbIntegrity === 100 ? '#00ff88' : '#ffaa00'}` }}>
                <div style={{ fontSize: '0.75rem', color: '#8ab4f8' }}>SCHEMA INTEGRITY</div>
                <div style={{ fontSize: '1.6rem', color: dbIntegrity === 100 ? '#00ff88' : '#ffaa00', fontWeight: '800' }}>{dbIntegrity}%</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '4px', borderLeft: `4px solid ${queryLatency <= 20 ? '#00ff88' : '#ff0055'}` }}>
                <div style={{ fontSize: '0.75rem', color: '#8ab4f8' }}>QUERY EXECUTION LATENCY</div>
                <div style={{ fontSize: '1.6rem', color: queryLatency <= 20 ? '#00ff88' : '#ff0055', fontWeight: '800' }}>{queryLatency} ms</div>
              </div>
            </div>
          </div>

          {isSuccess ? (
            <div style={{ background: 'rgba(0,255,136,0.15)', border: '1px solid #00ff88', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00ff88', fontWeight: '800', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>
                <CheckCircle size={20} /> SCHEMA RECONSTRUCTION COMPLETE!
              </div>
              <p style={{ fontSize: '0.85rem', color: '#e0f7fc', marginBottom: '12px' }}>
                Relational keys linked, B-Tree indexes created & ACID locks cleared.
              </p>
              <button className="btn-primary" style={{ width: '100%' }} onClick={() => { soundEngine.playSuccess(); onComplete(); }}>
                CONFIRM & RESTORE VAULT
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.3)', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', color: '#ffd580' }}>
              <ShieldAlert size={20} />
              Link both Foreign Keys, set Index to B_TREE_CLUSTERED, and Isolation to REPEATABLE_READ_ACID!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
