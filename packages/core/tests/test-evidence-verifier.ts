import { EvidenceVerifier, EvidenceTracker } from '../src/index.js';

async function testEvidenceVerifier() {
  console.log('=== Running Codex-Style Evidence Verification Gate Test Suite ===\n');

  const verifier = new EvidenceVerifier();

  // Test 1: Valid empirical statistics & biochemical values (Adopted)
  console.log('[Test 1/4] Valid Numerical & Biological Data (ADOPTED)');
  const validOutput = {
    geneName: 'TYK2',
    sequenceLength: 1187,
    ic50Value: '12.5 nM',
    pValue: 0.0012,
    plddtScore: 88.4,
    meanHounsfield: 45.2,
    summary: 'IC50: 12.5 nM, p-value = 0.0012, pLDDT: 88.4',
  };

  const validRes = verifier.verify('python_runner', 'computation', 'compute stats', validOutput);
  console.log(`  ✔ Verdict: ${validRes.verdict} (Confidence: ${validRes.confidenceScore * 100}%)`);
  console.log(`  ✔ Reason: ${validRes.reasonSummary}`);
  if (validRes.verdict !== 'ADOPTED') {
    throw new Error(`Expected ADOPTED, got ${validRes.verdict}`);
  }

  // Test 2: Fatal Mathematical Boundaries: Out-of-bounds p-value & negative IC50 (Rejected)
  console.log('\n[Test 2/4] Fatal Mathematical Boundaries (REJECTED)');
  const invalidPValueOutput = {
    summary: 'Statistical significance calculated: p-value = 1.35, IC50 = -4.2 nM',
  };

  const invalidRes = verifier.verify('python_runner', 'computation', 'bad stats', invalidPValueOutput);
  console.log(`  ✔ Verdict: ${invalidRes.verdict} (Confidence: ${invalidRes.confidenceScore * 100}%)`);
  console.log(`  ✔ Caught Anomaly: ${invalidRes.reasonSummary}`);
  if (invalidRes.verdict !== 'REJECTED') {
    throw new Error(`Expected REJECTED for p=1.35 & IC50=-4.2, got ${invalidRes.verdict}`);
  }

  // Test 3: Computational Anomalies: NaN / Division by Zero (Rejected)
  console.log('\n[Test 3/4] Computational Anomaly: NaN / ZeroDivision (REJECTED)');
  const nanOutput = {
    error: 'ZeroDivisionError: float division by zero',
    calculatedLoss: 'NaN',
    std: 'inf',
  };

  const nanRes = verifier.verify('python_runner', 'computation', 'crash test', nanOutput);
  console.log(`  ✔ Verdict: ${nanRes.verdict} (Confidence: ${nanRes.confidenceScore * 100}%)`);
  console.log(`  ✔ Caught Anomaly: ${nanRes.reasonSummary}`);
  if (nanRes.verdict !== 'REJECTED') {
    throw new Error(`Expected REJECTED for NaN & ZeroDivisionError, got ${nanRes.verdict}`);
  }

  // Test 4: Extreme Scale Warning (Flagged with Warning)
  console.log('\n[Test 4/4] Warning Scale Check: HU Out of Range / Extreme IC50 (FLAGGED)');
  const warningOutput = {
    summary: 'MeanHU: 4500.0 HU, IC50: 0.00000000000000000001 M',
  };

  const warningRes = verifier.verify('medical_imaging_process', 'medical', 'ct radiomics', warningOutput);
  console.log(`  ✔ Verdict: ${warningRes.verdict} (Confidence: ${warningRes.confidenceScore * 100}%)`);
  console.log(`  ✔ Warning Details: ${warningRes.reasonSummary}`);
  if (warningRes.verdict !== 'FLAGGED_WITH_WARNING') {
    throw new Error(`Expected FLAGGED_WITH_WARNING, got ${warningRes.verdict}`);
  }

  // Integration Test with EvidenceTracker
  console.log('\n[Integration Check] EvidenceTracker Auto-Tagging with Verification Status');
  const tracker = new EvidenceTracker();
  const ev1 = tracker.record('python_runner', 'computation', 'valid stats', 'Plausible calculation', validOutput);
  const ev2 = tracker.record('python_runner', 'computation', 'extreme scale', 'Scale anomaly', warningOutput);

  console.log(`  ✔ EV-1 status: ${ev1.verificationStatus} -> summary: "${ev1.summary}"`);
  console.log(`  ✔ EV-2 status: ${ev2.verificationStatus} -> summary: "${ev2.summary.slice(0, 60)}..."`);

  if (ev1.verificationStatus !== 'verified' || ev2.verificationStatus !== 'flagged') {
    throw new Error('EvidenceTracker verification status integration failed');
  }

  // Test 5: False-Positive Immunity (URL params ?p=2, citation pages p. 12, lowercase words like nanometer/banana)
  console.log('\n[Test 5/5] False-Positive Immunity: URL Parameters, Citations, & Word Substrings (ADOPTED)');
  const urlAndPageOutput = {
    url: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&p=25&retmode=json',
    citationReference: 'Journal of Immunology, Vol. 142, p. 185-192, section p: 4',
    particleSize: '15 nanometers (nm)',
    targetCompound: 'banana-derived flavonoid',
    summary: 'Retrieved 15 records from PubMed pagination endpoint (page=2, p=25). Particle scale: 20 nm.',
  };

  const fpRes = verifier.verify('literature_search', 'literature', 'query url and text', urlAndPageOutput);
  console.log(`  ✔ Verdict: ${fpRes.verdict} (Confidence: ${fpRes.confidenceScore * 100}%)`);
  console.log(`  ✔ Reason: ${fpRes.reasonSummary}`);
  if (fpRes.verdict !== 'ADOPTED') {
    throw new Error(`CRITICAL FALSE POSITIVE: EvidenceVerifier falsely rejected valid output containing URL param "?p=25" or text "p. 185"! Got ${fpRes.verdict} (${fpRes.reasonSummary})`);
  }

  console.log('\n✔ ALL EVIDENCE VERIFIER TESTS (INCLUDING FALSE-POSITIVE IMMUNITY) PASSED (100% SUCCESS)\n');
}

testEvidenceVerifier().catch((err) => {
  console.error('\n✖ Evidence verifier test failed:', err);
  process.exit(1);
});
