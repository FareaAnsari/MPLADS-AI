import {
  Project,
  Constituency,
  WorkCategory,
  ProjectStatus,
  PaymentTranche,
  StageEvent,
  EvidencePhoto,
  InvestigationCase,
  RiskTimelinePoint,
} from "@/lib/types";
import { computeRiskScore } from "@/lib/engine/risk-score";
import { predictProjectDelay } from "@/lib/engine/delay-predictor";

const WORK_CATEGORIES: WorkCategory[] = [
  "Roads & Bridges",
  "Drinking Water",
  "Community Halls",
  "School Infrastructure",
  "Sanitation & Public Health",
  "Solar & Street Lighting",
];

const ROLES = [
  "District Planning Officer IDA",
  "Executive Engineer PWD",
  "Block Development Officer (BDO)",
  "Superintending Engineer Rural Works",
  "District Technical Evaluator",
];

const PHOTO_SAMPLES = [
  {
    url: "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=800&q=80",
    caption: "Culvert concrete foundation & rebar inspection",
    pHash: "e4f8a3c2b1d09e7f",
  },
  {
    url: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80",
    caption: "Paved rural road surfacing & edge compaction",
    pHash: "9a8b7c6d5e4f3a2b",
  },
  {
    url: "https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80",
    caption: "Overhead drinking water storage reservoir structure",
    pHash: "3f2e1d0c9b8a7f6e",
  },
  {
    url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
    caption: "Community hall reinforced roofing framework",
    pHash: "1a2b3c4d5e6f7a8b",
  },
];

const DUPLICATE_PAIR = {
  original: {
    url: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80",
    caption: "Solar street illumination installation milestone",
    pHash: "cc88aa2211bb44ff",
  },
  duplicate: {
    url: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80",
    caption: "Solar panel array post-completion verification",
    pHash: "cc88aa2211bb44fe",
  },
};

