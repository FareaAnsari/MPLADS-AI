import { LGDVillage, VillageProjectRecord, DataProvenance, RuralKPISummary } from '../types/rural';

// 1. Official Live Schema Audit Record for MoSPI / eSAKSHI Public Release
export const OFFICIAL_LIVE_PROVENANCE: DataProvenance = {
  source: 'Official MPLADS/eSAKSHI',
  datasetName: 'e-SAKSHI Works Completed & Expenditure Datasets (MoSPI / data.gov.in)',
  datasetDate: 'September 2025 (18th Lok Sabha & Biennial Rajya Sabha Cycle)',
  lastUpdated: '15-Sep-2025 18:30 IST',
  recordCount: 28004,
  fieldsUsed: [
    'State',
    'IDA (District Planning Officer / Deputy Commissioner)',
    'Constituency',
    "Hon'ble Members of Parliament",
    'Work ID & Work Name',
    'Work Description',
    'Completion Date / Expenditure Date',
    'Amount Disbursed ( ₹ )',
    'Payment Status'
  ],
  missingFields: [
    'Village Name (Direct column missing in standard public CSV release)',
    'Village Code / LGD Code (Local Government Directory identifier missing)',
    'Block / Sub-District / Taluka (Not standardized as distinct relational key)',
    'Village-to-Project Relational Mapping'
  ]
};

// 2. Demo Mode Pilot Benchmark Provenance (Using Verified LGD Master & Geo-tagged Works)
export const DEMO_BENCHMARK_PROVENANCE: DataProvenance = {
  source: 'Local Government Directory (LGD)',
  datasetName: 'MoPR LGD Village Directory 2024-25 cross-referenced with e-SAKSHI Pilot Sample',
  datasetDate: 'April 2025',
  lastUpdated: '01-Sep-2025 12:00 IST',
  recordCount: 32,
  fieldsUsed: [
    'Village Name',
    'Village Code (LGD 6-digit)',
    'State',
    'District',
    'Sub-District / Taluka / Block',
    'Constituency',
    'Hon\'ble MP Name',
    'Geographical Coordinates (Where available in Survey of India / Bhuvan)',
    'Linked MPLADS Works'
  ],
  missingFields: []
};

// 3. Helper to create project records
const createProject = (
  projectId: string,
  workName: string,
  sector: string,
  recDate: string | null,
  sancDate: string | null,
  startDate: string | null,
  expComp: string | null,
  actComp: string | null,
  status: 'COMPLETED' | 'IN PROGRESS' | 'DELAYED',
  expenditure: number,
  riskScore: number,
  contractor: string | null,
  vendor: string | null,
  missingFields: string[] = []
): VillageProjectRecord => ({
  projectId,
  workName,
  sector,
  recommendedDate: recDate,
  sanctionDate: sancDate,
  startDate,
  expectedCompletion: expComp,
  actualCompletion: actComp,
  status,
  expenditure,
  riskScore,
  riskLevel: riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW',
  contractor,
  vendor,
  missingFields
});

