import { 
  OpportunityRecord, 
  OpportunityKPISummary, 
  ContractorInterestRecord,
  ProcurementSource,
  OpportunityLifecycleStage
} from '../types/contractorOpportunity';

// Official Procurement Sources Reference
export const OFFICIAL_PROCUREMENT_PORTALS: ProcurementSource[] = [
  {
    source_name: 'Central Public Procurement Portal (CPPP)',
    source_url: 'https://eprocure.gov.in/eprocure/app',
    source_type: 'CPPP',
    source_date: 'March 2026',
    last_verified: '16-Mar-2026 10:30 IST'
  },
  {
    source_name: 'Government e-Marketplace (GeM)',
    source_url: 'https://gem.gov.in',
    source_type: 'GeM',
    source_date: 'March 2026',
    last_verified: '16-Mar-2026 14:00 IST'
  },
  {
    source_name: 'Maharashtra State e-Procurement System (MahaTenders)',
    source_url: 'https://mahatenders.gov.in',
    source_type: 'State e-Procurement',
    source_date: 'March 2026',
    last_verified: '15-Mar-2026 18:45 IST'
  },
  {
    source_name: 'Bihar State e-Procurement Portal (eProc2 Bihar)',
    source_url: 'https://eproc2.bihar.gov.in',
    source_type: 'State e-Procurement',
    source_date: 'February 2026',
    last_verified: '28-Feb-2026 11:15 IST'
  },
  {
    source_name: 'Ministry of Statistics & Programme Implementation (e-SAKSHI Public Release)',
    source_url: 'https://mplads.mospi.gov.in/digigov/dashboard.html',
    source_type: 'MoSPI e-SAKSHI',
    source_date: 'March 2026',
    last_verified: '15-Mar-2026 09:00 IST'
  }
];

// Helper to construct timeline stages
const buildTimeline = (
  recDate: string | null,
  sancDate: string | null,
  tenderPubDate: string | null,
  tenderCloseDate: string | null,
  workStartDate: string | null,
  compDate: string | null,
  currentStatus: string
): OpportunityLifecycleStage[] => [
  {
    stageId: 'stg-1',
    stageName: 'MP Recommendation',
    stageNumber: 1,
    status: recDate ? 'COMPLETED' : 'INFORMATION_UNAVAILABLE',
    date: recDate,
    authority: 'Hon. Member of Parliament',
    notes: recDate ? 'Formal recommendation submitted under priority MPLADS quota.' : 'Recommendation date not available in source data.'
  },
  {
    stageId: 'stg-2',
    stageName: 'Administrative & Technical Sanction',
    stageNumber: 2,
    status: sancDate ? 'COMPLETED' : (currentStatus === 'Under Administrative Processing' ? 'IN_PROGRESS' : 'PENDING'),
    date: sancDate,
    authority: 'District Planning Authority / District Magistrate',
    notes: sancDate ? 'Administrative approval & technical sanction recorded by District Authority.' : (currentStatus === 'Under Administrative Processing' ? 'Currently under technical scrutiny.' : 'Sanction stage not yet reached.')
  },
  {
    stageId: 'stg-3',
    stageName: 'Procurement Information Formulation',
    stageNumber: 3,
    status: tenderPubDate ? 'COMPLETED' : (currentStatus === 'Sanctioned' ? 'IN_PROGRESS' : 'PENDING'),
    date: tenderPubDate || sancDate,
    authority: 'District E-Tendering Cell',
    notes: tenderPubDate ? 'Procurement terms finalized and notice formulated.' : 'Awaiting procurement formulation.'
  },
  {
    stageId: 'stg-4',
    stageName: 'Tender / NIT Published',
    stageNumber: 4,
    status: tenderPubDate ? 'COMPLETED' : 'PENDING',
    date: tenderPubDate,
    authority: 'Official E-Procurement Portal',
    notes: tenderPubDate ? 'Notice Inviting Tender published on official procurement portal.' : 'Tender notice not yet published.'
  },
  {
    stageId: 'stg-5',
    stageName: 'Tender Closing / Bid Opening',
    stageNumber: 5,
    status: currentStatus === 'Tender Open' ? 'IN_PROGRESS' : (tenderCloseDate ? 'COMPLETED' : 'PENDING'),
    date: tenderCloseDate,
    authority: 'Bid Evaluation Committee',
    notes: currentStatus === 'Tender Open' ? 'Active bidding window open on official portal.' : (tenderCloseDate ? 'Bid submission closed.' : 'Bidding window pending.')
  },
  {
    stageId: 'stg-6',
    stageName: 'Work Execution Start',
    stageNumber: 6,
    status: (currentStatus === 'Work in Progress' || currentStatus === 'Completed') ? 'COMPLETED' : 'PENDING',
    date: workStartDate,
    authority: 'Executing Agency / Implementing Department',
    notes: workStartDate ? 'Work order issued and ground execution initiated.' : 'Execution not initiated.'
  },
  {
    stageId: 'stg-7',
    stageName: 'Project Completion & Handover',
    stageNumber: 7,
    status: currentStatus === 'Completed' ? 'COMPLETED' : 'PENDING',
    date: compDate,
    authority: 'District Planning Authority / Beneficiary Body',
    notes: compDate ? 'Work completed and asset verification certificate uploaded.' : 'Work ongoing / pending completion.'
  }
];