export function generateSyntheticDataset(projectCount: number = 180): {
  projects: Project[];
  constituencies: Constituency[];
} {
  const constituencies: Constituency[] = [];
  for (let i = 1; i <= 24; i++) {
    const pad = i < 10 ? `0${i}` : `${i}`;
    const stateLetter = String.fromCharCode(87 + (i % 6));
    const id = `Constituency ${stateLetter}-${pad}`;
    constituencies.push({
      id,
      stateCode: `State ${stateLetter}`,
      totalProjects: 0,
      totalSanctionedINR: 0,
      totalDisbursedINR: 0,
      averageRiskScore: 0,
      openFlaggedCasesCount: 0,
      avatarSeed: `constituency-${id}`,
      utilizationRatePct: 0,
      inspectionCoveragePct: 0,
      isNeglectedEquityFlagged: i === 5 || i === 12 || i === 19, // Injected neglected constituencies for equity radar
    });
  }

  const projects: Project[] = [];

  // 1. HERO DEMO PROJECT (HERO-MPLADS-001)
  const heroPhotos: EvidencePhoto[] = [
    {
      id: "PHT-HERO-01",
      url: DUPLICATE_PAIR.duplicate.url,
      caption: "High-mast lighting structure completion snapshot",
      capturedAt: "2024-03-18T14:30:00Z",
      latitude: 19.0760,
      longitude: 72.8777,
      pHash: DUPLICATE_PAIR.duplicate.pHash,
      matchedProjectId: "PRJ-2023-088",
      matchedPhotoId: "PHT-REF-088",
      hammingDistance: 2,
      isDuplicateFlagged: true,
      isCryptographicallySigned: true,
      signatureHash: "sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      deviceFingerprint: "TPM2-GOV-HW-8891",
    },
  ];

  const heroTranches: PaymentTranche[] = [
    {
      trancheNumber: 1,
      amountINR: 2800000,
      disbursedDate: "2023-11-10",
      stageMilestone: "Mobilization & Material Sourcing",
      utilizationCertificateSubmitted: true,
      voucherRefNumber: "VCH-2023-0101",
    },
    {
      trancheNumber: 2,
      amountINR: 3500000,
      disbursedDate: "2024-01-20",
      stageMilestone: "Erection of Infrastructure",
      utilizationCertificateSubmitted: false,
      voucherRefNumber: "VCH-2024-0342",
    },
    {
      trancheNumber: 3,
      amountINR: 2900000,
      disbursedDate: "2024-03-28",
      stageMilestone: "Final Handover",
      utilizationCertificateSubmitted: false,
      voucherRefNumber: "VCH-2024-0899",
    },
  ];

  const heroStages: StageEvent[] = [
    {
      stageName: "Administrative Sanction",
      expectedDays: 45,
      actualDays: 40,
      startDate: "2023-08-01",
      completionDate: "2023-09-10",
      responsibleRole: "District Planning Authority",
      isDelayed: false,
      delayRatio: 0.89,
      physicalProgressAtStage: 15,
    },
    {
      stageName: "Technical Sanction & Tendering",
      expectedDays: 60,
      actualDays: 245,
      startDate: "2023-09-11",
      completionDate: "2024-05-14",
      responsibleRole: "District Planning Officer IDA",
      isDelayed: true,
      delayRatio: 4.08,
      physicalProgressAtStage: 30,
    },
    {
      stageName: "Physical Execution & Commissioning",
      expectedDays: 180,
      actualDays: 195,
      startDate: "2024-05-15",
      responsibleRole: "Executive Engineer PWD",
      isDelayed: true,
      delayRatio: 1.08,
      physicalProgressAtStage: 42,
    },
  ];

  const heroHistory: RiskTimelinePoint[] = [
    { date: "2023-08-01", score: 14, triggerEvent: "Administrative Sanction Issued" },
    { date: "2023-11-10", score: 22, triggerEvent: "Tranche #1 Disbursed (UC verified)" },
    { date: "2024-01-20", score: 48, triggerEvent: "Tranche #2 Disbursed without mandatory UC" },
    { date: "2024-03-28", score: 68, triggerEvent: "March Fiscal Rush Tranche #3 Released" },
    { date: "2024-05-14", score: 74, triggerEvent: "pHash duplicate match flagged vs PRJ-2023-088" },
  ];

  const heroProject: Project = {
    id: "HERO-MPLADS-001",
    title: "Solar High-Mast Grid & Public Facility Electrification",
    description: "Installation of 12-meter octagonal high-mast solar illumination luminaires across 14 public junction points.",
    workCategory: "Solar & Street Lighting",
    constituencyId: "Constituency X-01",
    stateCode: "State X",
    sanctionedAmountINR: 9200000,
    expenditureAmountINR: 9200000,
    physicalProgressPct: 42, // Significant mismatch vs 100% money spent
    peerGroupMedianINR: 750000,
    peerGroupRangeMinINR: 500000,
    peerGroupRangeMaxINR: 1000000,
    sanctionDate: "2023-08-01",
    targetCompletionDate: "2024-06-30",
    status: "Delayed",
    latitude: 19.0760,
    longitude: 72.8777,
    implementingAgencyRole: "District Planning Officer IDA",
    contractorEntityId: "ENT-SOLAR-CORP-09",
    paymentTranches: heroTranches,
    stageEvents: heroStages,
    photos: heroPhotos,
    riskScore: {
      compositeScore: 74,
      tier: "high",
      whyFlaggedSummary: "Flagged for verification due to: Peer Cost Outlier, Stage SLA Bottleneck, Disbursement & UC Compliance, Duplicate Evidence (pHash). Review recommended.",
      breakdown: [],
      calculatedAt: new Date().toISOString(),
      algorithmVersion: "RiskLens-v2.1",
      history: heroHistory,
    },
    delayPrediction: {
      likelihood: "High",
      probabilityScore: 84,
      expectedDelayDays: 140,
      primaryRiskFactors: [
        "Financial disbursement (100%) severely outpaces physical progress (42%) by 58%.",
        "Technical Sanction experienced 4.1× bottleneck.",
      ],
    },
    crossSchemeMatch: {
      matchedScheme: "15th Finance Commission Grant",
      externalProjectId: "FC-15-URB-8802",
      assetDescription: "High-mast illumination junction pole structure",
      sanctionedAmountINR: 3200000,
      spatialDistanceMeters: 45,
      textOverlapScore: 78,
    },
    investigationCase: {
      id: "CASE-HERO-001",
      projectId: "HERO-MPLADS-001",
      status: "Open",
      flaggedSignals: [
        "Peer Cost Outlier",
        "Stage SLA Bottleneck",
        "Duplicate Evidence (pHash)",
        "Disbursement & UC Compliance",
      ],
      escalationLevel: "District",
    },
    synthetic: true,
    dataSource: "synthetic",
  };

  projects.push(heroProject);

  // Reference project paired with the duplicate photo
  const refProject: Project = {
    id: "PRJ-2023-088",
    title: "Rural High-Mast Illumination Unit",
    description: "Erection of standalone solar street illumination pillar at central panchayat bazaar.",
    workCategory: "Solar & Street Lighting",
    constituencyId: "Constituency W-03",
    stateCode: "State W",
    sanctionedAmountINR: 820000,
    expenditureAmountINR: 820000,
    physicalProgressPct: 100,
    peerGroupMedianINR: 750000,
    peerGroupRangeMinINR: 500000,
    peerGroupRangeMaxINR: 1000000,
    sanctionDate: "2023-01-15",
    targetCompletionDate: "2023-09-30",
    actualCompletionDate: "2023-09-18",
    status: "Completed",
    latitude: 18.5204,
    longitude: 73.8567,
    implementingAgencyRole: "Superintending Engineer Rural Works",
    contractorEntityId: "ENT-RURAL-INFRA-12",
    paymentTranches: [
      {
        trancheNumber: 1,
        amountINR: 820000,
        disbursedDate: "2023-03-10",
        stageMilestone: "Full Sanction Completion",
        utilizationCertificateSubmitted: true,
      },
    ],
    stageEvents: [
      {
        stageName: "Execution & Handover",
        expectedDays: 120,
        actualDays: 110,
        startDate: "2023-03-15",
        completionDate: "2023-07-05",
        responsibleRole: "Superintending Engineer Rural Works",
        isDelayed: false,
        delayRatio: 0.92,
        physicalProgressAtStage: 100,
      },
    ],
    photos: [
      {
        id: "PHT-REF-088",
        url: DUPLICATE_PAIR.original.url,
        caption: "Solar mast operational verification",
        capturedAt: "2023-07-10T10:00:00Z",
        latitude: 18.5204,
        longitude: 73.8567,
        pHash: DUPLICATE_PAIR.original.pHash,
        isCryptographicallySigned: true,
        signatureHash: "sha256-a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890",
      },
    ],
    riskScore: {
      compositeScore: 12,
      tier: "low",
      whyFlaggedSummary: "Project metrics align with cohort baselines; no priority anomalies observed.",
      breakdown: [],
      calculatedAt: new Date().toISOString(),
      algorithmVersion: "RiskLens-v2.1",
      history: [
        { date: "2023-01-15", score: 10, triggerEvent: "Sanction Registered" },
        { date: "2023-09-18", score: 12, triggerEvent: "Work Handover Completed" },
      ],
    },
    delayPrediction: {
      likelihood: "Low",
      probabilityScore: 8,
      expectedDelayDays: 0,
      primaryRiskFactors: ["Work completed on schedule."],
    },
    synthetic: true,
    dataSource: "synthetic",
  };
  projects.push(refProject);

  // Generate remaining synthetic projects
  for (let i = 3; i <= projectCount; i++) {
    const pad = i < 10 ? `00${i}` : i < 100 ? `0${i}` : `${i}`;
    const id = `PRJ-2024-${pad}`;
    const category = WORK_CATEGORIES[i % WORK_CATEGORIES.length];
    const constituency = constituencies[i % constituencies.length];

    const isCostAnomaly = i >= 10 && i <= 16;
    const isSlaDelayAnomaly = i >= 20 && i <= 26;
    const isPaymentAnomaly = i >= 30 && i <= 34;

    let baseCost = 2500000;
    if (category === "Roads & Bridges") baseCost = 3500000;
    if (category === "Drinking Water") baseCost = 1200000;
    if (category === "Sanitation & Public Health") baseCost = 900000;
    if (category === "Solar & Street Lighting") baseCost = 750000;

    let sanctionedAmount = Math.round(baseCost * (0.85 + (i % 20) * 0.015));
    if (isCostAnomaly) {
      sanctionedAmount = Math.round(baseCost * 2.6);
    }

    const trancheCount = 2 + (i % 2);
    const tranches: PaymentTranche[] = [];
    for (let t = 1; t <= trancheCount; t++) {
      tranches.push({
        trancheNumber: t,
        amountINR: Math.round(sanctionedAmount / trancheCount),
        disbursedDate: `2024-0${Math.min(9, 2 + t)}-15`,
        stageMilestone: `Tranche #${t} Progress`,
        utilizationCertificateSubmitted: isPaymentAnomaly && t > 1 ? false : true,
        voucherRefNumber: `VCH-${id}-${t}`,
      });
    }

    const slaMultiplier = isSlaDelayAnomaly ? 3.8 + (i % 3) * 0.4 : 0.85 + (i % 5) * 0.1;
    const assignedRole = ROLES[i % ROLES.length];
    const stages: StageEvent[] = [
      {
        stageName: "Administrative Sanction",
        expectedDays: 45,
        actualDays: Math.round(45 * (isSlaDelayAnomaly ? 1.1 : 0.9)),
        startDate: "2024-01-10",
        completionDate: "2024-02-20",
        responsibleRole: "District Planning Authority",
        isDelayed: false,
        delayRatio: 0.95,
        physicalProgressAtStage: 20,
      },
      {
        stageName: "Technical Sanction & Work Order",
        expectedDays: 60,
        actualDays: Math.round(60 * slaMultiplier),
        startDate: "2024-02-21",
        completionDate: isSlaDelayAnomaly ? undefined : "2024-04-20",
        responsibleRole: assignedRole,
        isDelayed: isSlaDelayAnomaly,
        delayRatio: Number(slaMultiplier.toFixed(2)),
        physicalProgressAtStage: 40,
      },
      {
        stageName: "Physical Implementation",
        expectedDays: 180,
        actualDays: 160,
        startDate: "2024-04-25",
        responsibleRole: "Executive Engineer PWD",
        isDelayed: false,
        delayRatio: 0.88,
        physicalProgressAtStage: isSlaDelayAnomaly ? 35 : 85,
      },
    ];

    const photoSample = PHOTO_SAMPLES[i % PHOTO_SAMPLES.length];
    const projectPhotos: EvidencePhoto[] = [
      {
        id: `PHT-${id}-01`,
        url: photoSample.url,
        caption: `${category} execution verification`,
        capturedAt: "2024-05-12T11:20:00Z",
        latitude: 20.5937 + (i % 10) * 0.2,
        longitude: 78.9629 + (i % 12) * 0.25,
        pHash: photoSample.pHash,
        isCryptographicallySigned: i % 3 === 0,
      },
    ];

    const physicalProgress = isSlaDelayAnomaly ? 35 : i % 4 === 0 ? 100 : 75;

    const project: Project = {
      id,
      title: `${category} Infrastructure Development - Sector ${1 + (i % 4)}`,
      description: `Construction and installation of essential ${category} amenities for rural habitations.`,
      workCategory: category,
      constituencyId: constituency.id,
      stateCode: constituency.stateCode,
      sanctionedAmountINR: sanctionedAmount,
      expenditureAmountINR: Math.round(sanctionedAmount * 0.8),
      physicalProgressPct: physicalProgress,
      peerGroupMedianINR: baseCost,
      peerGroupRangeMinINR: Math.round(baseCost * 0.75),
      peerGroupRangeMaxINR: Math.round(baseCost * 1.25),
      sanctionDate: "2024-01-10",
      targetCompletionDate: "2024-11-30",
      status: isSlaDelayAnomaly ? "Delayed" : physicalProgress === 100 ? "Completed" : "In Progress",
      latitude: 20.5937 + (i % 10) * 0.2,
      longitude: 78.9629 + (i % 12) * 0.25,
      implementingAgencyRole: assignedRole,
      contractorEntityId: `ENT-CONTRACTOR-${10 + (i % 8)}`,
      paymentTranches: tranches,
      stageEvents: stages,
      photos: projectPhotos,
      riskScore: {
        compositeScore: 0,
        tier: "low",
        whyFlaggedSummary: "",
        breakdown: [],
        calculatedAt: new Date().toISOString(),
        algorithmVersion: "RiskLens-v2.1",
        history: [
          { date: "2024-01-10", score: 12, triggerEvent: "Sanction registered" },
          { date: "2024-03-15", score: isSlaDelayAnomaly ? 45 : 18, triggerEvent: "Mid-term stage evaluation" },
        ],
      },
      delayPrediction: predictProjectDelay({
        sanctionDate: "2024-01-10",
        targetCompletionDate: "2024-11-30",
        physicalProgressPct: physicalProgress,
        expenditureAmountINR: Math.round(sanctionedAmount * 0.8),
        sanctionedAmountINR: sanctionedAmount,
        stageEvents: stages,
        paymentTranches: tranches,
        agencyHistoricalDelayFactor: isSlaDelayAnomaly ? 2.1 : 1.1,
      }),
      synthetic: true,
      dataSource: "synthetic",
    };

    if (isCostAnomaly || isSlaDelayAnomaly || isPaymentAnomaly) {
      project.investigationCase = {
        id: `CASE-${id}`,
        projectId: id,
        status: "Open",
        flaggedSignals: isCostAnomaly
          ? ["Peer Cost Outlier"]
          : isSlaDelayAnomaly
          ? ["Stage SLA Bottleneck"]
          : ["Disbursement & UC Compliance"],
        escalationLevel: "District",
      };
    }

    projects.push(project);
  }

  // Pass projects through the Risk Fusion Engine
  const allContext = projects.map((p) => ({
    id: p.id,
    latitude: p.latitude,
    longitude: p.longitude,
    workCategory: p.workCategory,
    photos: p.photos,
    title: p.title,
  }));

  for (const proj of projects) {
    const computed = computeRiskScore({
      id: proj.id,
      workCategory: proj.workCategory,
      sanctionedAmountINR: proj.sanctionedAmountINR,
      sanctionDate: proj.sanctionDate,
      latitude: proj.latitude,
      longitude: proj.longitude,
      paymentTranches: proj.paymentTranches,
      stageEvents: proj.stageEvents,
      photos: proj.photos,
      allProjectsContext: allContext,
    });
    proj.riskScore.compositeScore = computed.compositeScore;
    proj.riskScore.tier = computed.tier;
    proj.riskScore.whyFlaggedSummary = computed.whyFlaggedSummary;
    proj.riskScore.breakdown = computed.breakdown;
  }

  // Aggregate constituency rollups with equity metrics
  for (const c of constituencies) {
    const cProjects = projects.filter((p) => p.constituencyId === c.id);
    c.totalProjects = cProjects.length;
    c.totalSanctionedINR = cProjects.reduce((acc, p) => acc + p.sanctionedAmountINR, 0);
    c.totalDisbursedINR = cProjects.reduce((acc, p) => acc + p.expenditureAmountINR, 0);
    c.openFlaggedCasesCount = cProjects.filter((p) => p.investigationCase?.status === "Open").length;
    const avgScore =
      cProjects.length > 0
        ? Math.round(cProjects.reduce((acc, p) => acc + p.riskScore.compositeScore, 0) / cProjects.length)
        : 14;
    c.averageRiskScore = avgScore;
    c.utilizationRatePct =
      c.totalSanctionedINR > 0
        ? Math.round((c.totalDisbursedINR / c.totalSanctionedINR) * 100)
        : 25;
    c.inspectionCoveragePct = Math.round(35 + (cProjects.length % 5) * 10);
  }

  return { projects, constituencies };
}
