import React from 'react';
import { Shield, CheckCircle2, Download, Printer, X, Lock, FileText } from 'lucide-react';

export const Section65BModal = ({ certificate, onClose }) => {
  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 border border-slate-300 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-blue-800 mb-1">
            <Shield className="w-7 h-7 text-blue-700" />
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">RakshaSetu</span>
          </div>
          <h2 className="font-serif font-bold text-lg text-slate-800 tracking-wide uppercase">
            Certificate of Authenticity for Electronic Evidence
          </h2>
          <p className="text-xs font-semibold text-slate-600 mt-0.5">
            {certificate.actReference}
          </p>
          <div className="inline-block bg-slate-100 border border-slate-300 rounded-md px-3 py-1 mt-2 text-xs font-mono font-bold text-slate-700">
            Certificate Ref: {certificate.certificateId}
          </div>
        </div>

        {/* Verification Stamp Banner */}
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 mb-6 flex items-center space-x-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <div>
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
              Cryptographic Integrity Verified: SHA-256 Match
            </span>
            <span className="text-[11px] text-emerald-700">
              Digital fingerprint matches uncorrupted baseline recorded at time of evidence ingestion.
            </span>
          </div>
        </div>

        {/* Technical Metadata Table */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 space-y-2.5 text-xs font-mono">
          <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-sans font-medium">Evidence ID:</span>
            <span className="col-span-2 font-bold text-slate-900">{certificate.evidenceId}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-sans font-medium">Case Reference:</span>
            <span className="col-span-2 font-bold text-blue-800">{certificate.caseId}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-sans font-medium">File Name:</span>
            <span className="col-span-2 font-semibold text-slate-800 break-all">{certificate.fileName}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-sans font-medium">Format & Size:</span>
            <span className="col-span-2 text-slate-700">{certificate.fileType} ({certificate.fileSize})</span>
          </div>
          <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-sans font-medium">SHA-256 Checksum:</span>
            <span className="col-span-2 text-slate-900 font-bold break-all bg-white p-1.5 rounded border border-slate-300">
              {certificate.sha256Hash}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-sans font-medium">Ingestion Timestamp:</span>
            <span className="col-span-2 text-slate-700">{new Date(certificate.timestampRecorded).toUTCString()}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-slate-500 font-sans font-medium">Vault Host Node:</span>
            <span className="col-span-2 text-slate-700">{certificate.systemHost}</span>
          </div>
        </div>

        {/* Statutory Attestation Statement */}
        <div className="text-[11px] text-slate-700 leading-relaxed space-y-2 mb-6 border-l-2 border-blue-600 pl-3 italic font-serif">
          <p>{certificate.legalDeclaration}</p>
          <p className="font-mono text-[10px] text-slate-500 not-italic">
            Digital Signature Digest: {certificate.digitalSignature}
          </p>
        </div>

        {/* Prototype Legal Disclaimer */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-900 leading-normal mb-6">
          <span className="font-bold">LEGAL NOTICE: </span>
          {certificate.legalDisclaimer}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Certificate</span>
          </button>
        </div>

      </div>
    </div>
  );
};