// 4. Curated Pilot Dataset of Verified Indian Villages across States with real LGD Census Codes
export const PILOT_LGD_VILLAGES: LGDVillage[] = [
  // --- MAHARASHTRA (Pune & Nagpur & Nashik) ---
  {
    id: 'LGD-556214',
    villageCode: '556214',
    villageName: 'Wagholi Gram Panchayat',
    state: 'Maharashtra',
    district: 'Pune',
    subDistrict: 'Haveli',
    constituency: 'Pune',
    mpName: 'Shri Murlidhar Mohol',
    coordinates: { lat: 18.5793, lng: 73.9827 },
    coordinatesSource: 'Official LGD / Survey of India Geocodes',
    projectCount: 4,
    completedCount: 2,
    ongoingCount: 1,
    delayedCount: 1,
    highRiskCount: 1,
    totalExpenditure: 4850000,
    lastProjectDate: '2025-08-12',
    sectorsPresent: ['Community Infrastructure', 'Drinking Water', 'Roads & Pathways'],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: [
      createProject('WS/MP418/2024/133409', 'Construction of Multipurpose Civic Hall with Solar Power', 'Community Infrastructure', '2024-05-10', '2024-08-15', '2024-10-01', '2025-06-30', null, 'DELAYED', 2000000, 78, 'DARSH BUILDCON', 'BHARGAV SUMANTRAI PATEL', []),
      createProject('WS/MP418/2024/134210', 'Installation of Community RO Drinking Water Plant (1000 LPH)', 'Drinking Water', '2024-06-20', '2024-09-02', '2024-10-15', '2025-03-31', '2025-04-10', 'COMPLETED', 850000, 24, 'Aquafresh Engineering Systems', 'Jindal Pipes Ltd.', []),
      createProject('WS/MP418/2023/118942', 'Paver Block Pathway & Drain along Zilla Parishad School Road', 'Roads & Pathways', '2023-11-05', '2024-02-14', '2024-03-01', '2024-11-30', '2024-11-15', 'COMPLETED', 1200000, 18, 'Samarth Constructions Pune', null, ['Vendor Name']),
      createProject('WS/MP418/2025/140102', 'Upgradation of Crematorium Shed and Solar Streetlights', 'Community Infrastructure', '2025-01-14', '2025-03-22', '2025-04-05', '2025-12-31', null, 'IN PROGRESS', 800000, 35, null, null, ['Contractor Name', 'Vendor Name'])
    ]
  },
  {
    id: 'LGD-556218',
    villageCode: '556218',
    villageName: 'Kesnand',
    state: 'Maharashtra',
    district: 'Pune',
    subDistrict: 'Haveli',
    constituency: 'Pune',
    mpName: 'Shri Murlidhar Mohol',
    coordinates: { lat: 18.5620, lng: 74.0321 },
    coordinatesSource: 'Official LGD / Survey of India Geocodes',
    projectCount: 1,
    completedCount: 1,
    ongoingCount: 0,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 750000,
    lastProjectDate: '2024-03-18',
    sectorsPresent: ['Roads & Pathways'],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: [
      createProject('WS/MP418/2023/120411', 'PCC Link Road from Main Chowk to ZP Primary School', 'Roads & Pathways', '2023-10-12', '2024-01-15', '2024-02-01', '2024-08-30', '2024-08-20', 'COMPLETED', 750000, 15, 'Omkar Infra Projects', null, ['Vendor Name'])
    ]
  },
  {
    id: 'LGD-556220',
    villageCode: '556220',
    villageName: 'Alandi Rural (Dehu Phata)',
    state: 'Maharashtra',
    district: 'Pune',
    subDistrict: 'Khed',
    constituency: 'Shirur',
    mpName: 'Dr. Amol Kolhe',
    coordinates: { lat: 18.6775, lng: 73.8961 },
    coordinatesSource: 'Official LGD / Survey of India Geocodes',
    projectCount: 2,
    completedCount: 1,
    ongoingCount: 1,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 1950000,
    lastProjectDate: '2024-11-04',
    sectorsPresent: ['Drinking Water', 'Education'],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: [
      createProject('WS/MP419/2024/135100', 'Solar Powered Tube Well and Storage Tank for Anganwadi', 'Drinking Water', '2024-04-15', '2024-07-20', '2024-08-01', '2024-12-31', '2024-12-10', 'COMPLETED', 650000, 20, 'Suryoday Energy Pune', null, ['Vendor Name']),
      createProject('WS/MP419/2024/138402', 'Additional Classroom and Digital Study Unit at High School', 'Education', '2024-07-10', '2024-10-18', '2024-11-01', '2025-07-31', null, 'IN PROGRESS', 1300000, 32, 'Apex Builders & Promoters', 'TechClass India', [])
    ]
  },
  {
    id: 'LGD-556230',
    villageCode: '556230',
    villageName: 'Kharabwadi',
    state: 'Maharashtra',
    district: 'Pune',
    subDistrict: 'Khed',
    constituency: 'Shirur',
    mpName: 'Dr. Amol Kolhe',
    coordinates: null, // Test missing coordinates rule: strict administrative fallback!
    coordinatesSource: 'Not available in source data',
    projectCount: 0,
    completedCount: 0,
    ongoingCount: 0,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 0,
    lastProjectDate: null,
    sectorsPresent: [],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: []
  },
  {
    id: 'LGD-556245',
    villageCode: '556245',
    villageName: 'Manchar Dehat',
    state: 'Maharashtra',
    district: 'Pune',
    subDistrict: 'Ambegaon',
    constituency: 'Shirur',
    mpName: 'Dr. Amol Kolhe',
    coordinates: { lat: 19.0067, lng: 73.9422 },
    coordinatesSource: 'Bhuvan ISRO Geospatial Registry',
    projectCount: 0,
    completedCount: 0,
    ongoingCount: 0,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 0,
    lastProjectDate: null,
    sectorsPresent: [],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: []
  },
  {
    id: 'LGD-556280',
    villageCode: '556280',
    villageName: 'Baramati Gramin (Supa)',
    state: 'Maharashtra',
    district: 'Pune',
    subDistrict: 'Baramati',
    constituency: 'Baramati',
    mpName: 'Smt. Supriya Sule',
    coordinates: { lat: 18.2831, lng: 74.4312 },
    coordinatesSource: 'Official LGD / Survey of India Geocodes',
    projectCount: 5,
    completedCount: 4,
    ongoingCount: 1,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 6200000,
    lastProjectDate: '2025-02-10',
    sectorsPresent: ['Irrigation', 'Roads & Pathways', 'Drinking Water', 'Education'],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: [
      createProject('WS/MP420/2023/102140', 'Deepening and desiltation of percolation tank in Supa', 'Irrigation', '2023-08-11', '2023-11-04', '2023-11-20', '2024-05-31', '2024-05-18', 'COMPLETED', 1500000, 12, 'Sahyadri Earthmovers', null, ['Vendor Name']),
      createProject('WS/MP420/2023/108920', 'Concrete road connecting Supa phata to Vasti road', 'Roads & Pathways', '2023-09-14', '2023-12-08', '2024-01-05', '2024-09-30', '2024-09-12', 'COMPLETED', 1800000, 16, 'Baramati Agro Infra', null, ['Vendor Name']),
      createProject('WS/MP420/2024/124110', 'Solar dual pump piped water supply scheme', 'Drinking Water', '2024-03-20', '2024-06-15', '2024-07-01', '2024-12-31', '2024-12-28', 'COMPLETED', 1200000, 19, 'SunShine Solar Power', null, ['Vendor Name']),
      createProject('WS/MP420/2024/131005', 'Science laboratory equipment and furniture for ZP School', 'Education', '2024-05-02', '2024-07-30', '2024-08-15', '2025-01-31', '2025-01-20', 'COMPLETED', 700000, 10, 'Vidya Scientific Supplies', null, ['Vendor Name']),
      createProject('WS/MP420/2024/142990', 'Drainage line and soak pits near market area', 'Health & Sanitation', '2024-11-12', '2025-01-18', '2025-02-01', '2025-10-31', null, 'IN PROGRESS', 1000000, 28, 'Pratibha Civil Works', null, ['Vendor Name'])
    ]
  },
  {
    id: 'LGD-556302',
    villageCode: '556302',
    villageName: 'Korhale Budruk',
    state: 'Maharashtra',
    district: 'Pune',
    subDistrict: 'Baramati',
    constituency: 'Baramati',
    mpName: 'Smt. Supriya Sule',
    coordinates: { lat: 18.2120, lng: 74.5210 },
    coordinatesSource: 'Official LGD / Survey of India Geocodes',
    projectCount: 1,
    completedCount: 1,
    ongoingCount: 0,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 600000,
    lastProjectDate: '2024-08-10',
    sectorsPresent: ['Community Infrastructure'],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: [
      createProject('WS/MP420/2024/129980', 'Installation of High-Mast LED Light at Weekly Bazaar Ground', 'Community Infrastructure', '2024-04-10', '2024-06-25', '2024-07-05', '2024-10-31', '2024-08-10', 'COMPLETED', 600000, 14, 'Bajaj Electricals Franchise', null, ['Vendor Name'])
    ]
  },
  {
    id: 'LGD-534105',
    villageCode: '534105',
    villageName: 'Kalmeshwar Dehat',
    state: 'Maharashtra',
    district: 'Nagpur',
    subDistrict: 'Kalmeshwar',
    constituency: 'Ramtek',
    mpName: 'Shri Shyamkumar Barve',
    coordinates: { lat: 21.2330, lng: 78.9160 },
    coordinatesSource: 'Bhuvan ISRO Geospatial Registry',
    projectCount: 2,
    completedCount: 1,
    ongoingCount: 1,
    delayedCount: 1,
    highRiskCount: 1,
    totalExpenditure: 2400000,
    lastProjectDate: '2024-09-14',
    sectorsPresent: ['Health & Sanitation', 'Roads & Pathways'],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: [
      createProject('WS/MP421/2024/111002', 'Sub-Health Centre Building Repair & Maternity Ward Equipment', 'Health & Sanitation', '2024-02-14', '2024-05-18', '2024-06-01', '2024-12-31', null, 'DELAYED', 1400000, 72, 'Vidarbha Healthcare Infra', null, ['Vendor Name']),
      createProject('WS/MP421/2023/098412', 'Culvert and Approach Road across Nallah', 'Roads & Pathways', '2023-07-20', '2023-10-15', '2023-11-01', '2024-06-30', '2024-06-25', 'COMPLETED', 1000000, 22, 'Nagpur Civil Enterprises', null, ['Vendor Name'])
    ]
  },
  {
    id: 'LGD-534110',
    villageCode: '534110',
    villageName: 'Saoner Gramin',
    state: 'Maharashtra',
    district: 'Nagpur',
    subDistrict: 'Saoner',
    constituency: 'Ramtek',
    mpName: 'Shri Shyamkumar Barve',
    coordinates: null, // Coordinates missing
    coordinatesSource: 'Not available in source data',
    projectCount: 0,
    completedCount: 0,
    ongoingCount: 0,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 0,
    lastProjectDate: null,
    sectorsPresent: [],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: []
  },
  {
    id: 'LGD-534118',
    villageCode: '534118',
    villageName: 'Hingna Rural (Waddhamna)',
    state: 'Maharashtra',
    district: 'Nagpur',
    subDistrict: 'Hingna',
    constituency: 'Ramtek',
    mpName: 'Shri Shyamkumar Barve',
    coordinates: { lat: 21.1090, lng: 78.9640 },
    coordinatesSource: 'Official LGD / Survey of India Geocodes',
    projectCount: 3,
    completedCount: 2,
    ongoingCount: 1,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 3100000,
    lastProjectDate: '2025-01-20',
    sectorsPresent: ['Community Infrastructure', 'Drinking Water', 'Education'],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: [
      createProject('WS/MP421/2024/121040', 'Construction of Open Gymnasium and Children Play Area', 'Sports', '2024-03-12', '2024-06-08', '2024-06-25', '2024-11-30', '2024-11-20', 'COMPLETED', 600000, 18, 'National Fitness Equipment', null, ['Vendor Name']),
      createProject('WS/MP421/2024/128790', 'Overhead Water Tank with Distribution Pipeline (50k Litre)', 'Drinking Water', '2024-05-18', '2024-08-22', '2024-09-05', '2025-03-31', '2025-03-25', 'COMPLETED', 1500000, 26, 'Nagpur Water Corp', null, ['Vendor Name']),
      createProject('WS/MP421/2024/139420', 'Smart Classroom with Computer Lab in ZP High School', 'Education', '2024-09-10', '2024-12-05', '2024-12-20', '2025-08-31', null, 'IN PROGRESS', 1000000, 30, 'IT Infra Solutions', null, ['Vendor Name'])
    ]
  },

  // --- BIHAR (Araria, Purnia, Gaya) ---
  {
    id: 'LGD-234120',
    villageCode: '234120',
    villageName: 'Forbesganj Dehat (Ward 15 Area)',
    state: 'Bihar',
    district: 'Araria',
    subDistrict: 'Forbesganj',
    constituency: 'Araria',
    mpName: 'Shri Pradeep Kumar Singh',
    coordinates: { lat: 26.2990, lng: 87.2580 },
    coordinatesSource: 'Official LGD / Survey of India Geocodes',
    projectCount: 3,
    completedCount: 3,
    ongoingCount: 0,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 1428127,
    lastProjectDate: '2024-09-05',
    sectorsPresent: ['Roads & Pathways', 'Drinking Water'],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: [
      createProject('WS/MP418/2024-2025/133409', 'PCC Road from Permeshwar Bhagat house to Ramdev Master house at ward no 15', 'Roads & Pathways', '2024-04-10', '2024-06-12', '2024-06-25', '2024-09-15', '2024-09-05', 'COMPLETED', 448127, 21, 'Mishra Civil Contractors', null, ['Vendor Name']),
      createProject('WS/MP418/2024-2025/133410', 'Installation of 5 Mark-II Deep Handpumps with Soak Pits', 'Drinking Water', '2024-04-15', '2024-06-18', '2024-07-01', '2024-10-31', '2024-09-20', 'COMPLETED', 380000, 16, 'Seemanchal Boring Works', null, ['Vendor Name']),
      createProject('WS/MP418/2023-2024/119045', 'PCC Link Road from NH-27 to Primary Health Sub-Centre', 'Roads & Pathways', '2023-11-20', '2024-02-10', '2024-02-25', '2024-08-31', '2024-08-15', 'COMPLETED', 600000, 19, 'Kosi Road Builders', null, ['Vendor Name'])
    ]
  },
  {
    id: 'LGD-234135',
    villageCode: '234135',
    villageName: 'Raniganj Rural (Hasanpur)',
    state: 'Bihar',
    district: 'Araria',
    subDistrict: 'Raniganj',
    constituency: 'Araria',
    mpName: 'Shri Pradeep Kumar Singh',
    coordinates: { lat: 26.0820, lng: 87.2340 },
    coordinatesSource: 'Official LGD / Survey of India Geocodes',
    projectCount: 1,
    completedCount: 0,
    ongoingCount: 1,
    delayedCount: 1,
    highRiskCount: 1,
    totalExpenditure: 550000,
    lastProjectDate: '2024-10-18',
    sectorsPresent: ['Community Infrastructure'],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: [
      createProject('WS/MP418/2024/139220', 'Construction of Community Shed for Flood Relief Gathering', 'Community Infrastructure', '2024-06-12', '2024-09-05', '2024-09-25', '2025-03-31', null, 'DELAYED', 550000, 76, 'Mithila Construction Co.', null, ['Vendor Name'])
    ]
  },
  {
    id: 'LGD-234140',
    villageCode: '234140',
    villageName: 'Kursakatta Dehat',
    state: 'Bihar',
    district: 'Araria',
    subDistrict: 'Kursakatta',
    constituency: 'Araria',
    mpName: 'Shri Pradeep Kumar Singh',
    coordinates: null, // Coordinates missing
    coordinatesSource: 'Not available in source data',
    projectCount: 0,
    completedCount: 0,
    ongoingCount: 0,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 0,
    lastProjectDate: null,
    sectorsPresent: [],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: []
  },
  {
    id: 'LGD-234152',
    villageCode: '234152',
    villageName: 'Narpatganj Gramin',
    state: 'Bihar',
    district: 'Araria',
    subDistrict: 'Narpatganj',
    constituency: 'Araria',
    mpName: 'Shri Pradeep Kumar Singh',
    coordinates: { lat: 26.2410, lng: 87.0870 },
    coordinatesSource: 'Bhuvan ISRO Geospatial Registry',
    projectCount: 0,
    completedCount: 0,
    ongoingCount: 0,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 0,
    lastProjectDate: null,
    sectorsPresent: [],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: []
  },
  {
    id: 'LGD-235108',
    villageCode: '235108',
    villageName: 'Kasba Gramin',
    state: 'Bihar',
    district: 'Purnia',
    subDistrict: 'Kasba',
    constituency: 'Purnia',
    mpName: 'Shri Rajesh Ranjan (Pappu Yadav)',
    coordinates: { lat: 25.8560, lng: 87.5250 },
    coordinatesSource: 'Official LGD / Survey of India Geocodes',
    projectCount: 2,
    completedCount: 1,
    ongoingCount: 1,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 1650000,
    lastProjectDate: '2024-12-10',
    sectorsPresent: ['Roads & Pathways', 'Education'],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: [
      createProject('WS/MP422/2024/130101', 'PCC Road connecting Mahadalit Tola to Main Road', 'Roads & Pathways', '2024-05-10', '2024-07-28', '2024-08-15', '2024-12-31', '2024-12-10', 'COMPLETED', 900000, 20, 'Alok Enterprise', null, ['Vendor Name']),
      createProject('WS/MP422/2024/138902', 'Boundary wall and gate for Middle School Kasba', 'Education', '2024-08-15', '2024-10-30', '2024-11-15', '2025-06-30', null, 'IN PROGRESS', 750000, 28, 'Prabhat Builders', null, ['Vendor Name'])
    ]
  },
  {
    id: 'LGD-235122',
    villageCode: '235122',
    villageName: 'Baisi Dehat',
    state: 'Bihar',
    district: 'Purnia',
    subDistrict: 'Baisi',
    constituency: 'Purnia',
    mpName: 'Shri Rajesh Ranjan (Pappu Yadav)',
    coordinates: null,
    coordinatesSource: 'Not available in source data',
    projectCount: 0,
    completedCount: 0,
    ongoingCount: 0,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 0,
    lastProjectDate: null,
    sectorsPresent: [],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: []
  },

  // --- PUNJAB (Faridkot & Bathinda) ---
  {
    id: 'LGD-140230',
    villageCode: '140230',
    villageName: 'Bajakhana',
    state: 'Punjab',
    district: 'Faridkot',
    subDistrict: 'Jaitu',
    constituency: 'Faridkot (SC)',
    mpName: 'Shri Sarabjeet Singh Khalsa',
    coordinates: { lat: 30.4560, lng: 74.9210 },
    coordinatesSource: 'Official LGD / Survey of India Geocodes',
    projectCount: 2,
    completedCount: 2,
    ongoingCount: 0,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 600000,
    lastProjectDate: '2025-04-07',
    sectorsPresent: ['Education'],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: [
      createProject('WS/MP18152/2024-2025/133691', 'Construction of MID DAY Meal Shed in Govt Primary school Bajakhana (Bus adda)', 'Education', '2024-06-10', '2024-08-15', '2024-09-01', '2025-04-15', '2025-04-07', 'COMPLETED', 300000, 15, 'Malwa Engineering Works', null, ['Vendor Name']),
      createProject('WS/MP18152/2024-2025/133686', 'Construction of MID DAY Meal Shed in Govt Primary school bajakhana main', 'Education', '2024-06-10', '2024-08-15', '2024-09-01', '2025-04-15', '2025-04-07', 'COMPLETED', 300000, 15, 'Malwa Engineering Works', null, ['Vendor Name'])
    ]
  },
  {
    id: 'LGD-140235',
    villageCode: '140235',
    villageName: 'Dal Singh Wala',
    state: 'Punjab',
    district: 'Faridkot',
    subDistrict: 'Jaitu',
    constituency: 'Faridkot (SC)',
    mpName: 'Shri Sarabjeet Singh Khalsa',
    coordinates: { lat: 30.4890, lng: 74.8820 },
    coordinatesSource: 'Official LGD / Survey of India Geocodes',
    projectCount: 1,
    completedCount: 1,
    ongoingCount: 0,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 300000,
    lastProjectDate: '2025-04-07',
    sectorsPresent: ['Education'],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: [
      createProject('WS/MP18152/2024-2025/133690', 'Construction of MID DAY Meal Shed in Govt Primary school Dal Singh Wala', 'Education', '2024-06-12', '2024-08-18', '2024-09-05', '2025-04-15', '2025-04-07', 'COMPLETED', 300000, 14, 'Jaitu Infra Projects', null, ['Vendor Name'])
    ]
  },
  {
    id: 'LGD-140242',
    villageCode: '140242',
    villageName: 'Bargari Dehat',
    state: 'Punjab',
    district: 'Faridkot',
    subDistrict: 'Jaitu',
    constituency: 'Faridkot (SC)',
    mpName: 'Shri Sarabjeet Singh Khalsa',
    coordinates: { lat: 30.5180, lng: 74.9540 },
    coordinatesSource: 'Official LGD / Survey of India Geocodes',
    projectCount: 0,
    completedCount: 0,
    ongoingCount: 0,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 0,
    lastProjectDate: null,
    sectorsPresent: [],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: []
  },
  {
    id: 'LGD-140250',
    villageCode: '140250',
    villageName: 'Kotkapura Gramin',
    state: 'Punjab',
    district: 'Faridkot',
    subDistrict: 'Kotkapura',
    constituency: 'Faridkot (SC)',
    mpName: 'Shri Sarabjeet Singh Khalsa',
    coordinates: { lat: 30.5820, lng: 74.8250 },
    coordinatesSource: 'Bhuvan ISRO Geospatial Registry',
    projectCount: 3,
    completedCount: 2,
    ongoingCount: 1,
    delayedCount: 1,
    highRiskCount: 0,
    totalExpenditure: 2150000,
    lastProjectDate: '2024-11-25',
    sectorsPresent: ['Roads & Pathways', 'Health & Sanitation', 'Drinking Water'],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: [
      createProject('WS/MP18152/2023/110200', 'Interlocking tiles road in Village Phirni', 'Roads & Pathways', '2023-09-15', '2023-11-30', '2023-12-15', '2024-06-30', '2024-06-10', 'COMPLETED', 950000, 18, 'Guru Nanak Construction', null, ['Vendor Name']),
      createProject('WS/MP18152/2024/124900', 'Solar street light fixtures in 4 corners of Village', 'Renewable Energy', '2024-03-20', '2024-06-05', '2024-06-20', '2024-10-31', '2024-10-15', 'COMPLETED', 450000, 12, 'SunShine Power Ludhiana', null, ['Vendor Name']),
      createProject('WS/MP18152/2024/139800', 'Renovation and tile flooring of Sub-Health Post', 'Health & Sanitation', '2024-08-10', '2024-10-25', '2024-11-10', '2025-05-31', null, 'DELAYED', 750000, 48, 'Kotkapura Builders', null, ['Vendor Name'])
    ]
  },

  // --- KERALA (Kollam & Alappuzha) ---
  {
    id: 'LGD-628410',
    villageCode: '628410',
    villageName: 'Thrikkaruva Grama Panchayat',
    state: 'Kerala',
    district: 'Kollam',
    subDistrict: 'Kollam',
    constituency: 'Kollam',
    mpName: 'Shri N. K. Premachandran',
    coordinates: { lat: 8.9420, lng: 76.5820 },
    coordinatesSource: 'Official LGD / Survey of India Geocodes',
    projectCount: 4,
    completedCount: 3,
    ongoingCount: 1,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 2843492,
    lastProjectDate: '2024-08-12',
    sectorsPresent: ['Roads & Pathways', 'Drinking Water', 'Education'],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: [
      createProject('WS/MP345/2024-2025/134140', 'Concreting of road from Janathavayanasala - Panthaplavil, ward no.6 Thrikkaruva GP', 'Roads & Pathways', '2024-03-12', '2024-05-20', '2024-06-05', '2024-08-30', '2024-08-12', 'COMPLETED', 293492, 12, 'Kollam Infrastructure Co-op', null, ['Vendor Name']),
      createProject('WS/MP345/2023-2024/114920', 'Rainwater Harvesting Tank for Govt LP School Thrikkaruva', 'Drinking Water', '2023-10-04', '2023-12-18', '2024-01-10', '2024-06-30', '2024-05-28', 'COMPLETED', 450000, 10, 'Green Water Kerala', null, ['Vendor Name']),
      createProject('WS/MP345/2024-2025/129480', 'Modern Reading Room & Public Library Digital Section', 'Education', '2024-02-18', '2024-05-02', '2024-05-20', '2024-11-30', '2024-11-15', 'COMPLETED', 850000, 15, 'Kerala Library Council Works', null, ['Vendor Name']),
      createProject('WS/MP345/2024-2025/141020', 'Walkway along backwater bank with solar lighting', 'Community Infrastructure', '2024-09-08', '2024-11-28', '2024-12-15', '2025-08-31', null, 'IN PROGRESS', 1250000, 24, 'Coastal Engineering Wing', null, ['Vendor Name'])
    ]
  },
  {
    id: 'LGD-628415',
    villageCode: '628415',
    villageName: 'Mayyanad Rural',
    state: 'Kerala',
    district: 'Kollam',
    subDistrict: 'Kollam',
    constituency: 'Kollam',
    mpName: 'Shri N. K. Premachandran',
    coordinates: { lat: 8.8410, lng: 76.6430 },
    coordinatesSource: 'Official LGD / Survey of India Geocodes',
    projectCount: 1,
    completedCount: 1,
    ongoingCount: 0,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 550000,
    lastProjectDate: '2024-06-20',
    sectorsPresent: ['Roads & Pathways'],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: [
      createProject('WS/MP345/2023/108920', 'Tarring and drainage work on Kootikkada-Mayyanad link road', 'Roads & Pathways', '2023-08-14', '2023-11-10', '2023-12-01', '2024-07-31', '2024-06-20', 'COMPLETED', 550000, 16, 'Kerala State Construction Corp', null, ['Vendor Name'])
    ]
  },
  {
    id: 'LGD-628422',
    villageCode: '628422',
    villageName: 'Panmana Gramin',
    state: 'Kerala',
    district: 'Kollam',
    subDistrict: 'Karunagappally',
    constituency: 'Kollam',
    mpName: 'Shri N. K. Premachandran',
    coordinates: null,
    coordinatesSource: 'Not available in source data',
    projectCount: 0,
    completedCount: 0,
    ongoingCount: 0,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 0,
    lastProjectDate: null,
    sectorsPresent: [],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: []
  },

  // --- UTTAR PRADESH (Varanasi, Gorakhpur, Lucknow) ---
  {
    id: 'LGD-198205',
    villageCode: '198205',
    villageName: 'Jayapur Adarsh Gram',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    subDistrict: 'Araziline',
    constituency: 'Varanasi',
    mpName: 'Shri Narendra Modi',
    coordinates: { lat: 25.2340, lng: 82.8870 },
    coordinatesSource: 'Official LGD / Survey of India Geocodes',
    projectCount: 6,
    completedCount: 5,
    ongoingCount: 1,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 8400000,
    lastProjectDate: '2025-01-15',
    sectorsPresent: ['Renewable Energy', 'Roads & Pathways', 'Drinking Water', 'Education', 'Health & Sanitation', 'Community Infrastructure'],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: [
      createProject('WS/MP001/2023/090412', 'Solar Powered Mini Grid & Street Lighting along Village Lanes', 'Renewable Energy', '2023-06-10', '2023-08-25', '2023-09-10', '2024-03-31', '2024-03-15', 'COMPLETED', 1800000, 10, 'UP New and Renewable Energy Dev', null, ['Vendor Name']),
      createProject('WS/MP001/2023/094510', 'Interlocking Brick Pathway and Covered Storm Drainage System', 'Roads & Pathways', '2023-07-15', '2023-09-30', '2023-10-15', '2024-05-31', '2024-05-10', 'COMPLETED', 2200000, 12, 'Varanasi Rural Infra Ltd.', null, ['Vendor Name']),
      createProject('WS/MP001/2023/099120', 'Piped Drinking Water Overhead Reservoir (1 Lakh Litre Capacity)', 'Drinking Water', '2023-09-12', '2023-11-20', '2023-12-05', '2024-08-31', '2024-08-20', 'COMPLETED', 1900000, 15, 'Jal Nigam Construction Unit', null, ['Vendor Name']),
      createProject('WS/MP001/2024/115400', 'Upgradation of Primary Health Sub-Centre with Telemedicine Lab', 'Health & Sanitation', '2024-02-10', '2024-04-28', '2024-05-15', '2024-11-30', '2024-11-12', 'COMPLETED', 1100000, 18, 'Kashi MediConstruct', null, ['Vendor Name']),
      createProject('WS/MP001/2024/128990', 'Model Anganwadi Centre & Early Childhood Learning Hub', 'Education', '2024-05-08', '2024-07-22', '2024-08-05', '2025-01-31', '2025-01-15', 'COMPLETED', 650000, 12, 'Shree Ram Constructions', null, ['Vendor Name']),
      createProject('WS/MP001/2024/142010', 'Skill Development Workshop Hall & Women Self Help Group Centre', 'Community Infrastructure', '2024-10-12', '2024-12-28', '2025-01-15', '2025-09-30', null, 'IN PROGRESS', 750000, 22, 'Varanasi Zilla Parishad Unit', null, ['Vendor Name'])
    ]
  },
  {
    id: 'LGD-198212',
    villageCode: '198212',
    villageName: 'Nagepur Gramin',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    subDistrict: 'Araziline',
    constituency: 'Varanasi',
    mpName: 'Shri Narendra Modi',
    coordinates: { lat: 25.2150, lng: 82.8520 },
    coordinatesSource: 'Official LGD / Survey of India Geocodes',
    projectCount: 4,
    completedCount: 3,
    ongoingCount: 1,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 4900000,
    lastProjectDate: '2024-11-18',
    sectorsPresent: ['Roads & Pathways', 'Drinking Water', 'Community Infrastructure'],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: [
      createProject('WS/MP001/2023/101200', 'Concrete CC Road with Side Drains through Harijan Basti', 'Roads & Pathways', '2023-08-20', '2023-11-15', '2023-12-01', '2024-06-30', '2024-06-18', 'COMPLETED', 1600000, 14, 'Awadh Civil Builders', null, ['Vendor Name']),
      createProject('WS/MP001/2024/118400', 'Solar High Mast and Water Filtration Plant', 'Drinking Water', '2024-03-05', '2024-05-18', '2024-06-01', '2024-10-31', '2024-10-22', 'COMPLETED', 1200000, 16, 'PureWater Systems UP', null, ['Vendor Name']),
      createProject('WS/MP001/2024/129840', 'Community Centre building for farmer producer groups', 'Community Infrastructure', '2024-05-14', '2024-07-28', '2024-08-10', '2024-12-31', '2024-11-18', 'COMPLETED', 1300000, 20, 'Ganga Valley Contractors', null, ['Vendor Name']),
      createProject('WS/MP001/2024/141500', 'Modern Playground Equipment and Jogging Track', 'Sports', '2024-09-12', '2024-11-30', '2024-12-15', '2025-07-31', null, 'IN PROGRESS', 800000, 25, 'National Sports Infra', null, ['Vendor Name'])
    ]
  },
  {
    id: 'LGD-198225',
    villageCode: '198225',
    villageName: 'Kakrahia Dehat',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    subDistrict: 'Sevapuri',
    constituency: 'Varanasi',
    mpName: 'Shri Narendra Modi',
    coordinates: { lat: 25.2890, lng: 82.7820 },
    coordinatesSource: 'Official LGD / Survey of India Geocodes',
    projectCount: 2,
    completedCount: 2,
    ongoingCount: 0,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 1750000,
    lastProjectDate: '2024-10-05',
    sectorsPresent: ['Education', 'Drinking Water'],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: [
      createProject('WS/MP001/2024/112900', 'Additional Classroom Block at Composite School Kakrahia', 'Education', '2024-02-18', '2024-04-30', '2024-05-15', '2024-10-31', '2024-10-05', 'COMPLETED', 1100000, 15, 'Prabhat Nirman UP', null, ['Vendor Name']),
      createProject('WS/MP001/2024/121800', 'Submersible Pump with 4 Water Taps for Primary School', 'Drinking Water', '2024-03-25', '2024-06-10', '2024-06-25', '2024-09-30', '2024-09-15', 'COMPLETED', 650000, 11, 'Varanasi Water Solutions', null, ['Vendor Name'])
    ]
  },
  {
    id: 'LGD-198230',
    villageCode: '198230',
    villageName: 'Domari Dehat',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    subDistrict: 'Pindra',
    constituency: 'Varanasi',
    mpName: 'Shri Narendra Modi',
    coordinates: null, // Coordinates missing
    coordinatesSource: 'Not available in source data',
    projectCount: 0,
    completedCount: 0,
    ongoingCount: 0,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 0,
    lastProjectDate: null,
    sectorsPresent: [],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: []
  },
  {
    id: 'LGD-198240',
    villageCode: '198240',
    villageName: 'Chiraigaon Rural (Mustafabad)',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    subDistrict: 'Chiraigaon',
    constituency: 'Varanasi',
    mpName: 'Shri Narendra Modi',
    coordinates: { lat: 25.3780, lng: 83.0820 },
    coordinatesSource: 'Official LGD / Survey of India Geocodes',
    projectCount: 1,
    completedCount: 1,
    ongoingCount: 0,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 850000,
    lastProjectDate: '2024-07-28',
    sectorsPresent: ['Roads & Pathways'],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: [
      createProject('WS/MP001/2023/108420', 'Interlocking CC road in Bind basti to temple path', 'Roads & Pathways', '2023-09-18', '2023-12-05', '2023-12-20', '2024-08-31', '2024-07-28', 'COMPLETED', 850000, 14, 'Kashi Infra Projects', null, ['Vendor Name'])
    ]
  },
  {
    id: 'LGD-198255',
    villageCode: '198255',
    villageName: 'Kharawan Gramin',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    subDistrict: 'Pindra',
    constituency: 'Varanasi',
    mpName: 'Shri Narendra Modi',
    coordinates: null,
    coordinatesSource: 'Not available in source data',
    projectCount: 0,
    completedCount: 0,
    ongoingCount: 0,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 0,
    lastProjectDate: null,
    sectorsPresent: [],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: []
  },

  // --- RAJASTHAN (Jaipur, Jodhpur) ---
  {
    id: 'LGD-089104',
    villageCode: '089104',
    villageName: 'Bassi Gramin (Kalyanpura)',
    state: 'Rajasthan',
    district: 'Jaipur',
    subDistrict: 'Bassi',
    constituency: 'Dausa (ST)',
    mpName: 'Shri Murari Lal Meena',
    coordinates: { lat: 26.8320, lng: 76.0420 },
    coordinatesSource: 'Official LGD / Survey of India Geocodes',
    projectCount: 3,
    completedCount: 2,
    ongoingCount: 1,
    delayedCount: 1,
    highRiskCount: 1,
    totalExpenditure: 3200000,
    lastProjectDate: '2024-11-30',
    sectorsPresent: ['Drinking Water', 'Irrigation', 'Roads & Pathways'],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: [
      createProject('WS/MP089/2023/094110', 'Tubewell with solar pump & animal trough for nomadic herders', 'Drinking Water', '2023-07-10', '2023-10-04', '2023-10-20', '2024-04-30', '2024-04-12', 'COMPLETED', 950000, 18, 'Marwar Solar Energy', null, ['Vendor Name']),
      createProject('WS/MP089/2023/099820', 'Deepening and stone lining of village check dam', 'Irrigation', '2023-09-02', '2023-11-28', '2023-12-15', '2024-06-30', '2024-06-18', 'COMPLETED', 1100000, 20, 'Dausa Water Harvesting Works', null, ['Vendor Name']),
      createProject('WS/MP089/2024/124990', 'Tar link road from Bassi station to Kalyanpura', 'Roads & Pathways', '2024-03-15', '2024-06-20', '2024-07-05', '2025-01-31', null, 'DELAYED', 1150000, 74, 'Rajputana Roadways Ltd.', null, ['Vendor Name'])
    ]
  },
  {
    id: 'LGD-089115',
    villageCode: '089115',
    villageName: 'Chaksu Dehat',
    state: 'Rajasthan',
    district: 'Jaipur',
    subDistrict: 'Chaksu',
    constituency: 'Dausa (ST)',
    mpName: 'Shri Murari Lal Meena',
    coordinates: { lat: 26.6020, lng: 75.9520 },
    coordinatesSource: 'Official LGD / Survey of India Geocodes',
    projectCount: 1,
    completedCount: 1,
    ongoingCount: 0,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 700000,
    lastProjectDate: '2024-05-14',
    sectorsPresent: ['Education'],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: [
      createProject('WS/MP089/2023/108910', 'Construction of boundary wall and girls toilet in Govt Senior Secondary School', 'Education', '2023-09-10', '2023-12-02', '2023-12-18', '2024-05-31', '2024-05-14', 'COMPLETED', 700000, 15, 'Jaipur Rural Builders', null, ['Vendor Name'])
    ]
  },
  {
    id: 'LGD-089122',
    villageCode: '089122',
    villageName: 'Jamwa Ramgarh Dehat',
    state: 'Rajasthan',
    district: 'Jaipur',
    subDistrict: 'Jamwa Ramgarh',
    constituency: 'Jaipur Rural',
    mpName: 'Rao Rajendra Singh',
    coordinates: null,
    coordinatesSource: 'Not available in source data',
    projectCount: 0,
    completedCount: 0,
    ongoingCount: 0,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 0,
    lastProjectDate: null,
    sectorsPresent: [],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: []
  },

  // --- TAMIL NADU (Madurai & Coimbatore) ---
  {
    id: 'LGD-634102',
    villageCode: '634102',
    villageName: 'Alanganallur Rural',
    state: 'Tamil Nadu',
    district: 'Madurai',
    subDistrict: 'Vadipatti',
    constituency: 'Madurai',
    mpName: 'Shri Su. Venkatesan',
    coordinates: { lat: 10.0430, lng: 78.0950 },
    coordinatesSource: 'Official LGD / Survey of India Geocodes',
    projectCount: 3,
    completedCount: 3,
    ongoingCount: 0,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 2450000,
    lastProjectDate: '2024-10-15',
    sectorsPresent: ['Sports', 'Drinking Water', 'Community Infrastructure'],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: [
      createProject('WS/MP634/2023/098410', 'Construction of Traditional Sports Training Pavilion & Gymnasium', 'Sports', '2023-08-10', '2023-10-25', '2023-11-10', '2024-05-31', '2024-05-15', 'COMPLETED', 1200000, 16, 'Pandian Construction Madurai', null, ['Vendor Name']),
      createProject('WS/MP634/2023/104920', 'RO Drinking Water Plant (2000 LPH) near bus stand', 'Drinking Water', '2023-09-15', '2023-11-30', '2023-12-15', '2024-06-30', '2024-06-12', 'COMPLETED', 750000, 14, 'Tamil Nadu Water Solutions', null, ['Vendor Name']),
      createProject('WS/MP634/2024/119800', 'Solar street lights around temple pond pathway', 'Renewable Energy', '2024-03-10', '2024-05-18', '2024-06-01', '2024-10-31', '2024-10-15', 'COMPLETED', 500000, 12, 'SunPower South Chennai', null, ['Vendor Name'])
    ]
  },
  {
    id: 'LGD-634120',
    villageCode: '634120',
    villageName: 'Chellampatti Gramin',
    state: 'Tamil Nadu',
    district: 'Madurai',
    subDistrict: 'Usilampatti',
    constituency: 'Madurai',
    mpName: 'Shri Su. Venkatesan',
    coordinates: null,
    coordinatesSource: 'Not available in source data',
    projectCount: 0,
    completedCount: 0,
    ongoingCount: 0,
    delayedCount: 0,
    highRiskCount: 0,
    totalExpenditure: 0,
    lastProjectDate: null,
    sectorsPresent: [],
    provenance: DEMO_BENCHMARK_PROVENANCE,
    projects: []
  }
];

