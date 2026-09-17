import { Project, RiskAlert, RiskLevel } from '../types';
import { MOCK_PROJECTS, MOCK_MATERIALS, MOCK_CONTRACTORS, MOCK_VENDORS } from '../data/mockData';

export interface InvestigationSummary {
  projectId: string;
  projectName: string;
  overallRiskScore: number;
  confidenceScore: number;
  severity: RiskLevel;
  primaryRiskFactors: {
    category: 'Financial' | 'Procurement' | 'Timeline' | 'Contractor' | 'Vendor' | 'Material Price' | 'Data Consistency';
    score: number;
    weight: number;
    description: string;
    evidenceCount: number;
  }[];
  explainableReasons: string[];
  evidentiaryRecords: {
    title: string;
    type: string;
    refNo: string;
    finding: string;
    status: 'FLAGGED' | 'VERIFIED';
  }[];
  recommendedActions: string[];
  counterfactualSimulations: {
    id: string;
    factorName: string;
    currentRisk: number;
    simulatedRisk: number;
    condition: string;
  }[];
}

export const aiService = {
  getProjectById(projectId: string): Project | undefined {
    return MOCK_PROJECTS.find(p => p.id === projectId || p.code === projectId);
  },

  getMaterialsByProject(projectId: string) {
    return MOCK_MATERIALS.filter(m => m.projectId === projectId);
  },

  getContractorById(contractorId: string) {
    return MOCK_CONTRACTORS.find(c => c.id === contractorId);
  },

  getVendorById(vendorId: string) {
    return MOCK_VENDORS.find(v => v.id === vendorId);
  },

  calculateRiskScore(project: Project): { score: number; level: RiskLevel; confidence: number } {
    let score = 20;

    // Financial vs Physical mismatch
    const finDiff = project.financialProgress - project.physicalProgress;
    if (finDiff > 25) score += 35;
    else if (finDiff > 15) score += 18;

    // Check material anomalies
    const materials = MOCK_MATERIALS.filter(m => m.projectId === project.id);
    const hasHighDev = materials.some(m => m.deviationPercent > 20);
    if (hasHighDev) score += 15;

    // Check contractor history
    const contractor = MOCK_CONTRACTORS.find(c => c.id === project.contractorId);
    if (contractor && contractor.delayedProjects >= 3) score += 12;

    // Predicted delay
    if (project.predictedDelayDays > 20) score += 10;

    score = Math.min(Math.max(score, 10), 95);

    let level: RiskLevel = 'LOW';
    if (score >= 80) level = 'HIGH';
    else if (score >= 60) level = 'MEDIUM';

    return {
      score,
      level,
      confidence: 0.91
    };
  },

  generateInvestigationSummary(projectId: string): InvestigationSummary {
    const project = this.getProjectById(projectId) || MOCK_PROJECTS[0];
    const contractor = this.getContractorById(project.contractorId);
    const materials = this.getMaterialsByProject(project.id);
    const highCostMaterial = materials.find(m => m.deviationPercent > 20) || materials[0];

    return {
      projectId: project.id,
      projectName: project.name,
      overallRiskScore: project.riskScore || 82,
      confidenceScore: project.confidence || 0.91,
      severity: project.riskLevel || 'HIGH',
      primaryRiskFactors: [
        {
          category: 'Financial',
          score: 88,
          weight: 0.30,
          description: `Cumulative fund disbursement (${project.financialProgress}%) outpaces certified physical execution (${project.physicalProgress}%) by 31 percentage points.`,
          evidenceCount: 2
        },
        {
          category: 'Material Price',
          score: 84,
          weight: 0.20,
          description: `${highCostMaterial ? highCostMaterial.materialName : 'Portland Cement'} invoiced at ₹${highCostMaterial ? highCostMaterial.reportedPrice : 520} vs district benchmark of ₹${highCostMaterial ? highCostMaterial.benchmarkPrice : 390} (+${highCostMaterial ? highCostMaterial.deviationPercent.toFixed(1) : 33.3}%).`,
          evidenceCount: 1
        },
        {
          category: 'Contractor',
          score: 76,
          weight: 0.15,
          description: `Contractor ${contractor?.name || project.contractorName || 'DARSH BUILDCON'} has ${contractor?.delayedProjects || 2} delayed projects out of ${contractor?.activeContracts || 4} ongoing works.`,
          evidenceCount: 3
        },
        {
          category: 'Timeline',
          score: 72,
          weight: 0.15,
          description: `Current velocity indicates an estimated ${project.predictedDelayDays} days overrun past scheduled milestone.`,
          evidenceCount: 2
        },
        {
          category: 'Procurement',
          score: 65,
          weight: 0.10,
          description: 'Compressed financial bid scrutiny window (sub-48 hours from technical qualification).',
          evidenceCount: 1
        },
        {
          category: 'Data Consistency',
          score: 79,
          weight: 0.10,
          description: 'Measurement Book (MB Vol 3) records intermediate completion at 43% whereas payment voucher claims 74% progress milestone.',
          evidenceCount: 2
        }
      ],
      explainableReasons: [
        'Payment utilization is high compared with certified physical progress (74% vs 43%).',
        'Material cost for cement is significantly above comparable district schedule of rates (+33.3%).',
        'Contractor has multiple delayed projects in adjoining taluks and high concurrent work load.',
        'High recurring payment concentration identified across single vendor records.',
        'Project timeline is 27 days behind AI predictive schedule based on masonry task dependencies.',
        'Cross-record inconsistency identified between Treasury Disbursal record and site measurement book.'
      ],
      evidentiaryRecords: [
        {
          title: 'Contract Agreement',
          type: 'Contract',
          refNo: 'AGMT/PWD/PUN/2025/710',
          finding: 'Clause 14 stipulates payment strictly against certified MB entries.',
          status: 'VERIFIED'
        },
        {
          title: 'Vendor Material Invoice #INV-2026-089',
          type: 'Invoice',
          refNo: 'INV/2026/089',
          finding: 'Unit rate ₹520/bag exceeds Pune CSR baseline ₹390/bag.',
          status: 'FLAGGED'
        },
        {
          title: 'Treasury Disbursal Voucher',
          type: 'Payment',
          refNo: 'TXN/MH/4421',
          finding: 'Drawdown of ₹14.35 Lakh disbursed on 15 Jun 2026.',
          status: 'FLAGGED'
        },
        {
          title: 'Measurement Book (MB Vol 3, Pg 48)',
          type: 'MB Record',
          refNo: 'MB/VOL3/P48',
          finding: 'Site AE recorded column superstructure completion at 43%.',
          status: 'VERIFIED'
        },
        {
          title: 'Technical Bid Scrutiny Sheet',
          type: 'Tender Evaluation',
          refNo: 'TNDR/MH/PUN/2025/904',
          finding: 'Financial opening finalized within 36 hours of technical closure.',
          status: 'FLAGGED'
        }
      ],
      recommendedActions: [
        'Depute District Quality Control Executive Engineer for surprise physical verification of site progress.',
        'Hold RA Bill-4 and withhold further treasury disbursements pending invoice price justification.',
        'Direct Contractor to furnish manufacturer test certificates and purchase invoices for cement.',
        'Conduct cross-check of Measurement Book Vol. 3, Page 48 with site physical dimensions.',
        'Review contractor capacity limits under Rule 144 of Maharashtra Public Works Manual.'
      ],
      counterfactualSimulations: [
        {
          id: 'cf-1',
          factorName: 'Resolve Material Price Anomaly',
          currentRisk: 82,
          simulatedRisk: 67,
          condition: 'If contractor justifies rate or price is re-benchmarked to CSR standard'
        },
        {
          id: 'cf-2',
          factorName: 'Physical Execution Reaches 60%',
          currentRisk: 82,
          simulatedRisk: 54,
          condition: 'If verified physical progress reaches 60% bringing financial parity'
        },
        {
          id: 'cf-3',
          factorName: 'Verify All Missing Audit Documentation',
          currentRisk: 82,
          simulatedRisk: 43,
          condition: 'If cross-record MB reconciliation and quality certificates are verified'
        }
      ]
    };
  },

  detectDuplicateProjects(projectId: string) {
    if (projectId === 'MPL-MH-2026-1452' || projectId === 'MPL-MH-2026-0891') {
      return {
        matchedProjectId: 'MPL-MH-2026-0891',
        matchedProjectName: 'Village Community Centre',
        location: 'Dindori North, Nashik',
        overallSimilarity: 91,
        textSimilarity: 94,
        geospatialDistanceMeters: 240,
        costSimilarity: 95,
        explanation: 'Both proposals share nearly identical architectural schedules of quantities, identical intended beneficiaries, and adjacent coordinates within 240 meters.'
      };
    }
    return null;
  }
};
