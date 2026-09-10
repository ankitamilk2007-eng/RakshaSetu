import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  Shield, AlertTriangle, FileText, Lock, PlusCircle, CheckCircle2, 
  Send, RefreshCw, Upload, Mic, Trash2, ChevronRight, Eye, 
  Phone, EyeOff, Award, Clock, ArrowLeft, HelpCircle, Download
} from 'lucide-react';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { EvidenceCard } from '../components/EvidenceCard';
import { CaseStatusBadge } from '../components/CaseStatusBadge';
import { RiskBadge } from '../components/RiskBadge';
import { CaseTimeline } from '../components/CaseTimeline';
import { ChatMessenger } from '../components/ChatMessenger';
import { PoshDeadlineBanner } from '../components/PoshDeadlineBanner';

export const UserPortal = () => {
  const { user, userTab, setUserTab, t, selectedCaseId, setSelectedCaseId } = useApp();

  // State for Wizard
  const [wizardStep, setWizardStep] = useState(1);
  const [formData, setFormData] = useState({
    incidentDate: new Date().toISOString().split('T')[0],
    incidentTime: '18:30',
    location: 'Office Conference Room 4B / Microsoft Teams',
    department: user?.department || 'Engineering',
    category: 'Sexual harassment',
    personInvolved: 'Rajesh Sharma',
    personRoleOrRelationship: 'Senior Director / Direct Line Manager',
    description: "I was repeatedly receiving inappropriate messages from my manager on private chat after work hours. Yesterday during our performance review meeting, he explicitly told me that if I complained or refused his invitations, my annual appraisal would be ruined and I would lose my job.",
    hasThreat: true,
    hasPhysicalContact: false,
    hasDiscrimination: true,
    hasSexualHarassment: true,
    hasStalking: true,
    hasCyberHarassment: true,
    isStillInContact: true,
    isImmediateDanger: true,
    witnesses: 'Colleague R. Varma, Security log on Floor 4'
  });

  // State for Evidence Upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [vaultEvidence, setVaultEvidence] = useState([]);
  const [incidentEvidenceIds, setIncidentEvidenceIds] = useState([]);

  // State for AI Generation
  const [generatingAI, setGeneratingAI] = useState(false);
  const [structuredDraft, setStructuredDraft] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [recommendationData, setRecommendationData] = useState(null);
  const [submissionChoice, setSubmissionChoice] = useState('ICC'); // 'PRIVATE', 'ICC', 'POLICE'
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submittingCase, setSubmittingCase] = useState(false);
  const [submittedCaseResult, setSubmittedCaseResult] = useState(null);

  // Cases List & Detail
  const [myCases, setMyCases] = useState([]);
  const [activeCaseData, setActiveCaseData] = useState(null);
  const [loadingCases, setLoadingCases] = useState(false);

  // Safety & Privacy
  const [supportContacts, setSupportContacts] = useState([]);
  const [privacySettings, setPrivacySettings] = useState({
    allow_evidence_sharing: true,
    allow_anonymous_pattern_matching: true,
    allow_cross_org_matching: true,
    allow_police_escalation: false,
    allow_notifications: true
  });
  const [privacySaved, setPrivacySaved] = useState(false);

  // Fetch initial data
  useEffect(() => {
    loadVault();
    loadCases();
    loadSupport();
  }, []);

  const loadVault = async () => {
    try {
      const res = await api.listEvidence();
      setVaultEvidence(res.evidence || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadCases = async () => {
    setLoadingCases(true);
    try {
      const res = await api.listCases();
      setMyCases(res.cases || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCases(false);
    }
  };

  const loadSupport = async () => {
    try {
      const res = await api.listSupportContacts();
      setSupportContacts(res.contacts || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Open specific case detail
  const handleOpenCase = async (id) => {
    setSelectedCaseId(id);
    try {
      const res = await api.getCase(id);
      setActiveCaseData(res);
    } catch (e) {
      console.error(e);
    }
  };

  // File Upload to Vault
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);
    data.append('incidentId', 'INC-DRAFT');

    setUploading(true);
    try {
      const res = await api.uploadEvidence(data);
      setIncidentEvidenceIds(prev => [...prev, res.evidence.id]);
      await loadVault();
      alert(`Evidence securely stored in vault with SHA-256: ${res.evidence.sha256_hash.substring(0, 16)}...`);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Trigger AI Complaint Generation
  const handleGenerateAI = async () => {
    setGeneratingAI(true);
    try {
      const payload = {
        rawStory: formData.description,
        category: formData.category,
        personInvolved: formData.personInvolved,
        personRoleOrRelationship: formData.personRoleOrRelationship,
        incidentDate: formData.incidentDate,
        incidentTime: formData.incidentTime,
        location: formData.location,
        department: formData.department,
        hasThreat: formData.hasThreat,
        hasPhysicalContact: formData.hasPhysicalContact,
        hasDiscrimination: formData.hasDiscrimination,
        hasSexualHarassment: formData.hasSexualHarassment,
        hasStalking: formData.hasStalking,
        hasCyberHarassment: formData.hasCyberHarassment,
        isImmediateDanger: formData.isImmediateDanger,
        isStillInContact: formData.isStillInContact,
        witnesses: formData.witnesses,
        evidenceIds: incidentEvidenceIds
      };

      const res = await api.generateComplaint(payload);
      setStructuredDraft(res.complaint);
      setRiskData(res.risk);
      setRecommendationData(res.recommendation);
      setWizardStep(4); // Advance to AI Review Step
    } catch (err) {
      alert(`Failed to generate complaint: ${err.message}`);
    } finally {
      setGeneratingAI(false);
    }
  };

  // Final Submission to Backend
  const handleFinalSubmit = async () => {
    setSubmittingCase(true);
    try {
      // 1. Save or update incident record first
      const incRes = await api.saveIncident({
        incidentDate: formData.incidentDate,
        incidentTime: formData.incidentTime,
        location: formData.location,
        department: formData.department,
        category: formData.category,
        personInvolved: formData.personInvolved,
        personRoleOrRelationship: formData.personRoleOrRelationship,
        description: formData.description,
        hasThreat: formData.hasThreat,
        hasPhysicalContact: formData.hasPhysicalContact,
        hasDiscrimination: formData.hasDiscrimination,
        hasSexualHarassment: formData.hasSexualHarassment,
        hasStalking: formData.hasStalking,
        hasCyberHarassment: formData.hasCyberHarassment,
        isStillInContact: formData.isStillInContact,
        isImmediateDanger: formData.isImmediateDanger
      });

      const incidentId = incRes.incident.id;

      // 2. Submit formal complaint
      const subRes = await api.submitComplaint({
        incidentId,
        submissionTarget: submissionChoice,
        structuredComplaint: structuredDraft,
        riskData,
        recommendationData,
        evidenceIds: incidentEvidenceIds
      });

      setSubmittedCaseResult(subRes);
      setShowConfirmModal(false);
      setWizardStep(5); // Success step
      await loadCases();
      await loadVault();
    } catch (err) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setSubmittingCase(false);
    }
  };

  // Save Privacy Consents
  const handleSavePrivacy = async () => {
    try {
      await api.updateConsents(privacySettings);
      setPrivacySaved(true);
      setTimeout(() => setPrivacySaved(false), 3000);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 mb-6 gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'report', label: '1. Report Incident', icon: PlusCircle },
            { key: 'vault', label: '2. Evidence Vault', icon: Lock },
            { key: 'cases', label: '3. My Cases & Tracking', icon: Clock },
            { key: 'assistant', label: '4. AI Complaint Assistant', icon: FileText },
            { key: 'safety', label: '5. Safety Center', icon: Shield },
            { key: 'privacy', label: '6. Privacy & Consent', icon: EyeOff }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = userTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setUserTab(tab.key);
                  if (tab.key === 'cases') setSelectedCaseId(null);
                }}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Survivor Vault: Encrypted</span>
        </div>
      </div>

      {/* TAB 1: REPORT INCIDENT WIZARD */}
      {userTab === 'report' && (
        <div className="max-w-4xl mx-auto">
          
          {/* Wizard Progress Stepper */}
          <div className="flex items-center justify-between mb-8 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            {[
              { num: 1, title: 'Incident Facts' },
              { num: 2, title: 'Voice / Story' },
              { num: 3, title: 'Evidence Vault' },
              { num: 4, title: 'AI Structuring & Risk' },
              { num: 5, title: 'Submission Choice' }
            ].map((s) => (
              <div
                key={s.num}
                onClick={() => wizardStep > s.num && setWizardStep(s.num)}
                className={`flex items-center space-x-2 cursor-pointer ${
                  wizardStep === s.num ? 'text-blue-600 font-bold' : wizardStep > s.num ? 'text-emerald-600 font-semibold' : 'text-slate-400'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                  wizardStep === s.num ? 'bg-blue-600 text-white shadow-sm' : wizardStep > s.num ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  {wizardStep > s.num ? '✓' : s.num}
                </div>
                <span className="text-xs hidden md:inline">{s.title}</span>
              </div>
            ))}
          </div>

          {/* STEP 1: Incident Facts Form */}
          {wizardStep === 1 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Step 1 — Document Incident Facts</h3>
              <p className="text-xs text-slate-500 mb-6">
                Fill in the details you remember. You can update or amend this information at any time before submission.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-6">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Incident Date</label>
                  <input
                    type="date"
                    value={formData.incidentDate}
                    onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Incident Time</label>
                  <input
                    type="text"
                    value={formData.incidentTime}
                    onChange={(e) => setFormData({ ...formData, incidentTime: e.target.value })}
                    placeholder="e.g. 18:30 or After work hours"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Location / Venue</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Floor 4 Conference Room, Parking lot, Zoom"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Incident Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option>Sexual harassment</option>
                    <option>Verbal harassment</option>
                    <option>Physical harassment</option>
                    <option>Cyber harassment</option>
                    <option>Threat</option>
                    <option>Stalking</option>
                    <option>Discrimination</option>
                    <option>Workplace bullying</option>
                    <option>Retaliation</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Person Involved (Alleged Offender)</label>
                  <input
                    type="text"
                    value={formData.personInvolved}
                    onChange={(e) => setFormData({ ...formData, personInvolved: e.target.value })}
                    placeholder="Full name or identifiable role"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Professional Relationship / Role</label>
                  <input
                    type="text"
                    value={formData.personRoleOrRelationship}
                    onChange={(e) => setFormData({ ...formData, personRoleOrRelationship: e.target.value })}
                    placeholder="e.g. Reporting Manager, Director, Client, Peer"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Threat and Danger Flags */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wider block mb-3">
                  Safety Indicators & Harassment Flags
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {[
                    { key: 'hasThreat', label: 'Was there a threat?' },
                    { key: 'hasPhysicalContact', label: 'Physical contact / grab?' },
                    { key: 'hasSexualHarassment', label: 'Sexual harassment?' },
                    { key: 'hasStalking', label: 'Stalking / tracking?' },
                    { key: 'hasCyberHarassment', label: 'Cyber / WhatsApp abuse?' },
                    { key: 'hasDiscrimination', label: 'Workplace discrimination?' },
                    { key: 'isStillInContact', label: 'Still in regular contact?' },
                    { key: 'isImmediateDanger', label: 'Immediate physical danger?' }
                  ].map((flag) => (
                    <label key={flag.key} className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100">
                      <input
                        type="checkbox"
                        checked={formData[flag.key]}
                        onChange={(e) => setFormData({ ...formData, [flag.key]: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className={`text-[11px] font-medium ${formData[flag.key] ? 'text-rose-700 font-bold' : 'text-slate-700'}`}>
                        {flag.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                >
                  <span>Proceed to Voice & Story</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Voice Reporting & Free-Text Story */}
          {wizardStep === 2 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Step 2 — Tell Your Story (Voice or Text)</h3>
                <p className="text-xs text-slate-500">
                  Speak naturally or write in your own words. The AI Assistant will structure it according to POSH requirements.
                </p>
              </div>

              {/* Voice Recorder Module */}
              <VoiceRecorder
                onTranscriptGenerated={(transcript) => {
                  setFormData(prev => ({
                    ...prev,
                    description: transcript
                  }));
                }}
              />

              {/* Raw Story Textarea */}
              <div>
                <label className="block text-slate-700 font-semibold text-xs mb-1.5">
                  Your Statement / Detailed Narrative
                </label>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what happened chronologically, what was said, how it made you feel, and any actions taken..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold text-xs mb-1.5">
                  Witnesses (Optional)
                </label>
                <input
                  type="text"
                  value={formData.witnesses}
                  onChange={(e) => setFormData({ ...formData, witnesses: e.target.value })}
                  placeholder="Names or designations of any colleagues present or aware"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep(3)}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-sm"
                >
                  <span>Attach Evidence</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Evidence Vault Upload */}
          {wizardStep === 3 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Step 3 — Secure Evidence in Vault</h3>
                <p className="text-xs text-slate-500">
                  Upload screenshots, audio files, PDFs, or chat exports. The system computes a real SHA-256 hash immediately upon upload.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50 cursor-pointer transition-colors">
                <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700 mb-1">
                  Upload screenshots, chat records, audio, or PDFs
                </p>
                <p className="text-[11px] text-slate-500 mb-3">
                  PNG, JPG, PDF, MP3, WAV, DOCX (Up to 50MB)
                </p>
                <label className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-sm">
                  <span>{uploading ? 'Calculating SHA-256...' : 'Choose File to Vault'}</span>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* Current Evidence in Vault */}
              <div>
                <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-600 mb-3">
                  Secured Evidence Items ({vaultEvidence.length})
                </h4>
                <div className="space-y-3">
                  {vaultEvidence.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No files uploaded yet.</p>
                  ) : (
                    vaultEvidence.slice(0, 3).map((item) => (
                      <EvidenceCard key={item.id} item={item} />
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={generatingAI}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${generatingAI ? 'animate-spin' : ''}`} />
                  <span>{generatingAI ? 'Structuring Legal Draft...' : 'Generate AI Legal Complaint'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: AI Structuring, Risk Scoring & Authority Recommendation */}
          {wizardStep === 4 && structuredDraft && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-slate-900">Step 4 — AI Structured Complaint & Risk Analysis</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                      AI-Assisted Draft
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review your structured complaint. You can edit any section before deciding whether to submit.
                  </p>
                </div>

                {riskData && (
                  <RiskBadge score={riskData.score} level={riskData.riskLevel} />
                )}
              </div>

              {/* Transparent Risk Contributing Factors */}
              {riskData && (
                <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs tracking-wider uppercase text-blue-400">
                      Transparent AI Risk Scoring Breakdown
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      Overall Score: {riskData.score}/100 ({riskData.riskLevel})
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-3">{riskData.explanation}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    {riskData.factors.map((f, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                        <span className="text-slate-300 font-sans">{f.name}</span>
                        <span className="text-rose-400 font-bold">{f.weight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Authority Pathway */}
              {recommendationData && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs">
                  <span className="font-bold text-blue-900 uppercase tracking-wide block mb-1">
                    Recommended Reporting Authority Pathway
                  </span>
                  <div className="font-bold text-sm text-blue-800 mb-1">
                    {recommendationData.recommendedAuthority} ({recommendationData.urgency} URGENCY)
                  </div>
                  <p className="text-slate-700 mb-2">{recommendationData.reason}</p>
                  <div className="text-[11px] text-blue-700 font-semibold bg-white p-2 rounded-lg border border-blue-100">
                    Mandated Next Step: {recommendationData.requiredNextStep}
                  </div>
                </div>
              )}

              {/* Missing Information Checklist */}
              {structuredDraft.missingInfoList && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <span className="font-bold text-xs text-slate-800 uppercase tracking-wider block mb-2">
                    Missing Information & Evidentiary Checklist
                  </span>
                  <div className="space-y-1.5 text-xs">
                    {structuredDraft.missingInfoList.map((item, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        {item.status === 'provided' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        )}
                        <span className="font-semibold text-slate-800">{item.label}:</span>
                        <span className="text-slate-600">{item.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Editable Structured Complaint Preview */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Formal Complaint Title</label>
                  <input
                    type="text"
                    value={structuredDraft.title}
                    onChange={(e) => setStructuredDraft({ ...structuredDraft, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Executive Summary</label>
                  <textarea
                    rows={3}
                    value={structuredDraft.summary}
                    onChange={(e) => setStructuredDraft({ ...structuredDraft, summary: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nature of Harassment</label>
                  <input
                    type="text"
                    value={structuredDraft.natureOfHarassment}
                    onChange={(e) => setStructuredDraft({ ...structuredDraft, natureOfHarassment: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Safety Concerns</label>
                  <input
                    type="text"
                    value={structuredDraft.safetyConcerns}
                    onChange={(e) => setStructuredDraft({ ...structuredDraft, safetyConcerns: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Requested Action & Interim Relief</label>
                  <input
                    type="text"
                    value={structuredDraft.requestedAction}
                    onChange={(e) => setStructuredDraft({ ...structuredDraft, requestedAction: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submission Choice Selector */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800">
                <h4 className="font-bold text-sm text-white mb-1">What would you like to do with this complaint?</h4>
                <p className="text-xs text-slate-400 mb-4">
                  You maintain full sovereignty. The AI will never submit anything without your explicit confirmation.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setSubmissionChoice('PRIVATE')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      submissionChoice === 'PRIVATE' ? 'bg-blue-900/60 border-blue-400 ring-2 ring-blue-400' : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold text-xs text-white block mb-1">🔒 Save Privately as Draft</span>
                    <span className="text-[11px] text-slate-400">Keep stored in your encrypted vault. Nothing is transmitted to ICC or Police.</span>
                  </div>

                  <div
                    onClick={() => setSubmissionChoice('ICC')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      submissionChoice === 'ICC' ? 'bg-purple-900/60 border-purple-400 ring-2 ring-purple-400' : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold text-xs text-white block mb-1">🏛️ Submit to Organization / ICC</span>
                    <span className="text-[11px] text-slate-400">Transmits formal complaint to Internal Complaints Committee for POSH 90-day inquiry.</span>
                  </div>

                  <div
                    onClick={() => setSubmissionChoice('POLICE')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      submissionChoice === 'POLICE' ? 'bg-rose-900/60 border-rose-400 ring-2 ring-rose-400' : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold text-xs text-white block mb-1">🚨 Request Police Escalation</span>
                    <span className="text-[11px] text-slate-400">Directly escalates case to Law Enforcement Authority portal for criminal threat inquiry.</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setWizardStep(3)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
                >
                  Back to Evidence
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
                >
                  Confirm & Submit Complaint
                </button>
              </div>

            </div>
          )}

          {/* STEP 5: Success & Case ID Generated */}
          {wizardStep === 5 && submittedCaseResult && (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                {submittedCaseResult.isPrivate ? 'Complaint Saved Privately' : 'Complaint Submitted Successfully'}
              </h3>

              {!submittedCaseResult.isPrivate && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono">
                  <span className="text-xs text-slate-500 block mb-1">Official Tracking Case ID:</span>
                  <span className="text-2xl font-bold text-blue-700 tracking-wider">
                    {submittedCaseResult.caseId}
                  </span>
                </div>
              )}

              <p className="text-xs text-slate-600 leading-relaxed">
                {submittedCaseResult.isPrivate
                  ? 'Your draft is safely stored in your private vault with cryptographic hashes. You can review or submit it at any time.'
                  : 'Your formal complaint has been securely routed to the designated inquiry authority. All attached evidence items have been verified and anchored with SHA-256 hashes.'}
              </p>

              {submittedCaseResult.escrowAlertTriggered && (
                <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 text-xs text-rose-900 text-left">
                  <span className="font-bold block">Matching Escrow Alert Triggered:</span>
                  Multiple independent reports have now identified this subject. The committee risk level has been elevated automatically while preserving your personal anonymity.
                </div>
              )}

              <div className="flex justify-center space-x-3 pt-4">
                <button
                  onClick={() => {
                    setUserTab('cases');
                    if (submittedCaseResult.caseId) handleOpenCase(submittedCaseResult.caseId);
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-sm"
                >
                  Track Case Status
                </button>
                <button
                  onClick={() => {
                    setWizardStep(1);
                    setSubmittedCaseResult(null);
                  }}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50"
                >
                  File Another Incident
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: EVIDENCE VAULT */}
      {userTab === 'vault' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Secure Digital Evidence Vault</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tamper-evident storage anchored with real SHA-256 cryptographic checksums and Section 65B verification.
              </p>
            </div>

            <label className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-sm self-start sm:self-auto">
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Vaulting...' : 'Upload Evidence File'}</span>
              <input type="file" onChange={handleFileUpload} className="hidden" disabled={uploading} />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vaultEvidence.length === 0 ? (
              <div className="col-span-2 text-center py-12 bg-white border border-slate-200 rounded-2xl text-slate-400">
                <Lock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold">Vault is currently empty</p>
                <p className="text-[11px] text-slate-400 mt-1">Upload screenshots, recordings, or documents to establish tamper-evident proof.</p>
              </div>
            ) : (
              vaultEvidence.map((item) => (
                <EvidenceCard key={item.id} item={item} onVerified={loadVault} />
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MY CASES & CASE TRACKING */}
      {userTab === 'cases' && (
        <div>
          {!selectedCaseId ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">My Tracked Cases</h3>
                  <p className="text-xs text-slate-500">Track real-time status updates, investigator assignments, and inquiry progress.</p>
                </div>
                <button
                  onClick={() => setUserTab('report')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  + New Complaint
                </button>
              </div>

              {loadingCases ? (
                <p className="text-xs text-slate-400 py-8 text-center">Loading cases...</p>
              ) : myCases.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
                  <Clock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">No active cases</p>
                  <p className="text-[11px] text-slate-400 mt-1">Complaints submitted to ICC or Police will appear here with full status tracking.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {myCases.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleOpenCase(c.id)}
                      className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-mono text-xs font-bold text-blue-700">{c.id}</span>
                          <CaseStatusBadge status={c.status} size="sm" />
                          <RiskBadge score={c.risk_score} level={c.risk_level} size="sm" />
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">{c.category}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Person Involved: <strong>{c.person_involved || 'Documented'}</strong> • Filed: {new Date(c.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3 self-end sm:self-center">
                        <div className="text-right text-xs">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Assigned Officer</span>
                          <span className="font-semibold text-slate-800">{c.assigned_officer_name || 'Pending Assignment'}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeCaseData ? (
            /* CASE DETAIL VIEW */
            <div className="space-y-6">
              <button
                onClick={() => setSelectedCaseId(null)}
                className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Cases List</span>
              </button>

              {/* Case Header Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-bold text-blue-800">{activeCaseData.case.id}</span>
                      <CaseStatusBadge status={activeCaseData.case.status} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mt-1">{activeCaseData.case.category}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Subject: <strong>{activeCaseData.case.person_involved}</strong> ({activeCaseData.case.person_role_or_relationship || 'Workplace colleague'})
                    </p>
                  </div>

                  <RiskBadge score={activeCaseData.case.risk_score} level={activeCaseData.case.risk_level} />
                </div>

                {/* POSH 90-Day Tracker */}
                <PoshDeadlineBanner
                  deadlineInfo={{
                    complaint_submitted_date: activeCaseData.case.created_at,
                    investigation_deadline: activeCaseData.case.posh_deadline_date,
                    status: activeCaseData.case.deadline_status
                  }}
                />

                {/* Status Timeline */}
                <CaseTimeline
                  events={activeCaseData.timeline}
                  currentStatus={activeCaseData.case.status}
                />
              </div>

              {/* Complaint Summary & Messages Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Structured Complaint Details */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-xs">
                  <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                    Formal Complaint Summary
                  </h4>
                  
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description of Conduct</span>
                    <p className="text-slate-800 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {activeCaseData.case.detailed_description || activeCaseData.case.raw_description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Location</span>
                      <span className="font-semibold text-slate-800">{activeCaseData.case.incident_location}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Investigator</span>
                      <span className="font-semibold text-slate-800">{activeCaseData.case.assigned_officer_name || 'In Committee Queue'}</span>
                    </div>
                  </div>

                  {activeCaseData.case.police_referral_id && (
                    <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-sky-900">
                      <span className="font-bold block">Law Enforcement Referral Active</span>
                      <span>Referral status: <strong>{activeCaseData.case.police_status}</strong>. Police Officer: {activeCaseData.case.police_officer_name || 'Assigned Crime Branch Officer'}. FIR Number: {activeCaseData.case.fir_number || 'Under Verification'}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Attached Evidence Items ({activeCaseData.evidence.length})</span>
                    <div className="space-y-2">
                      {activeCaseData.evidence.map((ev) => (
                        <div key={ev.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px]">
                          <span className="font-semibold text-slate-800 truncate">{ev.file_name}</span>
                          <span className="text-emerald-700 font-bold">SHA-256 VERIFIED</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Secure Two-Way Communication Channel */}
                <div>
                  <ChatMessenger
                    caseId={activeCaseData.case.id}
                    messages={activeCaseData.messages}
                    currentRole="USER"
                    onMessageSent={(newMsg) => {
                      setActiveCaseData(prev => ({
                        ...prev,
                        messages: [...prev.messages, newMsg]
                      }));
                    }}
                  />
                </div>

              </div>

            </div>
          ) : null}
        </div>
      )}

      {/* TAB 4: AI COMPLAINT ASSISTANT WORKSPACE */}
      {userTab === 'assistant' && (
        <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">AI Complaint Assistant</h3>
            <p className="text-xs text-slate-500">
              Draft or translate your statement. Use this sandbox to preview structured complaints and check what evidentiary details are recommended before officially reporting.
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold text-xs mb-1">Incident Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              <option>Sexual harassment</option>
              <option>Verbal harassment</option>
              <option>Physical harassment</option>
              <option>Cyber harassment</option>
              <option>Workplace bullying</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold text-xs mb-1">Draft Narrative</label>
            <textarea
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={generatingAI}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center space-x-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generatingAI ? 'animate-spin' : ''}`} />
              <span>{generatingAI ? 'Analyzing...' : 'Analyze Risk & Structure Draft'}</span>
            </button>
          </div>

          {structuredDraft && (
            <div className="border-t border-slate-200 pt-4 space-y-3 text-xs">
              <span className="font-bold text-slate-900 block">Structured Result Preview:</span>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-800">{structuredDraft.title}</p>
                <p className="text-slate-600 mt-1">{structuredDraft.summary}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SAFETY CENTER */}
      {userTab === 'safety' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-md">
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="w-8 h-8 text-amber-400" />
              <h3 className="text-xl font-bold">Confidential Safety & Emergency Center</h3>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Your safety comes first. If you face immediate threats or physical stalking outside work, access verified national helplines and safety planning protocols below.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {supportContacts.map((c) => (
              <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold font-mono uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {c.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{c.availability}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{c.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{c.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-slate-900">{c.phone}</span>
                  <a
                    href={`tel:${c.phone.replace(/\s+/g, '')}`}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-xs"
                  >
                    Call Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PRIVACY & CONSENTS */}
      {userTab === 'privacy' && (
        <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Privacy & Consent Controls</h3>
            <p className="text-xs text-slate-500">
              You maintain total authority over how your evidence and incident records are processed.
            </p>
          </div>

          {privacySaved && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Privacy settings updated successfully.</span>
            </div>
          )}

          <div className="space-y-4 text-xs">
            {[
              {
                key: 'allow_anonymous_pattern_matching',
                title: 'Allow Confidential Matching Escrow',
                desc: 'Permits the engine to compare the reported subject against independent reports to detect serial offenders without exposing your identity.'
              },
              {
                key: 'allow_cross_org_matching',
                title: 'Allow Cross-Organization Matching',
                desc: 'Permits anonymous correlation if the same offender operates across corporate parent/partner networks.'
              },
              {
                key: 'allow_evidence_sharing',
                title: 'Evidence Sharing with ICC Inquiry Committee',
                desc: 'Authorizes appointed committee members to inspect secured evidence during formal proceedings.'
              },
              {
                key: 'allow_police_escalation',
                title: 'Pre-Authorize Police Referral if Threat is Critical',
                desc: 'Enables ICC officers to forward evidence hashes directly to the Police Cyber/Women Safety Cell if physical danger is imminent.'
              }
            ].map((pref) => (
              <label key={pref.key} className="flex items-start space-x-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={privacySettings[pref.key]}
                  onChange={(e) => setPrivacySettings({ ...privacySettings, [pref.key]: e.target.checked })}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <div>
                  <span className="font-bold text-slate-900 block">{pref.title}</span>
                  <span className="text-slate-500 text-[11px] leading-relaxed">{pref.desc}</span>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSavePrivacy}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-sm"
            >
              Save Privacy Preferences
            </button>
          </div>
        </div>
      )}

      {/* CONFIRMATION SUBMISSION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-blue-700">
              <Shield className="w-7 h-7" />
              <h3 className="font-bold text-base text-slate-900">Confirm Complaint Submission</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are about to submit this complaint to: <strong className="text-blue-800">{
                submissionChoice === 'PRIVATE' ? 'Your Private Vault (Unsubmitted)' :
                submissionChoice === 'ICC' ? 'Internal Complaints Committee (ICC)' :
                'Police Authority Portal'
              }</strong>.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 font-mono">
              <div>Subject: <span className="font-semibold text-slate-800">{formData.personInvolved}</span></div>
              <div>Risk Score: <span className="font-semibold text-rose-700">{riskData?.score}/100</span></div>
              <div>Evidence Items: <span className="font-semibold">{incidentEvidenceIds.length} file(s) attached</span></div>
            </div>

            <p className="text-[11px] text-slate-500">
              Submission generates an official Case Tracking ID and starts the POSH Act inquiry timeline.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={submittingCase}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm"
              >
                {submittingCase ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
