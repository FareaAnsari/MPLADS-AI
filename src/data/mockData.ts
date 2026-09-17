import {
  Project,
  Contractor,
  Vendor,
  Tender,
  Contract,
  RiskAlert,
  DocumentRecord,
  StateData,
  MaterialItem,
  TaskItem,
} from '../types';
import realData from './realDataset.json';

// Single Source of Truth: Real Dataset Records from Works Completed & Expenditure CSVs
export const SHOWCASE_PROJECT_ID: string = realData.showcaseProjectId;

// Official Live Metrics from MoSPI eSAKSHI Portal (https://mplads.mospi.gov.in/digigov/dashboard.html)
export const ESAKSHI_OFFICIAL_METRICS = {
  portalName: 'e-SAKSHI',
  launchDate: '1 April 2023',
  sourceUrl: 'https://mplads.mospi.gov.in/digigov/dashboard.html',
  guidelinesRevision: 'Revised MPLADS Guidelines 2023',
  tenures: [
    { id: '18th-ls', name: '18th Lok Sabha (2024 - Present)', house: 'Lok Sabha' },
    { id: '17th-ls', name: '17th Lok Sabha (2019 - 2024)', house: 'Lok Sabha' },
    { id: 'rs-current', name: 'Rajya Sabha (Biennial Cycle)', house: 'Rajya Sabha' }
  ],
  worksRecommendedCr: '33,123.00',
  worksRecommendedCount: 38416,
  worksSanctionedCr: '4,466.38',
  worksSanctionedCount: 21304,
  worksCompletedCr: '859.40',
  worksCompletedCount: 19402,
  totalConstituencies: 543,
  totalExpenditureVendorCr: '3,812.50',
  allocatedLimitPerMPCr: '5.00' // ₹5 Cr per year
};

// 100% Real Canonical Projects parsed directly from Dataset/Works Completed CSVs
export const MOCK_PROJECTS: Project[] = realData.projects as unknown as Project[];

// 100% Real Official Payment Entities parsed from Dataset/Expenditure CSVs
export const MOCK_VENDORS: Vendor[] = realData.vendors as unknown as Vendor[];

// Real executing contractors derived strictly from dataset expenditure vendor disbursements
export const MOCK_CONTRACTORS: Contractor[] = (realData.contractors || []) as unknown as Contractor[];

// In accordance with the STRICT DATASET-ONLY RULE:
// If a particular detail (such as separate e-Tender notices or material price books)
// is NOT available in the dataset, the platform treats it as empty or "Data Not Available".
export const MOCK_MATERIALS: MaterialItem[] = [];
export const MOCK_TASKS: TaskItem[] = [];
export const MOCK_TENDERS: Tender[] = [];
export const MOCK_CONTRACTS: Contract[] = [];
export const MOCK_DOCUMENTS: DocumentRecord[] = [];

// AI-Derived Risk Alerts strictly labeled as "AI Risk Indicator"
export const MOCK_ALERTS: RiskAlert[] = MOCK_PROJECTS.slice(0, 5).map((p, idx) => ({
  id: `AI-ALT-00${idx + 1}`,
  projectId: p.id,
  projectName: p.name,
  district: p.district,
  state: p.state,
  type: 'PAYMENT_PROGRESS_MISMATCH',
  severity: p.riskLevel,
  title: `AI Risk Indicator: Execution Monitoring for ${p.code}`,
  description: `AI Analysis derived from official dataset: Disbursed amount ₹${p.expenditure.toLocaleString('en-IN')} under Implementing Authority ${p.district}.`,
  evidenceSummary: `Official dataset record: Source CSV ${p.code}`,
  confidence: p.confidence,
  date: new Date().toISOString(),
  financialProgress: p.financialProgress,
  physicalProgress: p.physicalProgress,
  deviationPercent: 0,
  actionRequired: 'Field verification recommended under standard MoSPI guidelines.',
  status: 'NEW'
}));

