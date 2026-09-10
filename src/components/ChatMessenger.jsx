import React, { useState } from 'react';
import { Send, Lock, User, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export const ChatMessenger = ({ caseId, messages = [], onMessageSent, currentRole = 'USER' }) => {
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    setSending(true);
    try {
      const res = await api.sendMessage(caseId, inputText.trim());
      setInputText('');
      if (onMessageSent) onMessageSent(res.sentMessage);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[480px]">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-xs text-slate-800">Secure Inquiry Communications Channel</span>
        </div>
        <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-mono">
          <Lock className="w-3 h-3 text-emerald-600" />
          <span>Case Encrypted</span>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6">
            <Lock className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-medium">No messages exchanged yet.</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
              Use this confidential channel to share updates, additional evidence context, or inquiry questions.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_role === currentRole;
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono mb-1">
                  <span className="font-semibold text-slate-600">{m.sender_name}</span>
                  <span>({m.sender_role})</span>
                  <span>•</span>
                  <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={`p-3 rounded-2xl max-w-md text-xs leading-relaxed shadow-xs ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                }`}>
                  {m.message}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white rounded-b-2xl flex items-center space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a confidential message or request update..."
          className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={sending || !inputText.trim()}
          className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl shadow-sm transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
