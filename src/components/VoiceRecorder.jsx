import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, RefreshCw, CheckCircle2, Globe, Volume2 } from 'lucide-react';
import { api } from '../services/api';

export const VoiceRecorder = ({ onTranscriptGenerated, initialLanguage = 'en' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlobUrl, setAudioBlobUrl] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState(initialLanguage);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    setAudioBlobUrl(null);
    setTranscript('');
  };

  const stopRecording = async () => {
    setIsRecording(false);
    // Simulate recorded audio wave
    setAudioBlobUrl('mock-audio-captured');
    // Trigger transcription
    await handleTranscribe(language);
  };

  const handleTranscribe = async (lang) => {
    setTranscribing(true);
    try {
      const res = await api.transcribeVoice(lang);
      setTranscript(res.transcript);
      if (onTranscriptGenerated) {
        onTranscriptGenerated(res.transcript, lang);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTranscribing(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-900/50 text-blue-400 rounded-xl border border-blue-800/60">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-100">Tell Your Story (Voice Recording)</h4>
            <p className="text-xs text-slate-400">Speak in your preferred language. AI converts your voice into text.</p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              if (audioBlobUrl) handleTranscribe(e.target.value);
            }}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="en">English (English)</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="mr">मराठी (Marathi)</option>
          </select>
        </div>
      </div>

      {/* Recording Control Canvas */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Waveform Visualization Bars */}
        <div className="flex items-center justify-center space-x-1 h-12 mb-3">
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-all duration-150 ${
                isRecording
                  ? 'bg-rose-500 animate-pulse'
                  : audioBlobUrl
                  ? 'bg-blue-500'
                  : 'bg-slate-800'
              }`}
              style={{
                height: isRecording
                  ? `${Math.max(8, Math.sin(i + recordingTime * 3) * 40 + 15)}px`
                  : audioBlobUrl
                  ? `${Math.max(6, Math.sin(i * 0.8) * 28 + 10)}px`
                  : '8px'
              }}
            />
          ))}
        </div>

        {/* Timer */}
        <span className="font-mono text-xs font-semibold text-slate-300 mb-3">
          {formatTime(recordingTime)}
        </span>

        {/* Buttons */}
        <div className="flex items-center space-x-3">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all transform hover:scale-105"
            >
              <Mic className="w-4 h-4" />
              <span>{audioBlobUrl ? 'Record Again' : 'Start Recording'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-600 text-xs font-semibold rounded-xl shadow-md animate-pulse"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop & Transcribe</span>
            </button>
          )}

          {audioBlobUrl && !isRecording && (
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Playback'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Generated Transcript Display */}
      {(transcribing || transcript) && (
        <div className="mt-4 bg-slate-800/60 border border-slate-700 rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Speech-to-Text Transcript ({language.toUpperCase()})</span>
            </span>
            {transcribing && (
              <span className="text-[11px] text-blue-400 flex items-center space-x-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Processing...</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed italic bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            "{transcript}"
          </p>
        </div>
      )}

    </div>
  );
};
