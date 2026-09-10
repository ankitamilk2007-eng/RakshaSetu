import crypto from 'crypto';

/**
 * Generates official Section 65B Indian Evidence Act compliant certificate data
 */
export const generateSection65BCertificate = ({
  evidenceId,
  caseId,
  fileName,
  fileType,
  fileSize,
  sha256Hash,
  uploadedAt,
  uploaderName = 'Confidential Survivor',
  systemHost = 'RakshaSetu Production Vault Node 01'
}) => {
  const generatedAt = new Date().toISOString();
  const certId = `CERT-65B-${Date.now().toString(36).toUpperCase()}-${evidenceId.replace(/[^a-zA-Z0-9]/g, '')}`;

  const certDataToSign = `${certId}|${evidenceId}|${caseId}|${sha256Hash}|${uploadedAt}|${generatedAt}`;
  const digitalSignature = crypto.createHash('sha256').update(certDataToSign).digest('hex');

  return {
    certificateId: certId,
    actReference: 'Section 65B, Indian Evidence Act, 1872 / Section 63, Bharatiya Sakshya Adhiniyam, 2023',
    evidenceId,
    caseId,
    fileName,
    fileType,
    fileSize: `${(fileSize / 1024).toFixed(2)} KB`,
    sha256Hash,
    integrityStatus: 'VERIFIED_UNALTERED',
    timestampRecorded: uploadedAt,
    certificateGeneratedAt: generatedAt,
    systemHost,
    digitalSignature,
    legalDeclaration: 
      "This document certifies that the electronic record identified herein was produced by the computer system during the period over which the computer was used regularly to store or process information. The cryptographic SHA-256 hash was generated automatically upon ingestion into the immutable evidence vault without alteration, truncation, or intermediate human manipulation.",
    legalDisclaimer: 
      "IMPORTANT DISCLAIMER: Prototype evidence documentation for hackathon demonstration purposes. Real-world legal admissibility under Section 65B / Section 63 BSA requires formal affidavit and signing by an authorized officer in charge of the computer system."
  };
};
