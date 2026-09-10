/**
 * AI Service for RakshaSetu
 * Handles:
 * 1. AI Complaint Drafting & Restructuring
 * 2. Transparent Risk Scoring (0-100) with explainable factor breakdown
 * 3. Authority Recommendation (ICC, HR, Police, State Women's Commission)
 * 4. Missing Information Detection
 * 5. Multi-lingual Story Transcription Simulation
 */

export const generateStructuredComplaint = ({
  rawStory,
  category = 'Sexual harassment',
  personInvolved = 'Manager / Colleague',
  personRoleOrRelationship = 'Senior Colleague / Reporting Manager',
  incidentDate = '',
  incidentTime = '',
  location = '',
  department = '',
  hasThreat = false,
  hasPhysicalContact = false,
  hasDiscrimination = false,
  hasSexualHarassment = false,
  hasStalking = false,
  hasCyberHarassment = false,
  isImmediateDanger = false,
  witnesses = '',
  evidenceList = []
}) => {
  const story = (rawStory || '').trim();

  // Extract or synthesize key elements
  const title = `Formal Complaint Regarding Unwelcome Conduct and Harassment by ${personInvolved}`;

  const summary = story.length > 30
    ? `The complainant reports experiencing serious workplace harassment, specifically involving ${category.toLowerCase()} perpetrated by ${personInvolved} in the ${department || 'workplace'} setting. The conduct has created a hostile and intimidating environment.`
    : `Incident report regarding alleged ${category.toLowerCase()} by ${personInvolved} creating an unsafe workplace environment.`;

  const natureOfHarassment = [
    hasSexualHarassment ? 'Unwelcome verbal/physical sexual advances or comments' : null,
    hasThreat ? 'Explicit threats of retaliation, job termination, or professional harm' : null,
    hasPhysicalContact ? 'Non-consensual physical contact / assault' : null,
    hasStalking ? 'Persistent monitoring, stalking, and tracking outside workplace hours' : null,
    hasCyberHarassment ? 'Persistent harassment via electronic messaging / social channels' : null,
    hasDiscrimination ? 'Discriminatory conduct and hostile work environment' : null,
  ].filter(Boolean).join('; ') || `${category} involving improper workplace conduct.`;

  const detailedDescription = story || `On or around ${incidentDate || 'recent dates'}, ${personInvolved} engaged in improper behavior towards the complainant. Despite clear lack of consent, the actions persisted, impacting the complainant's professional duties, mental wellbeing, and personal security.`;

  const safetyConcerns = [
    isImmediateDanger ? 'URGENT: Complainant indicates immediate physical/safety threat.' : null,
    hasThreat ? 'Fear of employment retaliation, adverse performance review, or termination.' : null,
    hasStalking ? 'Concerns regarding personal physical stalking during commute and outside office.' : null,
  ].filter(Boolean).join(' ') || 'Concerns regarding workplace retaliation and psychological safety.';

  const requestedAction = hasThreat || hasPhysicalContact || isImmediateDanger
    ? 'Immediate interim relief including protective reassignment, formal inquiry under POSH Act 2013, prevention of retaliatory action, and necessary police notification if safety is compromised.'
    : 'Formal constitution of inquiry committee, prompt investigation under organizational policy / POSH Act, and guarantee against workplace retaliation.';

  // Check missing items
  const missingInfoList = [];
  if (!incidentDate) missingInfoList.push({ field: 'incidentDate', label: 'Incident Date', status: 'missing', message: 'Specific date of the occurrence is not provided.' });
  else missingInfoList.push({ field: 'incidentDate', label: 'Incident Date', status: 'provided', message: `Specified as ${incidentDate}.` });

  if (!witnesses || witnesses.trim() === '') missingInfoList.push({ field: 'witnesses', label: 'Witness Information', status: 'warning', message: 'No witnesses specified; corroboration helps evidentiary strength.' });
  else missingInfoList.push({ field: 'witnesses', label: 'Witness Information', status: 'provided', message: `Witnesses documented: ${witnesses}` });

  if (evidenceList.length === 0) missingInfoList.push({ field: 'evidence', label: 'Evidence Attached', status: 'warning', message: 'No digital evidence files attached to this draft yet.' });
  else missingInfoList.push({ field: 'evidence', label: 'Evidence Attached', status: 'provided', message: `${evidenceList.length} evidence file(s) cryptographically hashed.` });

  if (!location) missingInfoList.push({ field: 'location', label: 'Location Details', status: 'missing', message: 'Physical/virtual venue of incident not specified.' });
  else missingInfoList.push({ field: 'location', label: 'Location Details', status: 'provided', message: `Identified as ${location}.` });

  return {
    title,
    summary,
    natureOfHarassment,
    detailedDescription,
    safetyConcerns,
    requestedAction,
    witnesses: witnesses || 'To be identified during inquiry',
    missingInfoList,
    generatedAt: new Date().toISOString()
  };
};

/**
 * Transparent AI Risk Scoring Engine (0 - 100)
 */