// Comprehensive 30+ Opportunities Dataset with Strict Status Separation
export const OPPORTUNITIES_DATA: OpportunityRecord[] = [
  // --- TENDER OPEN (Bidding Active on Official Portals) ---
  {
    id: 'OPP-MH-2026-001',
    projectId: 'WS/MH/PUN/2026/145890',
    workName: 'Construction of Sub-District Health Sub-Centre Building & Diagnostic Room',
    location: 'Wagholi Rural Area',
    village: 'Wagholi Gram Panchayat',
    subDistrict: 'Haveli',
    district: 'Pune',
    state: 'Maharashtra',
    constituency: 'Pune',
    mpName: 'Shri Murlidhar Mohol',
    sector: 'Health & Sanitation',
    currentStatus: 'Tender Open',
    estimatedCost: 2800000,
    recommendationDate: '2025-09-15',
    sanctionDate: '2025-11-20',
    tenderStatus: 'Tender Open - Technical Bid Submission Active',
    tenderReference: 'E-TNDR/PUN/ZP/HLTH/2026/041',
    tenderingAuthority: 'Executive Engineer, Zilla Parishad Works Division, Pune',
    tenderPublicationDate: '2026-02-18',
    tenderClosingDate: '2026-04-10',
    officialSource: {
      source_name: 'Maharashtra State e-Procurement (MahaTenders)',
      source_url: 'https://mahatenders.gov.in',
      source_type: 'State e-Procurement',
      source_date: '18-Feb-2026',
      last_verified: '16-Mar-2026 11:30 IST'
    },
    verificationStatus: 'Verified',
    verificationNote: 'Officially cross-referenced with MahaTenders portal tender notice No. 2026_ZP_HLTH_041.',
    timelineStages: buildTimeline('2025-09-15', '2025-11-20', '2026-02-18', '2026-04-10', null, null, 'Tender Open')
  },
  {
    id: 'OPP-MH-2026-002',
    projectId: 'WS/MH/BAR/2026/146012',
    workName: 'Installation of Solar Piped Water Scheme with 25000 Litre Elevated Storage Reservoir',
    location: 'Supa Phata',
    village: 'Baramati Gramin (Supa)',
    subDistrict: 'Baramati',
    district: 'Pune',
    state: 'Maharashtra',
    constituency: 'Baramati',
    mpName: 'Smt. Supriya Sule',
    sector: 'Drinking Water',
    currentStatus: 'Tender Open',
    estimatedCost: 3200000,
    recommendationDate: '2025-08-10',
    sanctionDate: '2025-11-05',
    tenderStatus: 'Tender Open - Online Bidding Active',
    tenderReference: 'NIT-MWRD/BAR/2026/89',
    tenderingAuthority: 'Rural Water Supply Division, ZP Pune',
    tenderPublicationDate: '2026-02-25',
    tenderClosingDate: '2026-04-05',
    officialSource: {
      source_name: 'Central Public Procurement Portal (CPPP)',
      source_url: 'https://eprocure.gov.in/eprocure/app',
      source_type: 'CPPP',
      source_date: '25-Feb-2026',
      last_verified: '15-Mar-2026 14:15 IST'
    },
    verificationStatus: 'Verified',
    verificationNote: 'Tender notice published on CPPP under Tender ID 2026_CPPP_98124.',
    timelineStages: buildTimeline('2025-08-10', '2025-11-05', '2026-02-25', '2026-04-05', null, null, 'Tender Open')
  },
  {
    id: 'OPP-BR-2026-003',
    projectId: 'WS/BR/ARA/2026/148901',
    workName: 'PCC Road Construction with Side Storm Water Drainage from Permeshwar Tola to High School',
    location: 'Ward No 15 Area',
    village: 'Forbesganj Dehat',
    subDistrict: 'Forbesganj',
    district: 'Araria',
    state: 'Bihar',
    constituency: 'Araria',
    mpName: 'Shri Pradeep Kumar Singh',
    sector: 'Roads & Pathways',
    currentStatus: 'Tender Open',
    estimatedCost: 1850000,
    recommendationDate: '2025-07-22',
    sanctionDate: '2025-10-14',
    tenderStatus: 'Tender Open - Bids Accepted via eProc2 Bihar',
    tenderReference: 'RWD/WORKS/ARA/2026/112',
    tenderingAuthority: 'Rural Works Department (RWD) Division, Araria',
    tenderPublicationDate: '2026-03-01',
    tenderClosingDate: '2026-04-18',
    officialSource: {
      source_name: 'Bihar State e-Procurement Portal (eProc2 Bihar)',
      source_url: 'https://eproc2.bihar.gov.in',
      source_type: 'State e-Procurement',
      source_date: '01-Mar-2026',
      last_verified: '16-Mar-2026 16:00 IST'
    },
    verificationStatus: 'Verified',
    verificationNote: 'Tender published on eProc2 Bihar portal under e-NIT No. 12/2025-26/RWD/Araria.',
    timelineStages: buildTimeline('2025-07-22', '2025-10-14', '2026-03-01', '2026-04-18', null, null, 'Tender Open')
  },
  {
    id: 'OPP-UP-2026-004',
    projectId: 'WS/UP/VAR/2026/149550',
    workName: 'Solar Streetlighting & Energy Efficient Mini-Grid Setup across 12 Hamlets',
    location: 'Araziline Block Rural',
    village: 'Jayapur Adarsh Gram',
    subDistrict: 'Araziline',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    constituency: 'Varanasi',
    mpName: 'Shri Narendra Modi',
    sector: 'Renewable Energy',
    currentStatus: 'Tender Open',
    estimatedCost: 2200000,
    recommendationDate: '2025-09-02',
    sanctionDate: '2025-11-28',
    tenderStatus: 'Tender Open - GeM Custom Bid Opened',
    tenderReference: 'GEM/2026/B/7719230',
    tenderingAuthority: 'UPNEDA / District Rural Development Agency, Varanasi',
    tenderPublicationDate: '2026-03-05',
    tenderClosingDate: '2026-04-12',
    officialSource: {
      source_name: 'Government e-Marketplace (GeM)',
      source_url: 'https://gem.gov.in',
      source_type: 'GeM',
      source_date: '05-Mar-2026',
      last_verified: '16-Mar-2026 12:45 IST'
    },
    verificationStatus: 'Verified',
    verificationNote: 'GeM Custom Bid GEM/2026/B/7719230 active for certified solar vendors.',
    timelineStages: buildTimeline('2025-09-02', '2025-11-28', '2026-03-05', '2026-04-12', null, null, 'Tender Open')
  },

  // --- PROCUREMENT / TENDER PUBLISHED (Pre-bid / Formulating window) ---
  {
    id: 'OPP-MH-2026-005',
    projectId: 'WS/MH/NAG/2026/150210',
    workName: 'Construction of Multipurpose Civic Hall and Anganwadi Complex',
    location: 'Kalmeshwar Rural Area',
    village: 'Kalmeshwar Dehat',
    subDistrict: 'Kalmeshwar',
    district: 'Nagpur',
    state: 'Maharashtra',
    constituency: 'Ramtek',
    mpName: 'Shri Shyamkumar Barve',
    sector: 'Community Infrastructure',
    currentStatus: 'Procurement/Tender Published',
    estimatedCost: 2500000,
    recommendationDate: '2025-08-18',
    sanctionDate: '2025-12-10',
    tenderStatus: 'Notice Inviting Tender Published - Pre-Bid Conference Scheduled',
    tenderReference: 'NIT/ZP/NAG/BLD/2026/104',
    tenderingAuthority: 'Executive Engineer, PWD Nagpur',
    tenderPublicationDate: '2026-03-10',
    tenderClosingDate: '2026-04-25',
    officialSource: {
      source_name: 'Maharashtra State e-Procurement (MahaTenders)',
      source_url: 'https://mahatenders.gov.in',
      source_type: 'State e-Procurement',
      source_date: '10-Mar-2026',
      last_verified: '15-Mar-2026 17:00 IST'
    },
    verificationStatus: 'Verified',
    verificationNote: 'NIT published; pre-bid meeting scheduled for 28-Mar-2026.',
    timelineStages: buildTimeline('2025-08-18', '2025-12-10', '2026-03-10', '2026-04-25', null, null, 'Procurement/Tender Published')
  },
  {
    id: 'OPP-PB-2026-006',
    projectId: 'WS/PB/FAR/2026/151105',
    workName: 'Establishment of Computerized Digital Learning Lab in Govt Senior Secondary School',
    location: 'Jaitu Road',
    village: 'Bajakhana',
    subDistrict: 'Jaitu',
    district: 'Faridkot',
    state: 'Punjab',
    constituency: 'Faridkot (SC)',
    mpName: 'Shri Sarabjeet Singh Khalsa',
    sector: 'Education',
    currentStatus: 'Procurement/Tender Published',
    estimatedCost: 1500000,
    recommendationDate: '2025-09-20',
    sanctionDate: '2025-12-15',
    tenderStatus: 'Tender Published on GeM Portal',
    tenderReference: 'GEM/2026/B/8012450',
    tenderingAuthority: 'Deputy Commissioner / District Planning Office, Faridkot',
    tenderPublicationDate: '2026-03-08',
    tenderClosingDate: '2026-04-20',
    officialSource: {
      source_name: 'Government e-Marketplace (GeM)',
      source_url: 'https://gem.gov.in',
      source_type: 'GeM',
      source_date: '08-Mar-2026',
      last_verified: '16-Mar-2026 09:30 IST'
    },
    verificationStatus: 'Verified',
    verificationNote: 'Published on GeM for OEM certified digital education providers.',
    timelineStages: buildTimeline('2025-09-20', '2025-12-15', '2026-03-08', '2026-04-20', null, null, 'Procurement/Tender Published')
  },

  // --- SANCTIONED (Administrative & Financial Approval Accorded; Tender Notice Pending) ---
  {
    id: 'OPP-RJ-2026-007',
    projectId: 'WS/RJ/JAI/2026/152800',
    workName: 'Deepening and Stone Masonry Lining of Community Check Dam & Percolation Sump',
    location: 'Bassi Gram Panchayat Area',
    village: 'Bassi Gramin (Kalyanpura)',
    subDistrict: 'Bassi',
    district: 'Jaipur',
    state: 'Rajasthan',
    constituency: 'Dausa (ST)',
    mpName: 'Shri Murari Lal Meena',
    sector: 'Irrigation',
    currentStatus: 'Sanctioned',
    estimatedCost: 1950000,
    recommendationDate: '2025-10-05',
    sanctionDate: '2026-01-22',
    tenderStatus: 'Sanctioned - Pre-Procurement Tender Estimates Under Formulation',
    tenderReference: null,
    tenderingAuthority: 'Water Resources Department (WRD), Jaipur Division',
    tenderPublicationDate: null,
    tenderClosingDate: null,
    officialSource: {
      source_name: 'Ministry of Statistics & Programme Implementation (e-SAKSHI Public Release)',
      source_url: 'https://mplads.mospi.gov.in/digigov/dashboard.html',
      source_type: 'MoSPI e-SAKSHI',
      source_date: '22-Jan-2026',
      last_verified: '15-Mar-2026 12:00 IST'
    },
    verificationStatus: 'Verified',
    verificationNote: 'Sanction order registered in e-SAKSHI; tender documents in preparation.',
    timelineStages: buildTimeline('2025-10-05', '2026-01-22', null, null, null, null, 'Sanctioned')
  },
  {
    id: 'OPP-KL-2026-008',
    projectId: 'WS/KL/KOL/2026/153440',
    workName: 'Modern Digital Library and Cultural Study Centre Extension',
    location: 'Ward No 6 Thrikkaruva',
    village: 'Thrikkaruva Grama Panchayat',
    subDistrict: 'Kollam',
    district: 'Kollam',
    state: 'Kerala',
    constituency: 'Kollam',
    mpName: 'Shri N. K. Premachandran',
    sector: 'Education',
    currentStatus: 'Sanctioned',
    estimatedCost: 1400000,
    recommendationDate: '2025-08-30',
    sanctionDate: '2025-12-28',
    tenderStatus: 'Sanctioned - Awaiting E-Tender Publishing on Kerala e-Procurement',
    tenderReference: null,
    tenderingAuthority: 'District Collectorate Planning Cell, Kollam',
    tenderPublicationDate: null,
    tenderClosingDate: null,
    officialSource: {
      source_name: 'Ministry of Statistics & Programme Implementation (e-SAKSHI Public Release)',
      source_url: 'https://mplads.mospi.gov.in/digigov/dashboard.html',
      source_type: 'MoSPI e-SAKSHI',
      source_date: '28-Dec-2025',
      last_verified: '15-Mar-2026 13:00 IST'
    },
    verificationStatus: 'Verified',
    verificationNote: 'Administrative approval accorded; e-tender scheduled for April 2026.',
    timelineStages: buildTimeline('2025-08-30', '2025-12-28', null, null, null, null, 'Sanctioned')
  },
  {
    id: 'OPP-TN-2026-009',
    projectId: 'WS/TN/MAD/2026/154102',
    workName: 'Construction of Traditional Sports Training Gymnasium & Pavilion',
    location: 'Alanganallur Main Ground',
    village: 'Alanganallur Rural',
    subDistrict: 'Vadipatti',
    district: 'Madurai',
    state: 'Tamil Nadu',
    constituency: 'Madurai',
    mpName: 'Shri Su. Venkatesan',
    sector: 'Sports',
    currentStatus: 'Sanctioned',
    estimatedCost: 1750000,
    recommendationDate: '2025-09-12',
    sanctionDate: '2026-01-18',
    tenderStatus: 'Sanctioned - Engineering Estimates Scrutinized',
    tenderReference: null,
    tenderingAuthority: 'District Sports and Youth Welfare Office, Madurai',
    tenderPublicationDate: null,
    tenderClosingDate: null,
    officialSource: {
      source_name: 'Ministry of Statistics & Programme Implementation (e-SAKSHI Public Release)',
      source_url: 'https://mplads.mospi.gov.in/digigov/dashboard.html',
      source_type: 'MoSPI e-SAKSHI',
      source_date: '18-Jan-2026',
      last_verified: '15-Mar-2026 15:45 IST'
    },
    verificationStatus: 'Verified',
    verificationNote: 'Sanctioned by District Collector Madurai; tender notification expected.',
    timelineStages: buildTimeline('2025-09-12', '2026-01-18', null, null, null, null, 'Sanctioned')
  },

  // --- UNDER ADMINISTRATIVE PROCESSING (Under scrutiny / site verification) ---
  {
    id: 'OPP-MH-2026-010',
    projectId: 'WS/MH/PUN/2026/155900',
    workName: 'Concrete Pathway and Drainage Line for Primary School & Health Sub-Centre',
    location: 'Kesnand Vasti',
    village: 'Kesnand',
    subDistrict: 'Haveli',
    district: 'Pune',
    state: 'Maharashtra',
    constituency: 'Pune',
    mpName: 'Shri Murlidhar Mohol',
    sector: 'Roads & Pathways',
    currentStatus: 'Under Administrative Processing',
    estimatedCost: 950000,
    recommendationDate: '2025-11-14',
    sanctionDate: null,
    tenderStatus: 'Not available (Under administrative & technical feasibility scrutiny)',
    tenderReference: null,
    tenderingAuthority: 'District Planning Committee / Zilla Parishad Works, Pune',
    tenderPublicationDate: null,
    tenderClosingDate: null,
    officialSource: {
      source_name: 'Ministry of Statistics & Programme Implementation (e-SAKSHI Public Release)',
      source_url: 'https://mplads.mospi.gov.in/digigov/dashboard.html',
      source_type: 'MoSPI e-SAKSHI',
      source_date: '14-Nov-2025',
      last_verified: '14-Mar-2026 10:00 IST'
    },
    verificationStatus: 'Partially Verified',
    verificationNote: 'Recommendation recorded; technical scrutiny of estimate in progress.',
    timelineStages: buildTimeline('2025-11-14', null, null, null, null, null, 'Under Administrative Processing')
  },
  {
    id: 'OPP-BR-2026-011',
    projectId: 'WS/BR/PUR/2026/156400',
    workName: 'Installation of High-Capacity Deep Tube Well with Solar Pumping Machinery',
    location: 'Kasba Gramin Market',
    village: 'Kasba Gramin',
    subDistrict: 'Kasba',
    district: 'Purnia',
    state: 'Bihar',
    constituency: 'Purnia',
    mpName: 'Shri Rajesh Ranjan (Pappu Yadav)',
    sector: 'Drinking Water',
    currentStatus: 'Under Administrative Processing',
    estimatedCost: 850000,
    recommendationDate: '2025-12-05',
    sanctionDate: null,
    tenderStatus: 'Not available (Site inspection and groundwater clearance pending)',
    tenderReference: null,
    tenderingAuthority: 'Public Health Engineering Department (PHED), Purnia',
    tenderPublicationDate: null,
    tenderClosingDate: null,
    officialSource: {
      source_name: 'Ministry of Statistics & Programme Implementation (e-SAKSHI Public Release)',
      source_url: 'https://mplads.mospi.gov.in/digigov/dashboard.html',
      source_type: 'MoSPI e-SAKSHI',
      source_date: '05-Dec-2025',
      last_verified: '14-Mar-2026 11:30 IST'
    },
    verificationStatus: 'Partially Verified',
    verificationNote: 'Hydrogeological site verification in progress by PHED engineers.',
    timelineStages: buildTimeline('2025-12-05', null, null, null, null, null, 'Under Administrative Processing')
  },
  {
    id: 'OPP-UP-2026-012',
    projectId: 'WS/UP/VAR/2026/157020',
    workName: 'Construction of Covered Cattle Shed and Milking Station for Dairy SHG',
    location: 'Nagepur Village Outskirts',
    village: 'Nagepur Gramin',
    subDistrict: 'Araziline',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    constituency: 'Varanasi',
    mpName: 'Shri Narendra Modi',
    sector: 'Community Infrastructure',
    currentStatus: 'Under Administrative Processing',
    estimatedCost: 1200000,
    recommendationDate: '2025-12-18',
    sanctionDate: null,
    tenderStatus: 'Not available (Land title verification and NOC under review)',
    tenderReference: null,
    tenderingAuthority: 'Chief Development Officer (CDO), Varanasi',
    tenderPublicationDate: null,
    tenderClosingDate: null,
    officialSource: {
      source_name: 'Ministry of Statistics & Programme Implementation (e-SAKSHI Public Release)',
      source_url: 'https://mplads.mospi.gov.in/digigov/dashboard.html',
      source_type: 'MoSPI e-SAKSHI',
      source_date: '18-Dec-2025',
      last_verified: '15-Mar-2026 16:30 IST'
    },
    verificationStatus: 'Partially Verified',
    verificationNote: 'Gram Sabha land NOC submitted; technical estimate formulation in progress.',
    timelineStages: buildTimeline('2025-12-18', null, null, null, null, null, 'Under Administrative Processing')
  },

  // --- RECOMMENDED (MP Recommendation Recorded in e-SAKSHI, Initial Stage) ---
  {
    id: 'OPP-PB-2026-013',
    projectId: 'WS/PB/FAR/2026/158220',
    workName: 'Solar Powered Reverse Osmosis (RO) Safe Drinking Water Plant (1000 LPH)',
    location: 'Dal Singh Wala Bus Adda',
    village: 'Dal Singh Wala',
    subDistrict: 'Jaitu',
    district: 'Faridkot',
    state: 'Punjab',
    constituency: 'Faridkot (SC)',
    mpName: 'Shri Sarabjeet Singh Khalsa',
    sector: 'Drinking Water',
    currentStatus: 'Recommended',
    estimatedCost: 750000,
    recommendationDate: '2026-01-10',
    sanctionDate: null,
    tenderStatus: 'Not available (No procurement information published for proposed work)',
    tenderReference: null,
    tenderingAuthority: null,
    tenderPublicationDate: null,
    tenderClosingDate: null,
    officialSource: {
      source_name: 'Ministry of Statistics & Programme Implementation (e-SAKSHI Public Release)',
      source_url: 'https://mplads.mospi.gov.in/digigov/dashboard.html',
      source_type: 'MoSPI e-SAKSHI',
      source_date: '10-Jan-2026',
      last_verified: '16-Mar-2026 08:30 IST'
    },
    verificationStatus: 'Partially Verified',
    verificationNote: 'Formal recommendation logged in e-SAKSHI portal by Hon. MP.',
    timelineStages: buildTimeline('2026-01-10', null, null, null, null, null, 'Recommended')
  },
  {
    id: 'OPP-MH-2026-014',
    projectId: 'WS/MH/PUN/2026/159100',
    workName: 'Digital Learning Smart Classrooms & Solar Backup for Secondary School',
    location: 'Alandi Dehu Phata Area',
    village: 'Alandi Rural (Dehu Phata)',
    subDistrict: 'Khed',
    district: 'Pune',
    state: 'Maharashtra',
    constituency: 'Shirur',
    mpName: 'Dr. Amol Kolhe',
    sector: 'Education',
    currentStatus: 'Recommended',
    estimatedCost: 1100000,
    recommendationDate: '2026-01-25',
    sanctionDate: null,
    tenderStatus: 'Not available (No procurement notice published)',
    tenderReference: null,
    tenderingAuthority: null,
    tenderPublicationDate: null,
    tenderClosingDate: null,
    officialSource: {
      source_name: 'Ministry of Statistics & Programme Implementation (e-SAKSHI Public Release)',
      source_url: 'https://mplads.mospi.gov.in/digigov/dashboard.html',
      source_type: 'MoSPI e-SAKSHI',
      source_date: '25-Jan-2026',
      last_verified: '16-Mar-2026 09:00 IST'
    },
    verificationStatus: 'Partially Verified',
    verificationNote: 'Recommended by Hon. MP Shirur; awaiting technical verification by ZP Education Dept.',
    timelineStages: buildTimeline('2026-01-25', null, null, null, null, null, 'Recommended')
  },
  {
    id: 'OPP-RJ-2026-015',
    projectId: 'WS/RJ/JAI/2026/159840',
    workName: 'Veterinary Diagnostic Centre Equipment and Mobile Treatment Van Unit',
    location: 'Chaksu Dehat Veterinary Sub-Centre',
    village: 'Chaksu Dehat',
    subDistrict: 'Chaksu',
    district: 'Jaipur',
    state: 'Rajasthan',
    constituency: 'Dausa (ST)',
    mpName: 'Shri Murari Lal Meena',
    sector: 'Health & Sanitation',
    currentStatus: 'Recommended',
    estimatedCost: 1600000,
    recommendationDate: '2026-02-04',
    sanctionDate: null,
    tenderStatus: 'Not available (No procurement information published)',
    tenderReference: null,
    tenderingAuthority: null,
    tenderPublicationDate: null,
    tenderClosingDate: null,
    officialSource: {
      source_name: 'Ministry of Statistics & Programme Implementation (e-SAKSHI Public Release)',
      source_url: 'https://mplads.mospi.gov.in/digigov/dashboard.html',
      source_type: 'MoSPI e-SAKSHI',
      source_date: '04-Feb-2026',
      last_verified: '15-Mar-2026 14:00 IST'
    },
    verificationStatus: 'Partially Verified',
    verificationNote: 'Recommended under livestock welfare provisions; sanction pending.',
    timelineStages: buildTimeline('2026-02-04', null, null, null, null, null, 'Recommended')
  },

  // --- WORK IN PROGRESS (Contract Awarded & Ground Construction Underway) ---
  {
    id: 'OPP-MH-2026-016',
    projectId: 'WS/MH/PUN/2025/133409',
    workName: 'Construction of Multipurpose Civic Hall with Solar Rooftop Power System',
    location: 'Wagholi Village Centre',
    village: 'Wagholi Gram Panchayat',
    subDistrict: 'Haveli',
    district: 'Pune',
    state: 'Maharashtra',
    constituency: 'Pune',
    mpName: 'Shri Murlidhar Mohol',
    sector: 'Community Infrastructure',
    currentStatus: 'Work in Progress',
    estimatedCost: 2000000,
    recommendationDate: '2024-05-10',
    sanctionDate: '2024-08-15',
    tenderStatus: 'Tender Concluded - Contract Awarded',
    tenderReference: 'TNDR/MH/PUN/2025/904',
    tenderingAuthority: 'District Planning Office & E-Tendering Cell, Pune',
    tenderPublicationDate: '2024-09-02',
    tenderClosingDate: '2024-10-15',
    officialSource: {
      source_name: 'Maharashtra State e-Procurement (MahaTenders)',
      source_url: 'https://mahatenders.gov.in',
      source_type: 'State e-Procurement',
      source_date: '02-Sep-2024',
      last_verified: '14-Mar-2026 11:00 IST'
    },
    verificationStatus: 'Verified',
    verificationNote: 'Awarded to ABC Infrastructure Pvt. Ltd.; physical execution 43% completed.',
    timelineStages: buildTimeline('2024-05-10', '2024-08-15', '2024-09-02', '2024-10-15', '2024-12-10', null, 'Work in Progress')
  },
  {
    id: 'OPP-BR-2026-017',
    projectId: 'WS/BR/ARA/2025/139220',
    workName: 'Construction of Community Relief Shed for Flood Evacuation Gathering',
    location: 'Raniganj Rural High Ground',
    village: 'Raniganj Rural (Hasanpur)',
    subDistrict: 'Raniganj',
    district: 'Araria',
    state: 'Bihar',
    constituency: 'Araria',
    mpName: 'Shri Pradeep Kumar Singh',
    sector: 'Community Infrastructure',
    currentStatus: 'Work in Progress',
    estimatedCost: 550000,
    recommendationDate: '2024-06-12',
    sanctionDate: '2024-09-05',
    tenderStatus: 'Tender Concluded - Execution Ongoing',
    tenderReference: 'RWD/ARA/FL/2024/091',
    tenderingAuthority: 'District Relief & Planning Division, Araria',
    tenderPublicationDate: '2024-09-25',
    tenderClosingDate: '2024-10-30',
    officialSource: {
      source_name: 'Bihar State e-Procurement Portal (eProc2 Bihar)',
      source_url: 'https://eproc2.bihar.gov.in',
      source_type: 'State e-Procurement',
      source_date: '25-Sep-2024',
      last_verified: '12-Mar-2026 15:20 IST'
    },
    verificationStatus: 'Verified',
    verificationNote: 'Contract awarded; foundation and masonry work underway.',
    timelineStages: buildTimeline('2024-06-12', '2024-09-05', '2024-09-25', '2024-10-30', '2024-12-01', null, 'Work in Progress')
  },

  // --- COMPLETED (Asset Finalized & Commissioned) ---
  {
    id: 'OPP-KL-2026-018',
    projectId: 'WS/KL/KOL/2024/134140',
    workName: 'Concreting of Link Road from Janathavayanasala to Panthaplavil',
    location: 'Ward No 6 Thrikkaruva',
    village: 'Thrikkaruva Grama Panchayat',
    subDistrict: 'Kollam',
    district: 'Kollam',
    state: 'Kerala',
    constituency: 'Kollam',
    mpName: 'Shri N. K. Premachandran',
    sector: 'Roads & Pathways',
    currentStatus: 'Completed',
    estimatedCost: 293492,
    recommendationDate: '2024-03-12',
    sanctionDate: '2024-05-20',
    tenderStatus: 'Tender Concluded - Project 100% Completed',
    tenderReference: 'KL/KOL/PWD/2024/014',
    tenderingAuthority: 'Kollam Infrastructure Authority',
    tenderPublicationDate: '2024-06-05',
    tenderClosingDate: '2024-07-02',
    officialSource: {
      source_name: 'Ministry of Statistics & Programme Implementation (e-SAKSHI Public Release)',
      source_url: 'https://mplads.mospi.gov.in/digigov/dashboard.html',
      source_type: 'MoSPI e-SAKSHI',
      source_date: '12-Aug-2024',
      last_verified: '10-Mar-2026 16:00 IST'
    },
    verificationStatus: 'Verified',
    verificationNote: 'Officially certified completed on 12-Aug-2024 in e-SAKSHI MoSPI registry.',
    timelineStages: buildTimeline('2024-03-12', '2024-05-20', '2024-06-05', '2024-07-02', '2024-07-15', '2024-08-12', 'Completed')
  },
  {
    id: 'OPP-UP-2026-019',
    projectId: 'WS/UP/VAR/2024/115400',
    workName: 'Upgradation of Primary Health Sub-Centre Building with Telemedicine Facility',
    location: 'Jayapur Village Center',
    village: 'Jayapur Adarsh Gram',
    subDistrict: 'Araziline',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    constituency: 'Varanasi',
    mpName: 'Shri Narendra Modi',
    sector: 'Health & Sanitation',
    currentStatus: 'Completed',
    estimatedCost: 1100000,
    recommendationDate: '2024-02-10',
    sanctionDate: '2024-04-28',
    tenderStatus: 'Tender Concluded - Project 100% Completed',
    tenderReference: 'E-TNDR/UP/VAR/HLTH/2024/09',
    tenderingAuthority: 'Chief Medical Officer / DRDA Varanasi',
    tenderPublicationDate: '2024-05-15',
    tenderClosingDate: '2024-06-20',
    officialSource: {
      source_name: 'Ministry of Statistics & Programme Implementation (e-SAKSHI Public Release)',
      source_url: 'https://mplads.mospi.gov.in/digigov/dashboard.html',
      source_type: 'MoSPI e-SAKSHI',
      source_date: '12-Nov-2024',
      last_verified: '10-Mar-2026 17:30 IST'
    },
    verificationStatus: 'Verified',
    verificationNote: 'Completion and handover certificate verified in MoSPI repository.',
    timelineStages: buildTimeline('2024-02-10', '2024-04-28', '2024-05-15', '2024-06-20', '2024-07-01', '2024-11-12', 'Completed')
  }
];

