import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Lock, Calculator, FileText, ArrowLeft, Key, Sparkles, Check } from 'lucide-react';

export const InvisibleMode = () => {
  const { setCurrentRoute, user, loginDemo } = useApp();
  const [decoyMode, setDecoyMode] = useState('calculator'); // 'calculator' | 'notes'
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [inputBuffer, setInputBuffer] = useState('');
  const [noteContent, setNoteContent] = useState(
    "Weekly Grocery List:\n- Almond milk & oats\n- Green tea bags\n- Apples & oranges\n- Multivitamins\n\nMeeting Notes:\n- Q3 design review on Thursday\n- Review slide deck draft"
  );
  const [unlockedNotice, setUnlockedNotice] = useState(false);
  const [pinHint, setPinHint] = useState(false);

  // Check if buffer contains secret sequence 2580
  useEffect(() => {
    if (inputBuffer.endsWith('2580')) {
      handleUnlock();
    }
  }, [inputBuffer]);

  const handleCalcClick = (val) => {
    if (val === 'C') {
      setCalcDisplay('0');
      setInputBuffer('');
      return;
    }

    if (val === '=') {
      try {
        // Safe basic arithmetic evaluation
        const sanitized = calcDisplay.replace(/[^0-9+\-*/.]/g, '');
        const res = Function(`'use strict'; return (${sanitized})`)();
        setCalcDisplay(String(res));
      } catch (e) {
        setCalcDisplay('Error');
      }
      return;
    }

    const nextDisplay = calcDisplay === '0' && !isNaN(val) ? val : calcDisplay + val;
    setCalcDisplay(nextDisplay);
    setInputBuffer(prev => prev + val);
  };

  const handleUnlock = async () => {
    setUnlockedNotice(true);
    setTimeout(async () => {
      if (!user) {
        await loginDemo('user');
      } else {
        setCurrentRoute(user.role === 'ADMIN' ? 'admin' : user.role === 'POLICE' ? 'police' : 'user');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
      
      {/* Top Decoy Switcher & Instructions */}
      <div className="max-w-md w-full mb-4 flex items-center justify-between text-xs text-slate-400 px-2">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setDecoyMode('calculator')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-colors ${
              decoyMode === 'calculator' ? 'bg-slate-800 text-white font-semibold' : 'hover:text-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Disguised Calculator</span>
          </button>
          <button
            onClick={() => setDecoyMode('notes')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-colors ${
              decoyMode === 'notes' ? 'bg-slate-800 text-white font-semibold' : 'hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Disguised Notes</span>
          </button>
        </div>

        <button
          onClick={() => setPinHint(!pinHint)}
          className="text-blue-400 hover:text-blue-300 underline text-[11px]"
        >
          {pinHint ? 'Hide Secret PIN' : 'Reveal Secret PIN'}
        </button>
      </div>

      {pinHint && (
        <div className="max-w-md w-full mb-4 bg-blue-950/60 border border-blue-800/70 p-3 rounded-xl text-xs text-blue-200 flex items-center justify-between">
          <div>
            <span className="font-semibold block">Discreet Access Trigger:</span>
            <span>Enter predefined sequence <strong className="font-mono text-white text-sm bg-blue-900 px-1.5 py-0.5 rounded">2580</strong> on the calculator to launch RakshaSetu safely.</span>
          </div>
          <button
            onClick={handleUnlock}
            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold whitespace-nowrap ml-2"
          >
            Auto Unlock
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        
        {unlockedNotice && (
          <div className="absolute inset-0 bg-blue-900/95 backdrop-blur-md z-30 flex flex-col items-center justify-center text-white p-6 text-center animate-fade-in">
            <Shield className="w-12 h-12 text-blue-300 mb-2 animate-bounce" />
            <h3 className="font-bold text-lg">Identity Verified</h3>
            <p className="text-xs text-blue-200 mt-1">Opening encrypted RakshaSetu Survivor Portal...</p>
          </div>
        )}

        {decoyMode === 'calculator' ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">Standard Calculator</span>
              <div 
                className="w-3 h-3 rounded-full bg-slate-800 cursor-pointer hover:bg-blue-500" 
                title="Triple-click secret gesture simulation"
                onDoubleClick={handleUnlock}
              />
            </div>

            {/* Display */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 text-right">
              <div className="text-3xl font-mono text-white tracking-wider truncate">
                {calcDisplay}
              </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 gap-2.5 text-sm font-medium">
              {['C', '+/-', '%', '/'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcClick(btn)}
                  className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-blue-400 font-mono font-semibold transition-colors"
                >
                  {btn}
                </button>
              ))}

              {['7', '8', '9', '*'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcClick(btn)}
                  className={`h-12 rounded-xl font-mono transition-colors ${
                    ['*'].includes(btn) ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-slate-100'
                  }`}
                >
                  {btn}
                </button>
              ))}

              {['4', '5', '6', '-'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcClick(btn)}
                  className={`h-12 rounded-xl font-mono transition-colors ${
                    ['-'].includes(btn) ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-slate-100'
                  }`}
                >
                  {btn}
                </button>
              ))}

              {['1', '2', '3', '+'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcClick(btn)}
                  className={`h-12 rounded-xl font-mono transition-colors ${
                    ['+'].includes(btn) ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-slate-100'
                  }`}
                >
                  {btn}
                </button>
              ))}

              {['0', '.', '='].map((btn, idx) => (
                <button
                  key={btn}
                  onClick={() => handleCalcClick(btn)}
                  className={`h-12 rounded-xl font-mono transition-colors ${
                    btn === '0' ? 'col-span-2 bg-slate-900 hover:bg-slate-800 text-slate-100' :
                    btn === '=' ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold' :
                    'bg-slate-900 hover:bg-slate-800 text-slate-100'
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-900 text-center">
              <span className="text-[10px] text-slate-600">Tip: Type 2580 on the keypad to unlock RakshaSetu</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-500 uppercase">Personal Quick Notes</span>
              <span className="text-[10px] text-slate-600">Saved to local cache</span>
            </div>

            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full h-64 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono leading-relaxed focus:outline-none focus:border-slate-700 resize-none"
            />

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] text-slate-600">Discreet notes viewer</span>
              <button
                onClick={handleUnlock}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg font-medium flex items-center space-x-1"
              >
                <Key className="w-3.5 h-3.5 text-blue-400" />
                <span>Simulate Secret Gesture Unlock</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Prototype Legal/Security Disclaimer */}
      <p className="max-w-md text-center text-[10px] text-slate-500 mt-4 leading-relaxed">
        * Prototype simulation of discreet access. In production, this module coordinates with local OS accessibility sandboxes and does not guarantee hardware-level concealment.
      </p>

    </div>
  );
};