export const calculateRiskScore = ({
  category = '',
  description = '',
  hasThreat = false,
  hasPhysicalContact = false,
  hasStalking = false,
  hasCyberHarassment = false,
  isImmediateDanger = false,
  isStillInContact = false
}) => {
  let score = 20; // baseline report severity
  const factors = [];

  const textLower = (description || '').toLowerCase();

  // Factor 1: Immediate danger
  if (isImmediateDanger || textLower.includes('urgent') || textLower.includes('danger') || textLower.includes('hurt me')) {
    score += 30;
    factors.push({ name: 'Immediate Physical / Safety Threat', weight: '+30', severity: 'critical' });
  }

  // Factor 2: Physical violence or contact
  if (hasPhysicalContact || textLower.includes('physical') || textLower.includes('grabbed') || textLower.includes('touched') || textLower.includes('assault')) {
    score += 20;
    factors.push({ name: 'Physical Contact / Violence Indicators', weight: '+20', severity: 'high' });
  }

  // Factor 3: Retaliation Threat / Power Coercion
  if (hasThreat || textLower.includes('fire') || textLower.includes('job') || textLower.includes('threat') || textLower.includes('ruin') || textLower.includes('career')) {
    score += 18;
    factors.push({ name: 'Retaliation / Employment Coercion Threat', weight: '+18', severity: 'high' });
  }

  // Factor 4: Stalking / Continuous Tracking
  if (hasStalking || textLower.includes('following') || textLower.includes('stalk') || textLower.includes('car') || textLower.includes('home')) {
    score += 16;
    factors.push({ name: 'Persistent Stalking & Out-of-Office Surveillance', weight: '+16', severity: 'high' });
  }

  // Factor 5: Repeat harassment / ongoing contact
  if (isStillInContact || textLower.includes('repeatedly') || textLower.includes('every day') || textLower.includes('multiple times') || textLower.includes('again and again')) {
    score += 14;
    factors.push({ name: 'Repeated Incident Pattern / Ongoing Contact', weight: '+14', severity: 'medium' });
  }

  // Factor 6: Cyber harassment / Weapon / Extortion indicators
  if (hasCyberHarassment || textLower.includes('leaked') || textLower.includes('photos') || textLower.includes('blackmail') || textLower.includes('weapon')) {
    score += 12;
    factors.push({ name: 'Digital Harassment / Extortion / Weapon Mention', weight: '+12', severity: 'medium' });
  }

  // Cap at 98 max
  score = Math.min(Math.max(score, 15), 98);

  let riskLevel = 'LOW';
  if (score >= 80) riskLevel = 'CRITICAL';
  else if (score >= 60) riskLevel = 'HIGH';
  else if (score >= 30) riskLevel = 'MEDIUM';

  let explanation = '';
  if (riskLevel === 'CRITICAL') {
    explanation = 'Immediate emergency escalation recommended. Multiple high-severity flags detected (physical safety threat, severe retaliation, or stalking).';
  } else if (riskLevel === 'HIGH') {
    explanation = 'High priority inquiry recommended. Significant retaliation threat or persistent harassment patterns present.';
  } else if (riskLevel === 'MEDIUM') {
    explanation = 'Moderate risk profile. Prompt workplace internal investigation advised with interim anti-retaliation protections.';
  } else {
    explanation = 'Standard grievance pathway. Procedural workplace inquiry advised.';
  }

  return {
    score,
    riskLevel,
    factors,
    explanation
  };
};

/**
 * Authority Pathway Recommendation
 */
export const recommendAuthority = ({
  category = '',
  riskScore = 0,
  hasPhysicalContact = false,
  hasThreat = false,
  hasStalking = false,
  isImmediateDanger = false
}) => {
  if (isImmediateDanger || riskScore >= 80 || (hasThreat && hasPhysicalContact)) {
    return {
      recommendedAuthority: 'Police / Law Enforcement Escalation + Internal ICC',
      urgency: 'IMMEDIATE',
      reason: 'Criminal elements detected including immediate threat, bodily harm or extortion exceeding civil workplace bounds.',
      requiredNextStep: 'File police complaint / Section 154 CrPC / BNS referral with evidence hash certificate; initiate emergency ICC interim separation.'
    };
  }

  if (category.toLowerCase().includes('sexual') || hasPhysicalContact || hasStalking) {
    return {
      recommendedAuthority: 'Internal Complaints Committee (ICC)',
      urgency: 'HIGH',
      reason: 'Mandated jurisdiction under Sexual Harassment of Women at Workplace (POSH) Act 2013.',
      requiredNextStep: 'ICC Presiding Officer must initiate 90-day inquiry, provide copy to respondent within 7 days, and offer interim relief.'
    };
  }

  if (riskScore >= 60 || hasThreat) {
    return {
      recommendedAuthority: 'Internal ICC & Human Resources Leadership',
      urgency: 'PRIORITY',
      reason: 'Severe power imbalance and employment retaliation threat require administrative intervention and formal inquiry.',
      requiredNextStep: 'Formal investigation notice, reporting structure separation, and whistleblower protection.'
    };
  }

  return {
    recommendedAuthority: 'Internal Complaints Committee / HR Grievance',
    urgency: 'STANDARD',
    reason: 'Standard organizational grievance and dignity at work resolution protocol.',
    requiredNextStep: 'Informal conciliation (if requested by survivor) or commencement of committee inquiry.'
  };
};

/**
 * Speech to Text Multi-lingual Simulation
 */
export const transcribeSpeech = (language = 'en', preset = 'default') => {
  const transcripts = {
    en: "I was repeatedly receiving inappropriate messages from my manager on private chat after work hours. Yesterday during our performance review meeting, he explicitly told me that if I complained or refused his invitations, my annual appraisal would be ruined and I would lose my job.",
    hi: "मेरे मैनेजर काम के बाद मुझे व्यक्तिगत चैट पर आपत्तिजनक संदेश भेज रहे थे। कल हमारी बैठक में, उन्होंने धमकी दी कि अगर मैंने इसकी शिकायत की, तो मुझे नौकरी से निकाल दिया जाएगा और मेरा करियर बर्बाद कर दिया जाएगा।",
    mr: "माझे मॅनेजर कामाच्या वेळेनंतर मला वैयक्तिक चॅटवर अयोग्य संदेश पाठवत होते. कालच्या बैठकीत त्यांनी मला स्पष्टपणे सांगितले की मी तक्रार केल्यास मला कामावरून काढून टाकले जाईल."
  };

  return transcripts[language] || transcripts.en;
};