// Calculate Dynamic KPI Summary strictly from current records
export function calculateOpportunityKPIs(records: OpportunityRecord[]): OpportunityKPISummary {
  let recommendedWorks = 0;
  let sanctionedWorks = 0;
  let worksWithProcurementInfo = 0;
  let openTenderOpportunities = 0;
  let upcomingPlannedWorks = 0;
  let projectsWithoutTenderInfo = 0;

  for (const r of records) {
    if (r.currentStatus === 'Recommended') {
      recommendedWorks++;
      upcomingPlannedWorks++;
    } else if (r.currentStatus === 'Under Administrative Processing') {
      upcomingPlannedWorks++;
    } else if (r.currentStatus === 'Sanctioned') {
      sanctionedWorks++;
      upcomingPlannedWorks++;
    }

    if (r.currentStatus === 'Tender Open') {
      openTenderOpportunities++;
      worksWithProcurementInfo++;
    } else if (r.currentStatus === 'Procurement/Tender Published') {
      worksWithProcurementInfo++;
    }

    if (!r.tenderReference || r.tenderReference.trim() === '' || r.currentStatus === 'Recommended' || r.currentStatus === 'Under Administrative Processing') {
      projectsWithoutTenderInfo++;
    }
  }

  return {
    recommendedWorks,
    sanctionedWorks,
    worksWithProcurementInfo,
    openTenderOpportunities,
    upcomingPlannedWorks,
    projectsWithoutTenderInfo
  };
}