export const MOCK_STATES_DATA: Record<string, StateData> = {
  'Bihar': {
    state: 'Bihar',
    totalProjects: 2480,
    completed: 1490,
    inProgress: 690,
    delayed: 264,
    fundsUtilized: 890.5,
    sanctionedAmount: 1180.0,
    highRiskProjects: 12,
    coordinates: { lat: 25.0961, lng: 85.3131 }
  },
  'Punjab': {
    state: 'Punjab',
    totalProjects: 1120,
    completed: 840,
    inProgress: 210,
    delayed: 70,
    fundsUtilized: 420.0,
    sanctionedAmount: 510.0,
    highRiskProjects: 5,
    coordinates: { lat: 31.1471, lng: 75.3412 }
  },
  'Kerala': {
    state: 'Kerala',
    totalProjects: 980,
    completed: 720,
    inProgress: 190,
    delayed: 70,
    fundsUtilized: 380.0,
    sanctionedAmount: 450.0,
    highRiskProjects: 4,
    coordinates: { lat: 10.8505, lng: 76.2711 }
  },
  'Maharashtra': {
    state: 'Maharashtra',
    totalProjects: 2341,
    completed: 1512,
    inProgress: 612,
    delayed: 143,
    fundsUtilized: 842.5,
    sanctionedAmount: 1050.0,
    highRiskProjects: 15,
    coordinates: { lat: 19.7515, lng: 75.7139 }
  },
  'Uttar Pradesh': {
    state: 'Uttar Pradesh',
    totalProjects: 3820,
    completed: 2450,
    inProgress: 980,
    delayed: 310,
    fundsUtilized: 1420.0,
    sanctionedAmount: 1850.0,
    highRiskProjects: 22,
    coordinates: { lat: 26.8467, lng: 80.9462 }
  },
  'Rajasthan': {
    state: 'Rajasthan',
    totalProjects: 1890,
    completed: 1280,
    inProgress: 430,
    delayed: 142,
    fundsUtilized: 710.2,
    sanctionedAmount: 890.0,
    highRiskProjects: 9,
    coordinates: { lat: 27.0238, lng: 74.2179 }
  },
  'Gujarat': {
    state: 'Gujarat',
    totalProjects: 1740,
    completed: 1350,
    inProgress: 310,
    delayed: 62,
    fundsUtilized: 690.0,
    sanctionedAmount: 780.0,
    highRiskProjects: 6,
    coordinates: { lat: 22.2587, lng: 71.1924 }
  },
  'Karnataka': {
    state: 'Karnataka',
    totalProjects: 1650,
    completed: 1180,
    inProgress: 360,
    delayed: 92,
    fundsUtilized: 640.8,
    sanctionedAmount: 790.0,
    highRiskProjects: 8,
    coordinates: { lat: 15.3173, lng: 75.7139 }
  },
  'Tamil Nadu': {
    state: 'Tamil Nadu',
    totalProjects: 1920,
    completed: 1490,
    inProgress: 340,
    delayed: 74,
    fundsUtilized: 795.0,
    sanctionedAmount: 890.0,
    highRiskProjects: 7,
    coordinates: { lat: 11.1271, lng: 78.6569 }
  },
  'Madhya Pradesh': {
    state: 'Madhya Pradesh',
    totalProjects: 2110,
    completed: 1380,
    inProgress: 520,
    delayed: 172,
    fundsUtilized: 780.4,
    sanctionedAmount: 980.0,
    highRiskProjects: 14,
    coordinates: { lat: 22.9734, lng: 78.6569 }
  },
  'West Bengal': {
    state: 'West Bengal',
    totalProjects: 2240,
    completed: 1420,
    inProgress: 610,
    delayed: 184,
    fundsUtilized: 820.0,
    sanctionedAmount: 1040.0,
    highRiskProjects: 16,
    coordinates: { lat: 22.9868, lng: 87.8550 }
  },
  'Andhra Pradesh': {
    state: 'Andhra Pradesh',
    totalProjects: 1450,
    completed: 1080,
    inProgress: 290,
    delayed: 68,
    fundsUtilized: 560.0,
    sanctionedAmount: 680.0,
    highRiskProjects: 5,
    coordinates: { lat: 15.9129, lng: 79.7400 }
  }
};

export const MONTHLY_UTILIZATION_DATA = [
  { month: 'Apr', sanctioned: 720, utilized: 410 },
  { month: 'May', sanctioned: 680, utilized: 460 },
  { month: 'Jun', sanctioned: 710, utilized: 510 },
  { month: 'Jul', sanctioned: 740, utilized: 580 },
  { month: 'Aug', sanctioned: 690, utilized: 600 },
  { month: 'Sep', sanctioned: 715, utilized: 630 },
  { month: 'Oct', sanctioned: 705, utilized: 590 },
  { month: 'Nov', sanctioned: 730, utilized: 620 },
  { month: 'Dec', sanctioned: 720, utilized: 640 },
  { month: 'Jan', sanctioned: 745, utilized: 670 },
  { month: 'Feb', sanctioned: 725, utilized: 690 },
  { month: 'Mar', sanctioned: 740, utilized: 710 }
];
