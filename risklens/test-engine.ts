import { getProjects, getProjectById, getConstituencies } from "./lib/synthetic/fixtures/dataset";
import { runPreSanctionScan } from "./lib/engine/pre-sanction";
import { predictProjectDelay } from "./lib/engine/delay-predictor";
import { evaluateConstituencyEquity } from "./lib/engine/equity-radar";
import { generateInspectionRoute } from "./lib/engine/inspection-optimizer";
import { verifyPhotoSignature } from "./lib/engine/crypto-signing";

function runFullSuiteVerification() {
  console.log("=== RISKLENS FULL PRODUCTION SUITE (PHASES 1–6) VERIFICATION RUN ===");
  const projects = getProjects();
  const constituencies = getConstituencies();
  console.log(`Indexed Projects: ${projects.length}, Indexed Constituencies: ${constituencies.length}`);

  // Test 1: Clean Baseline Project
  const clean = getProjectById("PRJ-2023-088");
  if (!clean) throw new Error("PRJ-2023-088 not found");
  console.log(`\n[Pass] Test 1: Clean Baseline PRJ-2023-088 Score = ${clean.riskScore.compositeScore}/100 (Expected < 25)`);
  if (clean.riskScore.compositeScore >= 25) throw new Error("Clean project failed");

  // Test 2: Hero Spotlight Project
  const hero = getProjectById("HERO-MPLADS-001");
  if (!hero) throw new Error("HERO-MPLADS-001 not found");
  console.log(`[Pass] Test 2: Hero Anomaly HERO-MPLADS-001 Score = ${hero.riskScore.compositeScore}/100 (Expected >= 70)`);
  if (hero.riskScore.compositeScore < 70) throw new Error("Hero project failed");

  // Test 3: Phase 2.1 Pre-Sanction Risk Scanner
  const preCheck = runPreSanctionScan({
    proposedWorkTitle: "Heavy Rural Bridge Construction",
    workCategory: "Roads & Bridges",
    proposedCostINR: 8500000, // Excessive budget
    assignedImplementingRole: "District Planning Officer IDA",
    constituencyId: "Constituency X-01",
    activeProjectsWithAgencyCount: 9,
  });
  console.log(`\n[Pass] Test 3: Pre-Sanction Scanner: Warning Flags Count = ${preCheck.warningFlags.length}, Can Sanction = ${preCheck.canSanction}`);
  if (preCheck.warningFlags.length === 0) throw new Error("Pre-sanction check failed to flag excessive cost");

  // Test 4: Phase 2.2 Delay Predictor ML Model
  const delayPred = hero.delayPrediction;
  console.log(`[Pass] Test 4: Delay Predictor on HERO-001: Likelihood = ${delayPred?.likelihood}, Probability = ${delayPred?.probabilityScore}%`);
  if (delayPred?.likelihood !== "High") throw new Error("Delay predictor failed on HERO-001");

  // Test 5: Phase 4.1 Cryptographic Signature Verification
  const signedPhoto = hero.photos[0];
  const sigCheck = verifyPhotoSignature(signedPhoto);
  console.log(`\n[Pass] Test 5: Cryptographic Signature Verification: Valid = ${sigCheck.isValid}, Role = ${sigCheck.signerCertificateRole}`);
  if (!sigCheck.isValid) throw new Error("Signed photo check failed");

  // Test 6: Phase 6.1 Inspection Resource Optimizer (≥10% statutory constraint)
  const inspectionPlan = generateInspectionRoute(projects, 10, 15);
  console.log(`[Pass] Test 6: Inspection Optimizer: Selected ${inspectionPlan.selectedProjectsCount} works (${inspectionPlan.mandateMetPercentage}% coverage), Travel Dist: ${inspectionPlan.estimatedTotalTravelKm} km`);
  if (inspectionPlan.mandateMetPercentage < 10) throw new Error("Inspection mandate not satisfied");

  // Test 7: Phase 6.2 Neglected Constituency Equity Radar
  const underserved = constituencies.map((c) =>
    evaluateConstituencyEquity(c, projects.filter((p) => p.constituencyId === c.id))
  ).filter((m) => m.isUnderServed);
  console.log(`[Pass] Test 7: Equity Radar: Found ${underserved.length} underserved constituencies (e.g. ${underserved[0]?.constituencyId}: ${underserved[0]?.neglectSeverityTier})`);
  if (underserved.length === 0) throw new Error("Equity radar found no underserved constituencies");

  // Test 8: Vocabulary Neutrality Audit
  const allText = JSON.stringify(projects) + JSON.stringify(constituencies);
  const forbidden = ["fraud", "corrupt", "cheat", "scam"];
  for (const word of forbidden) {
    if (new RegExp(`\\b${word}\\b`, "i").test(allText)) {
      throw new Error(`Forbidden word '${word}' found in dataset output!`);
    }
  }
  console.log(`\n[Pass] Test 8: 100% Clean Neutral Vocabulary Audit (Zero forbidden words).`);

  console.log("\n=== ALL 8 FULL-SUITE VERIFICATION CHECKS PASSED ===");
}

runFullSuiteVerification();