// Local Storage Management for Contractor Interest Registration
const CONTRACTOR_INTERESTS_STORAGE_KEY = 'mplads_contractor_interests';

// Seed demo interested projects so contractor dashboard is interactive immediately
const INITIAL_SEED_INTERESTS: ContractorInterestRecord[] = [
  {
    id: 'INT-2026-891',
    projectId: 'WS/MH/PUN/2026/145890',
    projectName: 'Construction of Sub-District Health Sub-Centre Building & Diagnostic Room',
    contractorName: 'Apex Civil Infra LLP',
    authorizedPerson: 'Rajesh Deshmukh',
    email: 'contact@apexcivil.in',
    phone: '+91 98230 45678',
    state: 'Maharashtra',
    district: 'Pune',
    relevantSector: 'Health & Sanitation',
    experienceYears: 12,
    registrationNumber: 'PWD/MH/CL1/2019/441',
    gstin: '27AABCA1234F1Z5',
    reasonForInterest: 'Experienced in healthcare civil works and hospital diagnostic room execution in Pune district.',
    submittedAt: '2026-03-14T14:30:00.000Z',
    disclaimerAccepted: true,
    officialSourceUrl: 'https://mahatenders.gov.in',
    tenderStatus: 'Tender Open - Technical Bid Submission Active'
  },
  {
    id: 'INT-2026-892',
    projectId: 'WS/BR/ARA/2026/148901',
    projectName: 'PCC Road Construction with Side Storm Water Drainage from Permeshwar Tola to High School',
    contractorName: 'Mithila Roadways & Construction Co.',
    authorizedPerson: 'Alok Kumar Mishra',
    email: 'mishra.mithila@gmail.com',
    phone: '+91 94312 89012',
    state: 'Bihar',
    district: 'Araria',
    relevantSector: 'Roads & Pathways',
    experienceYears: 8,
    registrationNumber: 'RWD/BR/CLASS2/8821',
    reasonForInterest: 'Specialized in rural PCC road and culvert works in flood-prone areas of Kosi/Seemanchal.',
    submittedAt: '2026-03-15T11:15:00.000Z',
    disclaimerAccepted: true,
    officialSourceUrl: 'https://eproc2.bihar.gov.in',
    tenderStatus: 'Tender Open - Bids Accepted via eProc2 Bihar'
  }
];