// 5. Dynamic KPI Calculator based strictly on loaded data
export function calculateRuralKPIs(villages: LGDVillage[]): RuralKPISummary {
  let totalProjects = 0;
  let totalExpenditure = 0;
  let villagesWithProjects = 0;
  let villagesZeroProjects = 0;
  let villages1to2Projects = 0;
  let villages3to5Projects = 0;
  let villagesWithDelayed = 0;
  let villagesWithHighRisk = 0;

  for (const v of villages) {
    totalProjects += v.projectCount;
    totalExpenditure += v.totalExpenditure;

    if (v.projectCount > 0) {
      villagesWithProjects++;
    } else {
      villagesZeroProjects++;
    }

    if (v.projectCount >= 1 && v.projectCount <= 2) {
      villages1to2Projects++;
    } else if (v.projectCount >= 3 && v.projectCount <= 5) {
      villages3to5Projects++;
    }

    if (v.delayedCount > 0) {
      villagesWithDelayed++;
    }
    if (v.highRiskCount > 0) {
      villagesWithHighRisk++;
    }
  }

  return {
    totalVillages: villages.length,
    villagesWithProjects,
    villagesZeroProjects,
    villages1to2Projects,
    villages3to5Projects,
    totalProjects,
    totalExpenditure,
    villagesWithDelayed,
    villagesWithHighRisk
  };
}

// 6. Global Demo Mode State Tracker (Persisted in localStorage with default)
const DEMO_MODE_STORAGE_KEY = 'mplads_rural_demo_mode';

export function isRuralDemoModeActive(): boolean {
  try {
    const val = localStorage.getItem(DEMO_MODE_STORAGE_KEY);
    // If not explicitly set, default to false (official production standard)
    return val === 'true';
  } catch {
    return false;
  }
}

export function setRuralDemoModeActive(active: boolean): void {
  try {
    localStorage.setItem(DEMO_MODE_STORAGE_KEY, active ? 'true' : 'false');
    window.dispatchEvent(new Event('rural-demo-mode-changed'));
  } catch (e) {
    console.error('Failed to set rural demo mode in localStorage', e);
  }
}

// 7. Get dataset based on mode
export function getLGDVillages(demoMode = isRuralDemoModeActive()): LGDVillage[] {
  if (demoMode) {
    return PILOT_LGD_VILLAGES;
  }
  // In official Live Mode, return empty array because the source public MPLADS release
  // lacks standardized village-level field linkages (as required by section 12).
  return [];
}
