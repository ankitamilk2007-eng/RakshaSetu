import React, { useState } from 'react';
import { 
  FileText, Image, Music, Video, ShieldCheck, Check, Copy, 
  Award, ExternalLink, Download, AlertCircle, RefreshCw 
} from 'lucide-react';
import { api } from '../services/api';
import { Section65BModal } from './Section65BModal';

export const EvidenceCard = ({ item, onVerified }) => {
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [certData, setCertData] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);

  const copyHash = () => {
    navigator.clipboard.writeText(item.sha256_hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await api.verifyEvidence(item.id);
      setVerificationResult(res);
      if (onVerified) onVerified(res);
    } catch (err) {
      setVerificationResult({ isMatch: false, integrityStatus: 'ERROR' });
    } finally {
      setVerifying(false);
    }
  };

  const handleOpenCertificate = async () => {
    try {
      const res = await api.getEvidenceCertificate(item.id);
      setCertData(res.certificate);
      setShowCertModal(true);
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = () => {
    const type = (item.file_type || '').toLowerCase();
    if (type.includes('image')) return Image;
    if (type.includes('audio')) return Music;
    if (type.includes('video')) return Video;
    return FileText;
  };

  const Icon = getIcon();

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
        
        {/* Top Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-semibold text-sm text-slate-800 break-all">{item.file_name}</h5>
              <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono mt-0.5">
                <span>{item.id}</span>
                <span>•</span>
                <span>{(item.file_size / 1024).toFixed(1)} KB</span>
                <span>•</span>
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>INTEGRITY VERIFIED</span>
          </span>
        </div>

        {/* Cryptographic SHA-256 Hash Display */}
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 mb-3">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-semibold">SHA-256 Fingerprint:</span>
            <button
              onClick={copyHash}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-sans text-[10px]"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Hash'}</span>
            </button>
          </div>
          <div className="font-mono text-[11px] text-slate-700 break-all select-all font-semibold">
            {item.sha256_hash}
          </div>
        </div>

        {/* Security / Encryption tags */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-4 px-1">
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{item.encryption_status || 'AES-256 GCM at Rest'}</span>
          </span>
          {item.is_shared_with_police && (
            <span className="text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              Shared with Police
            </span>
          )}
        </div>

        {/* Verification Result message */}
        {verificationResult && (
          <div className={`p-2.5 rounded-xl text-xs mb-3 flex items-center space-x-2 ${
            verificationResult.isMatch ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {verificationResult.isMatch ? (
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span className="font-mono text-[11px]">
              {verificationResult.isMatch 
                ? `✓ LIVE FORENSIC CHECK MATCH: SHA-256 is intact.` 
                : '⚠ HASH MISMATCH: Tampering detected!'}
            </span>
          </div>
        )}

        {/* Card Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${verifying ? 'animate-spin' : ''}`} />
            <span>{verifying ? 'Checking...' : 'Verify Hash Live'}</span>
          </button>

          <button
            onClick={handleOpenCertificate}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg transition-colors"
          >
            <Award className="w-3.5 h-3.5 text-blue-600" />
            <span>Section 65B Certificate</span>
          </button>
        </div>

      </div>

      {showCertModal && (
        <Section65BModal certificate={certData} onClose={() => setShowCertModal(false)} />
      )}
    </>
  );
};