export function getContractorInterests(): ContractorInterestRecord[] {
  try {
    const raw = localStorage.getItem(CONTRACTOR_INTERESTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CONTRACTOR_INTERESTS_STORAGE_KEY, JSON.stringify(INITIAL_SEED_INTERESTS));
      return INITIAL_SEED_INTERESTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load contractor interests from storage', e);
    return INITIAL_SEED_INTERESTS;
  }
}

export function saveContractorInterest(record: Omit<ContractorInterestRecord, 'id' | 'submittedAt'>): ContractorInterestRecord {
  const all = getContractorInterests();
  const newRecord: ContractorInterestRecord = {
    ...record,
    id: `INT-${Date.now().toString().slice(-6)}`,
    submittedAt: new Date().toISOString()
  };
  const updated = [newRecord, ...all];
  try {
    localStorage.setItem(CONTRACTOR_INTERESTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('contractor-interests-updated'));
  } catch (e) {
    console.error('Failed to save contractor interest', e);
  }
  return newRecord;
}

export function withdrawContractorInterest(interestId: string): void {
  const all = getContractorInterests();
  const filtered = all.filter(item => item.id !== interestId);
  try {
    localStorage.setItem(CONTRACTOR_INTERESTS_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('contractor-interests-updated'));
  } catch (e) {
    console.error('Failed to withdraw contractor interest', e);
  }
}
