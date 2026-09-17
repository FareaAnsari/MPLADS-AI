export type UserRole = 
  | 'overview' 
  | 'mp' 
  | 'district' 
  | 'contractor' 
  | 'vendor' 
  | 'ministry' 
  | 'citizen';

export type ProjectStatus = 
  | 'TO DO' 
  | 'IN PROGRESS' 
  | 'BLOCKED' 
  | 'COMPLETED' 
  | 'DELAYED' 
  | 'UNDER REVIEW';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface LifecycleStage {
  id: string;
  stageNumber: number;
  name: string;
  status: 'COMPLETED' | 'IN PROGRESS' | 'PENDING' | 'DELAYED';
  date?: string;
  authority: string;
  documentRef?: string;
  delayDays?: number;
  notes?: string;
}

export interface TaskItem {
  id: string;
  projectId: string;
  title: string;
  department: 'Project Manager' | 'Site Engineer' | 'Civil Team' | 'Electrical Team' | 'Procurement Team' | 'Finance Team';
  assignedTo: string;
  deadline: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TO DO' | 'IN PROGRESS' | 'BLOCKED' | 'DONE';
  dependencies?: string[];
  evidenceRequired: string;
  evidenceSubmitted?: string;
}

export interface MaterialItem {
  id: string;
  projectId: string;
  materialName: string;
  category: string;
  quantity: number;
  unit: string;
  reportedPrice: number;
  benchmarkPrice: number;
  deviationPercent: number;
  vendorId: string;
  vendorName: string;
  invoiceId: string;
  riskLevel: RiskLevel;
  aiExplanation: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  mpName: string;
  mpConstituency: string;
  mpHouse: 'Lok Sabha' | 'Rajya Sabha';
  district: string;
  state: string;
  category: 'Community Infrastructure' | 'Drinking Water' | 'Education' | 'Health & Sanitation' | 'Roads & Pathways' | 'Irrigation' | 'Renewable Energy';
  estimatedCost: number; // in Rupees
  sanctionedAmount: number; // in Rupees
  contractValue: number; // in Rupees
  expenditure: number; // in Rupees
  financialProgress: number; // percentage
  physicalProgress: number; // percentage
  status: ProjectStatus;
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100
  confidence: number; // 0.0 - 1.0
  predictedDelayDays: number;
  purpose: string;
  beneficiaries: string;
  village?: string;
  block?: string;
  coordinates: { lat: number; lng: number };
  recommendationDate: string;
  sanctionDate: string;
  tenderDate: string;
  contractAwardDate: string;
  expectedCompletionDate: string;
  predictedCompletionDate: string;
  contractorId: string;
  contractorName: string;
  vendorIds: string[];
  vendorNames: string[];
  lifecycleStages: LifecycleStage[];
  aiAlerts: string[];
}

export interface Contractor {
  id: string;
  name: string;
  cinOrPan: string;
  registrationNumber: string;
  establishedYear: number;
  classCategory: 'Class-I Super' | 'Class-I' | 'Class-II' | 'Special Civil';
  activeContracts: number;
  completedProjects: number;
  delayedProjects: number;
  totalContractValue: number; // in Crores or Lakhs
  performanceScore: number; // 0 - 100
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  avgCompletionTimeDays: number;
  phone: string;
  email: string;
  address: string;
  projectIds: string[];
}

export interface Vendor {
  id: string;
  name: string;
  orgType: 'Private Limited' | 'Partnership' | 'Proprietorship' | 'LLP';
  registrationNo: string;
  gst: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: 'Cement' | 'Electrical' | 'Pipes & Sanitation' | 'Construction Materials' | 'Solar & Energy' | 'Steel & Hardware';
  products: string[];
  projectsCount: number;
  totalOrders: number;
  totalInvoicesValue: number; // in Rupees
  totalPaid: number;
  status: 'Active' | 'Pending Verification' | 'Suspended';
  riskLevel: RiskLevel;
  projectIds: string[];
}

export interface Tender {
  id: string;
  tenderNo: string;
  projectId: string;
  projectName: string;
  district: string;
  publishedDate: string;
  closingDate: string;
  estimatedValue: number;
  bidsReceived: number;
  selectedContractorId: string;
  selectedContractorName: string;
  contractValue: number;
  status: 'Published' | 'Under Technical Evaluation' | 'Financial Bid Opened' | 'Awarded' | 'Cancelled';
  riskIndicators: string[];
  bidders: {
    bidderName: string;
    bidAmount: number;
    technicalScore: number;
    status: 'Selected' | 'Disqualified' | 'L2' | 'L3';
  }[];
}

export interface Contract {
  id: string;
  contractNo: string;
  projectId: string;
  projectName: string;
  contractorId: string;
  contractorName: string;
  awardDate: string;
  contractValue: number;
  startDate: string;
  expectedCompletion: string;
  currentProgress: number;
  totalPaid: number;
  status: 'Active' | 'Under Scrutiny' | 'Completed' | 'Terminated';
  riskLevel: RiskLevel;
}

export interface RiskAlert {
  id: string;
  projectId: string;
  projectName: string;
  district: string;
  state: string;
  type: 
    | 'PAYMENT_PROGRESS_MISMATCH' 
    | 'HIGH_MATERIAL_COST' 
    | 'DUPLICATE_WORK' 
    | 'CONTRACTOR_DELAY_PATTERN' 
    | 'TIMELINE_DEVIATION' 
    | 'PROCUREMENT_ANOMALY' 
    | 'CROSS_RECORD_INCONSISTENCY';
  severity: 'HIGH' | 'CRITICAL' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  evidenceSummary: string;
  confidence: number;
  date: string;
  financialProgress?: number;
  physicalProgress?: number;
  deviationPercent?: number;
  actionRequired: string;
  status: 'NEW' | 'UNDER_INVESTIGATION' | 'CONFIRMED' | 'RESOLVED' | 'FALSE_POSITIVE';
}

export interface DocumentRecord {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  type: 'Recommendation' | 'Sanction Order' | 'Tender Notice' | 'Contract Agreement' | 'Measurement Book (MB)' | 'Invoice' | 'Payment Voucher' | 'Inspection Report' | 'Completion Certificate' | 'Utilization Certificate (UC)';
  uploadedBy: string;
  uploadDate: string;
  fileSize: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'FLAGGED';
  documentRefNo: string;
}

export interface StateData {
  state: string;
  totalProjects: number;
  completed: number;
  inProgress: number;
  delayed: number;
  fundsUtilized: number; // in Cr
  sanctionedAmount: number; // in Cr
  highRiskProjects: number;
  coordinates: { lat: number; lng: number };
}
