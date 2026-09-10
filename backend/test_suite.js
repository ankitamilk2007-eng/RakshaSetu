import crypto from 'crypto';
import fs from 'fs';

const API = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('  RAKSHASETU AUTOMATED INTEGRATION TEST SUITE');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  const assert = (condition, name) => {
    if (condition) {
      console.log(`  [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${name}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await (await fetch(`${API}/health`)).json();
    assert(health.status === 'HEALTHY', 'API health check is HEALTHY');

    // 2. User Login
    const userAuth = await (await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@demo.com', password: 'User@123' })
    })).json();
    assert(userAuth.token && userAuth.user.role === 'USER', 'Survivor authentication succeeds');
    const userToken = userAuth.token;

    // 3. Admin Login
    const adminAuth = await (await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@demo.com', password: 'Admin@123' })
    })).json();
    assert(adminAuth.token && adminAuth.user.role === 'ADMIN', 'Admin / ICC authentication succeeds');
    const adminToken = adminAuth.token;

    // 4. Police Login
    const policeAuth = await (await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'police@demo.com', password: 'Police@123' })
    })).json();
    assert(policeAuth.token && policeAuth.user.role === 'POLICE', 'Police Authority authentication succeeds');
    const policeToken = policeAuth.token;

    // 5. Test Access Control: Police role forbidden from Admin dashboard
    const forbiddenAdmin = await fetch(`${API}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${policeToken}` }
    });
    assert(forbiddenAdmin.status === 403, 'RBAC prevents Police from viewing internal Admin dashboard');

    // 6. Test AI Complaint Structuring & Risk Scoring
    const aiRes = await (await fetch(`${API}/complaints/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        rawStory: "My manager told me that I would be fired if I didn't come to dinner with him, and grabbed my arm.",
        category: 'Sexual harassment',
        personInvolved: 'Rajesh Sharma',
        hasThreat: true,
        hasPhysicalContact: true,
        isImmediateDanger: true
      })
    })).json();
    assert(aiRes.risk.score >= 80 && aiRes.risk.riskLevel === 'CRITICAL', 'AI evaluates severe danger flags as CRITICAL (>= 80/100)');
    assert(aiRes.complaint.title && aiRes.complaint.missingInfoList.length > 0, 'AI generates structured complaint and detects missing info');

    // 7. Verify SHA-256 hash calculation on seeded evidence
    const evList = await (await fetch(`${API}/evidence`, {
      headers: { Authorization: `Bearer ${userToken}` }
    })).json();
    assert(evList.evidence && evList.evidence.length > 0, 'Evidence vault items retrieved successfully');

    const sampleEv = evList.evidence[0];
    const verifyEv = await (await fetch(`${API}/evidence/${sampleEv.id}/verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` }
    })).json();
    assert(verifyEv.isMatch === true && verifyEv.integrityStatus === 'INTEGRITY_VERIFIED', 'Live SHA-256 cryptographic verification matches disk file');

    // 8. Generate Section 65B Certificate
    const certRes = await (await fetch(`${API}/evidence/${sampleEv.id}/certificate`, {
      headers: { Authorization: `Bearer ${userToken}` }
    })).json();
    assert(certRes.certificate && certRes.certificate.digitalSignature, 'Section 65B Electronic Evidence Certificate generated with digital signature');

    // 9. Admin Dashboard Metrics & High-Risk Priority Queue
    const adminDash = await (await fetch(`${API}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })).json();
    assert(adminDash.metrics.totalCases >= 8 && adminDash.metrics.criticalCases > 0, 'Admin dashboard displays aggregated metrics and critical risk queue');

    // 10. Check Matching Escrow Serial Offender Pattern
    const patterns = await (await fetch(`${API}/admin/patterns`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })).json();
    const rajeshPattern = patterns.patterns.find(p => p.id === 'PAT-2026-008');
    assert(rajeshPattern && rajeshPattern.threshold_met === true && rajeshPattern.report_count >= 2, 'Matching Escrow detected serial offender threshold (PAT-2026-008, 2 reports)');

    // 11. Escalate Case to Police
    const escRes = await (await fetch(`${API}/admin/cases/RS-2026-000127/escalate-police`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ reason: 'Serial offender threshold reached in matching escrow and critical threat flags.' })
    })).json();
    assert(escRes.referralId, 'Case RS-2026-000127 successfully escalated to Police portal');

    // 12. Police Portal Receives Referral
    const policeRefs = await (await fetch(`${API}/police/referrals`, {
      headers: { Authorization: `Bearer ${policeToken}` }
    })).json();
    const referredCase = policeRefs.referrals.find(r => r.case_id === 'RS-2026-000127');
    assert(referredCase && referredCase.id, 'Police Authority receives escalated referral in queue');

    // 13. Police Forensic Evidence Verification Tool
    const policeVerify = await (await fetch(`${API}/police/verify-hash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${policeToken}` },
      body: JSON.stringify({ evidenceId: sampleEv.id, testHash: sampleEv.sha256_hash })
    })).json();
    assert(policeVerify.isMatch === true && policeVerify.status === 'VERIFIED_TAMPER_FREE', 'Police forensic verification tool confirms tamper-free cryptographic hash');

    // 14. Police Status Update
    const policeUpdate = await (await fetch(`${API}/police/referrals/${referredCase.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${policeToken}` },
      body: JSON.stringify({
        status: 'FIR_INITIATED',
        firNumber: 'FIR-2026-BKC-0949',
        policeNotes: 'Preliminary inquiry accepted. CCTV footage seized.'
      })
    })).json();
    assert(policeUpdate.message.includes('updated'), 'Police records preliminary inquiry / FIR docket action');

    // 15. Check Survivor sees updated timeline and status
    const caseAfter = await (await fetch(`${API}/cases/RS-2026-000127`, {
      headers: { Authorization: `Bearer ${userToken}` }
    })).json();
    assert(caseAfter.case.is_police_escalated === true, 'Complainant portal reflects real-time status update');

    console.log('====================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) process.exit(1);
    else process.exit(0);

  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
