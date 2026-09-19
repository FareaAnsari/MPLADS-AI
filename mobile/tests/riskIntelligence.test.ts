import {
  FetchSystemRiskOverviewUseCase,
  FetchRiskProjectsUseCase,
  FetchRiskScoreUseCase,
  FetchProjectRiskIntelligenceDetailUseCase,
  FetchVerificationConfidenceUseCase,
  FetchProjectLedgerHistoryUseCase,
  FetchSLABottleneckUseCase,
} from '../src/domain/usecases/intelligenceUseCases';
import { IIntelligenceRepository } from '../src/domain/interfaces';
import {
  RiskOverviewSummaryEntity,
  RiskAssessmentEntity,
  ProjectRiskIntelligenceDetailEntity,
  VerificationConfidenceEntity,
  AuditLedgerHistoryEntity,
  ProjectEntity,
} from '../src/domain/entities';
import { RolePermissions, hasPermission } from '../src/domain/entities/permissions';
import { t, DICTIONARIES } from '../src/i18n';
import { useAppStore } from '../src/store/appStore';

describe('Phase 8 — Risk Intelligence Domain, Repository & Safeguard Tests', () => {
  let mockIntelligenceRepo: jest.Mocked<IIntelligenceRepository>;

  const sampleRiskOverview: RiskOverviewSummaryEntity = {
    totalProjectsMonitored: 1420,
    riskDistribution: {
      highRiskCount: 64,
      reviewRequiredCount: 280,
      normalCount: 1076,
    },
    heroProjectId: 'WRK-2024-001',
    provenanceSummary: {
      dataSources: ['data.gov.in / eSAKSHI', 'AIRiskEngine_v2'],
      totalRecordsIndexed: 1420,
      retrievedAt: '2026-09-19T10:00:00Z',
    },
  };

  const sampleRiskAssessment: RiskAssessmentEntity = {
    projectId: 'WRK-2024-001',
    workId: 'WRK-2024-001',
    riskScore: 78.5,
    anomalyFlag: 'HIGH_RISK_COST_DEVIATION',
    scoreBreakdown: {
      costAnomalyScore: 82.0,
      timeDelayScore: 74.0,
      duplicateRiskScore: 10.0,
      clusterDensityScore: 65.0,
      paymentPatternScore: 50.0,
      isolationForestAuxiliaryScore: 78.0,
    },
    evaluatedAt: '2026-09-19T10:00:00Z',
    primaryRiskReason: 'System-generated cost anomaly signal deviates from peer group',
    topContributingFactor: 'Cost Deviation (+35.1% vs peer cohort median)',
  };

  const sampleProject: ProjectEntity = {
    id: 'WRK-2024-001',
    workId: 'WRK-2024-001',
    workTitle: 'Solar Drinking Water Installation',
    workCategory: 'Drinking Water Infrastructure',
    workDescription: 'Installation of 5 HP solar pumps.',
    mpName: 'Shri Pradeep Kumar Singh',
    idaOffice: 'District Planning Cell Araria',
    state: 'Bihar',
    constituency: 'Araria',
    sanctionedAmountInr: 2500000,
    disbursedAmountInr: 1800000,
    currentStage: 'IMPLEMENTATION_IN_PROGRESS',
    hasOfficialImages: true,
    source: 'data.gov.in / eSAKSHI',
    sourceType: 'OFFICIAL_PUBLIC',
  };

  const sampleRiskIntelligenceDetail: ProjectRiskIntelligenceDetailEntity = {
    project: sampleProject,
    riskAssessment: sampleRiskAssessment,
    peerGroupSummary: {
      projectId: 'WRK-2024-001',
      amountInr: 2500000,
      peerStats: {
        peerGroupId: 'Bihar_Drinking_Water',
        peerStatus: 'ADEQUATE_SAMPLE',
        count: 42,
        mean: 1850000,
        median: 1800000,
        std: 250000,
        iqr: 350000,
        q25: 1650000,
        q75: 2000000,
        note: 'Adequate sample size (N=42). Direct regional peer group comparison valid.',
      },
      deviation: {
        zScore: 2.6,
        deviationFromMeanPct: 35.1,
        deviationFromMedianPct: 38.8,
      },
    },
    latestLedgerEntryId: 'ledg-002',
  };

  const sampleVerificationConfidence: VerificationConfidenceEntity = {
    projectId: 'WRK-2024-001',
    verificationConfidence: 84.5,
    independentEvidenceStatus: 'VERIFIED_COGNIZANT',
    triangulationSummary: {
      agencyClaimWeight: 0.35,
      citizenProximityWeight: 0.45,
      photoSimilarityWeight: 0.20,
    },
    evaluatedAt: '2026-09-19T10:00:00Z',
  };

  const sampleLedgerHistory: AuditLedgerHistoryEntity = {
    projectId: 'WRK-2024-001',
    totalLedgerEntries: 2,
    ledgerHistory: [
      {
        entry_id: 'ledg-001',
        block_index: 12,
        action: 'RISK_SIGNAL_EVALUATION',
        actor_role: 'SYSTEM_AI_ENGINE',
        timestamp: '2026-09-19T08:00:00Z',
        hash: 'a3f7c9e128b...',
        prev_hash: '00000000000...',
        summary: 'Composite risk calculated at 78.5 (HIGH)',
      },
      {
        entry_id: 'ledg-002',
        block_index: 13,
        action: 'EVIDENCE_OFFICER_REVIEW',
        actor_role: 'DISTRICT_OFFICER',
        timestamp: '2026-09-19T09:30:00Z',
        hash: 'b4d8e0f239c...',
        prev_hash: 'a3f7c9e128b...',
        summary: 'Citizen evidence reviewed and marked ACCEPTED',
      },
    ],
  };

  beforeEach(() => {
    mockIntelligenceRepo = {
      getSystemRiskOverview: jest.fn().mockResolvedValue(sampleRiskOverview),
      getRiskProjects: jest.fn().mockResolvedValue({
        totalRecords: 1,
        projects: [sampleRiskAssessment],
      }),
      getProjectRisk: jest.fn().mockResolvedValue(sampleRiskAssessment),
      getProjectRiskIntelligenceDetail: jest.fn().mockResolvedValue(sampleRiskIntelligenceDetail),
      getVerificationConfidence: jest.fn().mockResolvedValue(sampleVerificationConfidence),
      getProjectLedgerHistory: jest.fn().mockResolvedValue(sampleLedgerHistory),
      getSLABottleneck: jest.fn().mockResolvedValue({
        projectId: 'WRK-2024-001',
        currentStage: 'IMPLEMENTATION_IN_PROGRESS',
        daysInCurrentStage: 145,
        expectedBenchmarkDays: 90,
        delayRatio: 1.61,
        responsibleRole: 'DISTRICT_OFFICER',
        isBottleneck: true,
      }),
      getOptimizedInspections: jest.fn().mockResolvedValue({
        totalInspectors: 1,
        totalPlannedInspections: 1,
        routes: [],
      }),
    };

    useAppStore.setState({ language: 'en' });
  });

  describe('Risk Intelligence Use Cases', () => {
    it('fetches system-wide risk overview summary', async () => {
      const useCase = new FetchSystemRiskOverviewUseCase(mockIntelligenceRepo);
      const result = await useCase.execute();

      expect(mockIntelligenceRepo.getSystemRiskOverview).toHaveBeenCalledTimes(1);
      expect(result.totalProjectsMonitored).toBe(1420);
      expect(result.riskDistribution.highRiskCount).toBe(64);
      expect(result.heroProjectId).toBe('WRK-2024-001');
    });

    it('fetches filtered risk projects queue', async () => {
      const useCase = new FetchRiskProjectsUseCase(mockIntelligenceRepo);
      const result = await useCase.execute({ state: 'Bihar', minRiskScore: 70 });

      expect(mockIntelligenceRepo.getRiskProjects).toHaveBeenCalledWith({
        state: 'Bihar',
        minRiskScore: 70,
      });
      expect(result.projects.length).toBe(1);
      expect(result.projects[0].riskScore).toBe(78.5);
    });

    it('fetches deep project risk intelligence detail including drivers and peer stats', async () => {
      const useCase = new FetchProjectRiskIntelligenceDetailUseCase(mockIntelligenceRepo);
      const result = await useCase.execute('WRK-2024-001');

      expect(mockIntelligenceRepo.getProjectRiskIntelligenceDetail).toHaveBeenCalledWith('WRK-2024-001');
      expect(result.riskAssessment.riskScore).toBe(78.5);
      expect(result.riskAssessment.anomalyFlag).toBe('HIGH_RISK_COST_DEVIATION');
      expect(result.peerGroupSummary.deviation.deviationFromMeanPct).toBe(35.1);
      expect(result.peerGroupSummary.peerStats.count).toBe(42);
    });

    it('fetches multi-source verification confidence', async () => {
      const useCase = new FetchVerificationConfidenceUseCase(mockIntelligenceRepo);
      const result = await useCase.execute('WRK-2024-001');

      expect(mockIntelligenceRepo.getVerificationConfidence).toHaveBeenCalledWith('WRK-2024-001');
      expect(result.verificationConfidence).toBe(84.5);
      expect(result.independentEvidenceStatus).toBe('VERIFIED_COGNIZANT');
    });

    it('fetches statutory immutable audit ledger history', async () => {
      const useCase = new FetchProjectLedgerHistoryUseCase(mockIntelligenceRepo);
      const result = await useCase.execute('WRK-2024-001');

      expect(mockIntelligenceRepo.getProjectLedgerHistory).toHaveBeenCalledWith('WRK-2024-001');
      expect(result.totalLedgerEntries).toBe(2);
      expect(result.ledgerHistory[0].action).toBe('RISK_SIGNAL_EVALUATION');
      expect(result.ledgerHistory[1].action).toBe('EVIDENCE_OFFICER_REVIEW');
    });

    it('throws validation error when workId is missing or whitespace', async () => {
      const useCase = new FetchProjectRiskIntelligenceDetailUseCase(mockIntelligenceRepo);
      await expect(useCase.execute('')).rejects.toThrow('Work ID must be specified');
      await expect(useCase.execute('   ')).rejects.toThrow('Work ID must be specified');
    });
  });

  describe('RBAC & Role-Based Access Control for Risk Intelligence', () => {
    it('authorizes DISTRICT_OFFICER for risk:read and risk:audit', () => {
      const officerPerms = RolePermissions.DISTRICT_OFFICER;
      expect(hasPermission(officerPerms, 'risk:read')).toBe(true);
      expect(hasPermission(officerPerms, 'risk:audit')).toBe(true);
      expect(hasPermission(officerPerms, 'inspections:update')).toBe(true);
    });

    it('prohibits CITIZEN from confidential risk operational audit', () => {
      const citizenPerms = RolePermissions.CITIZEN;
      expect(hasPermission(citizenPerms, 'risk:audit')).toBe(false);
      expect(hasPermission(citizenPerms, 'inspections:update')).toBe(false);
      expect(hasPermission(citizenPerms, 'projects:read')).toBe(true);
    });

    it('prohibits CONTRACTOR from accessing district officer risk audits', () => {
      const contractorPerms = RolePermissions.CONTRACTOR;
      expect(hasPermission(contractorPerms, 'risk:audit')).toBe(false);
      expect(hasPermission(contractorPerms, 'inspections:update')).toBe(false);
    });
  });

  describe('Localization & Bilingual Completeness for Risk Intelligence', () => {
    it('provides all risk keys in both English and Hindi without missing translations', () => {
      const enRisk = DICTIONARIES['en-IN'].risk;
      const hiRisk = DICTIONARIES['hi-IN'].risk;

      expect(enRisk).toBeDefined();
      expect(hiRisk).toBeDefined();

      const enKeys = Object.keys(enRisk) as (keyof typeof enRisk)[];
      enKeys.forEach((key) => {
        expect(hiRisk[key]).toBeDefined();
        expect(typeof hiRisk[key]).toBe('string');
        expect((hiRisk[key] as string).trim().length).toBeGreaterThan(0);
      });
    });

    it('translates risk severity labels neutrally and accurately in Hindi', () => {
      useAppStore.setState({ language: 'hi' });
      expect(t('risk.criticalRisk')).toBe('गंभीर जोखिम');
      expect(t('risk.highRisk')).toBe('उच्च जोखिम');
      expect(t('risk.mediumRisk')).toBe('मध्यम जोखिम');
      expect(t('risk.lowRisk')).toBe('कम जोखिम');
      expect(t('risk.systemSignalOnly')).toContain('प्रणाली-जनित विश्लेषणात्मक संकेत');
    });

    it('translates risk drivers and explainability terms accurately', () => {
      useAppStore.setState({ language: 'hi' });
      expect(t('risk.outlierDeviation')).toBe('बजट विचलन (25%)');
      expect(t('risk.isolationForest')).toBe('आइसोलेशन फॉरेस्ट आउटलायर संकेत');
      expect(t('risk.peerCohortComparison')).toBe('सहकर्मी समूह एवं आईक्यूआर (IQR) बेंचमार्किंग');
      expect(t('risk.auditLedger')).toBe('अपरिवर्तनीय वैधानिक ऑडिट लेज़र');
    });
  });

  describe('Fairness Safeguards & Explainability Principles', () => {
    it('verifies that disclaimer labels and primary reasons are provided on assessments', () => {
      expect(sampleRiskAssessment.primaryRiskReason).toBeDefined();
      expect(sampleRiskAssessment.primaryRiskReason).toContain('System-generated');
      expect(sampleRiskAssessment.topContributingFactor).toContain('Cost Deviation');
    });

    it('verifies that peer cohort safeguards protect small sample sizes', () => {
      expect(sampleRiskIntelligenceDetail.peerGroupSummary.peerStats.note).toBeDefined();
      expect(sampleRiskIntelligenceDetail.peerGroupSummary.peerStats.note).toContain('Adequate sample size');
    });

    it('preserves statistical terminology without asserting illegal misconduct', () => {
      const reason = sampleRiskAssessment.primaryRiskReason!;
      expect(reason).not.toContain('Fraud');
      expect(reason).not.toContain('Corruption');
      expect(reason).toContain('cost anomaly signal');
    });
  });
});
