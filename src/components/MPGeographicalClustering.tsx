import React, { useState, useMemo } from 'react';
import { ALL_MPS_DATA, MPDetail } from '../data/mpsData';
import { 
  MapPin, 
  Layers, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  FileText, 
  TrendingUp, 
  IndianRupee, 
  Building2, 
  Compass, 
  Eye, 
  Filter, 
  ArrowUpRight, 
  Radio,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export type WorkClusterStatus = 
  | 'ALL'
  | 'MORE_WORK_DONE'
  | 'IN_PROGRESS'
  | 'LESS_WORK_DONE'
  | 'NOT_STARTED'
  | 'NOT_COMPLETED'
  | 'NO_WORK_DONE'
  | 'TO_BE_LISTED';

export interface ClusterNode {
  id: string;
  name: string;
  panchayatOrWard: string;
  district: string;
  state: string;
  mpId: string;
  mpName: string;
  x: number; // SVG coordinates 0-500
  y: number; // SVG coordinates 0-500
  lat: number;
  lng: number;
  status: WorkClusterStatus;
  totalWorks: number;
  completedWorks: number;
  inProgressWorks: number;
  pendingWorks: number;
  totalCostLakhs: number;
  disbursedCostLakhs: number;
  saturationScore: number;
  sector: string;
  primaryWork: string;
  contractor: string;
  idaName: string;
}

// Rich dataset of geographical work clusters across constituencies for MP fund tracking
const MOCK_CLUSTERS: ClusterNode[] = [
  // Varanasi / Purvanchal Clusters (UP)
  {
    id: 'CL-01',
    name: 'Rohania Rural Infrastructure Hub',
    panchayatOrWard: 'Rohania Gram Panchayat',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    mpId: 'ls-18',
    mpName: 'NARENDRA MODI',
    x: 295,
    y: 195,
    lat: 25.3176,
    lng: 82.9739,
    status: 'MORE_WORK_DONE',
    totalWorks: 18,
    completedWorks: 16,
    inProgressWorks: 2,
    pendingWorks: 0,
    totalCostLakhs: 245.5,
    disbursedCostLakhs: 232.0,
    saturationScore: 94.5,
    sector: 'Drinking Water & Solar',
    primaryWork: 'High-yield Solar Deep Tube-wells & Overhead Tank Network',
    contractor: 'Kashi Urja Nirman Ltd',
    idaName: 'Varanasi District Collectorate'
  },
  {
    id: 'CL-02',
    name: 'Sevapuri Smart Health & Education Zone',
    panchayatOrWard: 'Sevapuri Block Sector 3',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    mpId: 'ls-18',
    mpName: 'NARENDRA MODI',
    x: 288,
    y: 192,
    lat: 25.3340,
    lng: 82.8120,
    status: 'IN_PROGRESS',
    totalWorks: 14,
    completedWorks: 8,
    inProgressWorks: 5,
    pendingWorks: 1,
    totalCostLakhs: 180.0,
    disbursedCostLakhs: 115.0,
    saturationScore: 63.8,
    sector: 'Public Health',
    primaryWork: 'Modern Community Health Sub-centre & Diagnostic Lab',
    contractor: 'Purvanchal MedTech Infra',
    idaName: 'Chief Medical Officer Varanasi'
  },
  {
    id: 'CL-03',
    name: 'Pindra Northern Peripheral Drainage',
    panchayatOrWard: 'Pindra Village Council',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    mpId: 'ls-18',
    mpName: 'NARENDRA MODI',
    x: 302,
    y: 188,
    lat: 25.4800,
    lng: 82.8800,
    status: 'LESS_WORK_DONE',
    totalWorks: 9,
    completedWorks: 3,
    inProgressWorks: 2,
    pendingWorks: 4,
    totalCostLakhs: 120.0,
    disbursedCostLakhs: 42.0,
    saturationScore: 35.0,
    sector: 'Sanitation & Drainage',
    primaryWork: 'Covered RCC Stormwater Drain & Sewerage Alignment',
    contractor: 'Ganga Basin Civil Works',
    idaName: 'Varanasi Rural Development Agency'
  },
  {
    id: 'CL-04',
    name: 'Chiraigaon Flood-Prone Embankment',
    panchayatOrWard: 'Chiraigaon Habitation',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    mpId: 'ls-18',
    mpName: 'NARENDRA MODI',
    x: 306,
    y: 198,
    lat: 25.3900,
    lng: 83.0800,
    status: 'NOT_COMPLETED',
    totalWorks: 6,
    completedWorks: 1,
    inProgressWorks: 1,
    pendingWorks: 4,
    totalCostLakhs: 95.0,
    disbursedCostLakhs: 78.0,
    saturationScore: 18.0,
    sector: 'Flood Protection',
    primaryWork: 'Stone Pitching Embankment & Culvert Reconstruction (Overdue 180d)',
    contractor: 'Apex Riverine Builders',
    idaName: 'Irrigation & Water Resources Dept'
  },
  {
    id: 'CL-05',
    name: 'Kashi South High-Density Corridor',
    panchayatOrWard: 'Assi Ghat Ward 44',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    mpId: 'ls-18',
    mpName: 'NARENDRA MODI',
    x: 298,
    y: 202,
    lat: 25.2890,
    lng: 83.0060,
    status: 'MORE_WORK_DONE',
    totalWorks: 22,
    completedWorks: 20,
    inProgressWorks: 2,
    pendingWorks: 0,
    totalCostLakhs: 310.0,
    disbursedCostLakhs: 295.0,
    saturationScore: 95.1,
    sector: 'Heritage & Lighting',
    primaryWork: 'Smart LED Heritage Pathway & Public Wi-Fi Kiosks',
    contractor: 'Smart Kashi Infrastructure',
    idaName: 'Varanasi Nagar Nigam'
  },
  {
    id: 'CL-06',
    name: 'Babarpur Unconnected Hamlet',
    panchayatOrWard: 'Babarpur SC/ST Basti',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    mpId: 'ls-18',
    mpName: 'NARENDRA MODI',
    x: 285,
    y: 200,
    lat: 25.2600,
    lng: 82.8500,
    status: 'NO_WORK_DONE',
    totalWorks: 0,
    completedWorks: 0,
    inProgressWorks: 0,
    pendingWorks: 0,
    totalCostLakhs: 0,
    disbursedCostLakhs: 0,
    saturationScore: 0.0,
    sector: 'Zero Utilization Gap',
    primaryWork: 'Identified Under-served Hamlet — Zero MPLADS Allocation Sanctioned',
    contractor: 'Unallocated',
    idaName: 'Awaiting MP Recommendation'
  },
  {
    id: 'CL-07',
    name: 'Arajiline Clean Drinking Water Cluster',
    panchayatOrWard: 'Arajiline Panchayat',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    mpId: 'ls-18',
    mpName: 'NARENDRA MODI',
    x: 290,
    y: 205,
    lat: 25.2200,
    lng: 82.9000,
    status: 'TO_BE_LISTED',
    totalWorks: 5,
    completedWorks: 0,
    inProgressWorks: 0,
    pendingWorks: 5,
    totalCostLakhs: 65.0,
    disbursedCostLakhs: 0,
    saturationScore: 0.0,
    sector: 'Drinking Water Pipeline',
    primaryWork: 'Proposed Jal Jeevan feeder pipeline awaiting District Sanction',
    contractor: 'Tender in Preparation',
    idaName: 'District Planning Cell'
  },

  // Kannauj & Central UP Clusters
  {
    id: 'CL-08',
    name: 'Chhibramau Rural Agri Cold Storage Hub',
    panchayatOrWard: 'Chhibramau Mandi Parishad',
    district: 'Kannauj',
    state: 'Uttar Pradesh',
    mpId: 'ls-19',
    mpName: 'AKHILESH YADAV',
    x: 245,
    y: 185,
    lat: 27.1500,
    lng: 79.5000,
    status: 'MORE_WORK_DONE',
    totalWorks: 15,
    completedWorks: 13,
    inProgressWorks: 2,
    pendingWorks: 0,
    totalCostLakhs: 195.0,
    disbursedCostLakhs: 185.0,
    saturationScore: 89.0,
    sector: 'Agriculture & Storage',
    primaryWork: 'Perishable Produce Cold Storage & Solar Roof Shed',
    contractor: 'Awadh Kisan Nirman',
    idaName: 'Kannauj District Development Office'
  },
  {
    id: 'CL-09',
    name: 'Tirwa Girls Intermediate College Science Lab',
    panchayatOrWard: 'Tirwa Ward 2',
    district: 'Kannauj',
    state: 'Uttar Pradesh',
    mpId: 'ls-19',
    mpName: 'AKHILESH YADAV',
    x: 250,
    y: 190,
    lat: 27.0700,
    lng: 79.6200,
    status: 'IN_PROGRESS',
    totalWorks: 8,
    completedWorks: 4,
    inProgressWorks: 4,
    pendingWorks: 0,
    totalCostLakhs: 90.0,
    disbursedCostLakhs: 55.0,
    saturationScore: 61.1,
    sector: 'Education',
    primaryWork: 'STEM Science Laboratories & Computer Wing',
    contractor: 'EduBuild Systems',
    idaName: 'District Inspector of Schools Kannauj'
  },
  {
    id: 'CL-10',
    name: 'Gursahaiganj Road Connectivity Link',
    panchayatOrWard: 'Gursahaiganj Industrial Pocket',
    district: 'Kannauj',
    state: 'Uttar Pradesh',
    mpId: 'ls-19',
    mpName: 'AKHILESH YADAV',
    x: 252,
    y: 182,
    lat: 27.1200,
    lng: 79.7200,
    status: 'NOT_STARTED',
    totalWorks: 6,
    completedWorks: 0,
    inProgressWorks: 1,
    pendingWorks: 5,
    totalCostLakhs: 110.0,
    disbursedCostLakhs: 10.0,
    saturationScore: 9.0,
    sector: 'Roads & Bridges',
    primaryWork: 'All-Weather Bituminous Link Road (Awaiting Forest Clearance)',
    contractor: 'Tender Pending Approval',
    idaName: 'PWD Division Kannauj'
  },

  // Maharashtra - Mumbai & Western Ghats Clusters
  {
    id: 'CL-11',
    name: 'Goregaon Slum Sanitation & Community Hall',
    panchayatOrWard: 'Ward 52 Bhagat Singh Nagar',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    mpId: 'ls-1',
    mpName: 'AASHTIKAR PATIL NAGESH BAPURAO',
    x: 165,
    y: 310,
    lat: 19.1663,
    lng: 72.8526,
    status: 'MORE_WORK_DONE',
    totalWorks: 24,
    completedWorks: 22,
    inProgressWorks: 2,
    pendingWorks: 0,
    totalCostLakhs: 380.0,
    disbursedCostLakhs: 360.0,
    saturationScore: 92.5,
    sector: 'Sanitation',
    primaryWork: 'Multi-seater Community Toilet Block with Solar Power & Sewage Link',
    contractor: 'Maha Clean Infra Ltd',
    idaName: 'Brihanmumbai Municipal Corporation (BMC)'
  },
  {
    id: 'CL-12',
    name: 'Andheri East Skill Development Center',
    panchayatOrWard: 'MIDC Cross Road Ward 73',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    mpId: 'ls-1',
    mpName: 'AASHTIKAR PATIL NAGESH BAPURAO',
    x: 170,
    y: 315,
    lat: 19.1136,
    lng: 72.8697,
    status: 'IN_PROGRESS',
    totalWorks: 11,
    completedWorks: 6,
    inProgressWorks: 4,
    pendingWorks: 1,
    totalCostLakhs: 145.0,
    disbursedCostLakhs: 90.0,
    saturationScore: 62.0,
    sector: 'Skill Development',
    primaryWork: 'Vocational Training Workshop & IT Center for Youth',
    contractor: 'Pratham Skill Infra',
    idaName: 'District Planning Committee Mumbai'
  },
  {
    id: 'CL-13',
    name: 'Kurla West Drainage Reconstruction',
    panchayatOrWard: 'Bail Bazar Ward 88',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    mpId: 'ls-1',
    mpName: 'AASHTIKAR PATIL NAGESH BAPURAO',
    x: 168,
    y: 320,
    lat: 19.0728,
    lng: 72.8790,
    status: 'NOT_COMPLETED',
    totalWorks: 7,
    completedWorks: 2,
    inProgressWorks: 2,
    pendingWorks: 3,
    totalCostLakhs: 115.0,
    disbursedCostLakhs: 92.0,
    saturationScore: 28.5,
    sector: 'Stormwater Drainage',
    primaryWork: 'Micro-tunneling Culvert (Encroachment Delay + 120 days)',
    contractor: 'Western Metro Infra',
    idaName: 'BMC Stormwater Dept'
  },

  // Rajasthan - Jodhpur / Marwar Clusters
  {
    id: 'CL-14',
    name: 'Osian Desert Solar Water Filtration Cluster',
    panchayatOrWard: 'Osian Gram Panchayat',
    district: 'Jodhpur',
    state: 'Rajasthan',
    mpId: 'ls-14',
    mpName: 'AJAY BHATT',
    x: 135,
    y: 205,
    lat: 26.7200,
    lng: 72.9000,
    status: 'MORE_WORK_DONE',
    totalWorks: 16,
    completedWorks: 15,
    inProgressWorks: 1,
    pendingWorks: 0,
    totalCostLakhs: 210.0,
    disbursedCostLakhs: 198.0,
    saturationScore: 94.0,
    sector: 'Drinking Water & RO Plants',
    primaryWork: 'Solar-powered Brackish RO Desalination Water ATMs',
    contractor: 'Marwar Jal Suraksha',
    idaName: 'District Collector Jodhpur'
  },
  {
    id: 'CL-15',
    name: 'Bilara Rural Veterinary Dispensary',
    panchayatOrWard: 'Bilara Block',
    district: 'Jodhpur',
    state: 'Rajasthan',
    mpId: 'ls-14',
    mpName: 'AJAY BHATT',
    x: 142,
    y: 212,
    lat: 26.1800,
    lng: 73.7000,
    status: 'IN_PROGRESS',
    totalWorks: 6,
    completedWorks: 3,
    inProgressWorks: 3,
    pendingWorks: 0,
    totalCostLakhs: 75.0,
    disbursedCostLakhs: 45.0,
    saturationScore: 60.0,
    sector: 'Animal Husbandry',
    primaryWork: 'Equipped Mobile Veterinary Clinic & Artificial Insemination Shed',
    contractor: 'Thar Builders Ltd',
    idaName: 'Animal Husbandry Dept Jodhpur'
  },
  {
    id: 'CL-16',
    name: 'Luni Arid Desert Remote Hamlet',
    panchayatOrWard: 'Dhundhara Girafe Basti',
    district: 'Jodhpur',
    state: 'Rajasthan',
    mpId: 'ls-14',
    mpName: 'AJAY BHATT',
    x: 128,
    y: 218,
    lat: 25.9500,
    lng: 72.7500,
    status: 'NO_WORK_DONE',
    totalWorks: 0,
    completedWorks: 0,
    inProgressWorks: 0,
    pendingWorks: 0,
    totalCostLakhs: 0,
    disbursedCostLakhs: 0,
    saturationScore: 0.0,
    sector: 'Zero Utilization Gap',
    primaryWork: 'Identified Remote Pastoral Settlement — Zero MPLADS Works',
    contractor: 'Unallocated',
    idaName: 'Awaiting MP Recommendation'
  },

  // Bihar - Gopalganj & Bhagalpur Clusters
  {
    id: 'CL-17',
    name: 'Gopalganj Flood Shelter & Elevated Road',
    panchayatOrWard: 'Barauli Diara Belt',
    district: 'Gopalganj',
    state: 'Bihar',
    mpId: 'ls-21',
    mpName: 'ALOK KUMAR SUMAN',
    x: 335,
    y: 190,
    lat: 26.3900,
    lng: 84.5800,
    status: 'MORE_WORK_DONE',
    totalWorks: 19,
    completedWorks: 17,
    inProgressWorks: 2,
    pendingWorks: 0,
    totalCostLakhs: 260.0,
    disbursedCostLakhs: 245.0,
    saturationScore: 91.5,
    sector: 'Disaster Management',
    primaryWork: 'Multi-purpose Cyclone & Flood Resilient Community Shelter',
    contractor: 'Mithila Infrastructure',
    idaName: 'District Magistrate Gopalganj'
  },
  {
    id: 'CL-18',
    name: 'Baikunthpur Rural Electrification & Solar Lights',
    panchayatOrWard: 'Baikunthpur Ward 6',
    district: 'Gopalganj',
    state: 'Bihar',
    mpId: 'ls-21',
    mpName: 'ALOK KUMAR SUMAN',
    x: 340,
    y: 195,
    lat: 26.3200,
    lng: 84.7200,
    status: 'NOT_STARTED',
    totalWorks: 8,
    completedWorks: 0,
    inProgressWorks: 2,
    pendingWorks: 6,
    totalCostLakhs: 85.0,
    disbursedCostLakhs: 8.5,
    saturationScore: 10.0,
    sector: 'Solar Energy',
    primaryWork: 'Integrated Solar High-Mast Lights for Village Squares',
    contractor: 'Tender under Technical Evaluation',
    idaName: 'BREDA Bihar'
  },

  // Tamil Nadu & South Clusters
  {
    id: 'CL-19',
    name: 'Attingal Coastal Fishery Cold Hub',
    panchayatOrWard: 'Chirayinkeezhu Coastal Zone',
    district: 'Thiruvananthapuram',
    state: 'Kerala',
    mpId: 'ls-8',
    mpName: 'ADV ADOOR PRAKASH',
    x: 185,
    y: 450,
    lat: 8.6950,
    lng: 76.8150,
    status: 'MORE_WORK_DONE',
    totalWorks: 21,
    completedWorks: 19,
    inProgressWorks: 2,
    pendingWorks: 0,
    totalCostLakhs: 290.0,
    disbursedCostLakhs: 275.0,
    saturationScore: 93.8,
    sector: 'Fisheries & Marine',
    primaryWork: 'Solar-Assisted Cold Storage for Traditional Fisherfolk',
    contractor: 'Coastal Urja Infra',
    idaName: 'District Collector Thiruvananthapuram'
  },
  {
    id: 'CL-20',
    name: 'Nandurbar Tribal Eklavya Educational Cluster',
    panchayatOrWard: 'Dhadgaon Tribal Block',
    district: 'Nandurbar',
    state: 'Maharashtra',
    mpId: 'ls-10',
    mpName: 'ADV GOWAAL KAGADA PADAVI',
    x: 175,
    y: 270,
    lat: 21.6500,
    lng: 74.3200,
    status: 'IN_PROGRESS',
    totalWorks: 17,
    completedWorks: 11,
    inProgressWorks: 5,
    pendingWorks: 1,
    totalCostLakhs: 230.0,
    disbursedCostLakhs: 160.0,
    saturationScore: 69.5,
    sector: 'Tribal Education',
    primaryWork: 'Smart Digital Classrooms & Residential Hostel Block',
    contractor: 'Satpuda Nirman Co.',
    idaName: 'Integrated Tribal Development Project'
  }
];

export const MPGeographicalClustering: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<WorkClusterStatus>('ALL');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedMP, setSelectedMP] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCluster, setActiveCluster] = useState<ClusterNode | null>(MOCK_CLUSTERS[0]);
  const [viewLayer, setViewLayer] = useState<'hybrid' | 'satellite' | 'heatmap'>('hybrid');

  // Status Meta Information & Badges
  const STATUS_CONFIG: Record<WorkClusterStatus, { label: string; color: string; bg: string; border: string; desc: string; icon: any }> = {
    ALL: {
      label: 'All Clusters',
      color: 'text-slate-800',
      bg: 'bg-slate-100',
      border: 'border-slate-300',
      desc: 'Complete portfolio of geographic clusters',
      icon: Layers
    },
    MORE_WORK_DONE: {
      label: 'More Work Done',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-300',
      desc: 'High Progress Density (>75% completed)',
      icon: CheckCircle2
    },
    IN_PROGRESS: {
      label: 'In Progress',
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      desc: 'Active site construction (50%-75%)',
      icon: TrendingUp
    },
    LESS_WORK_DONE: {
      label: 'Less Work Done',
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      desc: 'Lagging clusters (25%-50% progress)',
      icon: Clock
    },
    NOT_STARTED: {
      label: 'Not Started',
      color: 'text-orange-700',
      bg: 'bg-orange-50',
      border: 'border-orange-300',
      desc: 'Sanctioned but tender pending (0%-25%)',
      icon: FileText
    },
    NOT_COMPLETED: {
      label: 'Not Completed',
      color: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-300',
      desc: 'Delayed / Crossed SLA timeline',
      icon: AlertTriangle
    },
    NO_WORK_DONE: {
      label: 'No Work Done',
      color: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-300',
      desc: 'Zero Utilization Gap in Habitation',
      icon: XCircle
    },
    TO_BE_LISTED: {
      label: 'To Be Listed',
      color: 'text-purple-700',
      bg: 'bg-purple-50',
      border: 'border-purple-300',
      desc: 'Proposed pipeline awaiting sanction',
      icon: Sparkles
    }
  };

  // Extract unique MP names for filter
  const mpOptions = useMemo(() => {
    const list = Array.from(new Set(MOCK_CLUSTERS.map(c => c.mpName))).sort();
    return list;
  }, []);

  // Filtered clusters
  const filteredClusters = useMemo(() => {
    return MOCK_CLUSTERS.filter(cluster => {
      const matchStatus = selectedStatus === 'ALL' || cluster.status === selectedStatus;
      const matchState = selectedState === 'All' || cluster.state === selectedState;
      const matchMP = selectedMP === 'All' || cluster.mpName === selectedMP;
      const matchSearch = 
        cluster.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cluster.panchayatOrWard.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cluster.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cluster.mpName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cluster.sector.toLowerCase().includes(searchQuery.toLowerCase());

      return matchStatus && matchState && matchMP && matchSearch;
    });
  }, [selectedStatus, selectedState, selectedMP, searchQuery]);

  // Aggregate Metrics for Current Filter
  const stats = useMemo(() => {
    const totalWorks = filteredClusters.reduce((sum, c) => sum + c.totalWorks, 0);
    const completedWorks = filteredClusters.reduce((sum, c) => sum + c.completedWorks, 0);
    const totalDisbursed = filteredClusters.reduce((sum, c) => sum + c.disbursedCostLakhs, 0);
    const totalCost = filteredClusters.reduce((sum, c) => sum + c.totalCostLakhs, 0);
    const avgSaturation = filteredClusters.length > 0 
      ? (filteredClusters.reduce((sum, c) => sum + c.saturationScore, 0) / filteredClusters.length).toFixed(1)
      : '0.0';

    return {
      clusterCount: filteredClusters.length,
      totalWorks,
      completedWorks,
      totalDisbursedCr: (totalDisbursed / 100).toFixed(2),
      totalCostCr: (totalCost / 100).toFixed(2),
      avgSaturation
    };
  }, [filteredClusters]);

  // Cluster Node Color Helper
  const getClusterColor = (status: WorkClusterStatus) => {
    switch (status) {
      case 'MORE_WORK_DONE': return '#10b981'; // Emerald
      case 'IN_PROGRESS': return '#3b82f6';    // Blue
      case 'LESS_WORK_DONE': return '#f59e0b'; // Amber
      case 'NOT_STARTED': return '#f97316';    // Orange
      case 'NOT_COMPLETED': return '#ef4444';  // Red
      case 'NO_WORK_DONE': return '#dc2626';   // Deep Crimson
      case 'TO_BE_LISTED': return '#8b5cf6';   // Purple
      default: return '#64748b';
    }
  };

  return (
    <section className="bg-white rounded-gov border border-gov-border shadow-gov p-4 sm:p-6 space-y-5">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gov-border">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-gov-navy">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gov-navy tracking-tight">
                MP Geographical Work Clustering & Fund Utilization Tracker
              </h2>
              <p className="text-xs text-slate-500">
                Spatial GIS analytics for Members of Parliament to track constituency work density, execution progress, and unserved habitations.
              </p>
            </div>
          </div>
        </div>

        {/* Layer Controls & Quick View Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-md border border-slate-200 text-xs">
            <button
              onClick={() => setViewLayer('hybrid')}
              className={`px-2.5 py-1 rounded font-medium transition ${viewLayer === 'hybrid' ? 'bg-white text-gov-navy shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              GIS Clustering
            </button>
            <button
              onClick={() => setViewLayer('satellite')}
              className={`px-2.5 py-1 rounded font-medium transition ${viewLayer === 'satellite' ? 'bg-white text-gov-navy shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Satellite Layer
            </button>
            <button
              onClick={() => setViewLayer('heatmap')}
              className={`px-2.5 py-1 rounded font-medium transition ${viewLayer === 'heatmap' ? 'bg-white text-gov-navy shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Density Heatmap
            </button>
          </div>
        </div>
      </div>

      {/* 8 Work Status Filter Badges (Requested by User) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
        {(Object.keys(STATUS_CONFIG) as WorkClusterStatus[]).map((statusKey) => {
          const cfg = STATUS_CONFIG[statusKey];
          const Icon = cfg.icon;
          const isSelected = selectedStatus === statusKey;
          const count = statusKey === 'ALL' 
            ? MOCK_CLUSTERS.length 
            : MOCK_CLUSTERS.filter(c => c.status === statusKey).length;

          return (
            <button
              key={statusKey}
              onClick={() => setSelectedStatus(statusKey)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? `${cfg.bg} ${cfg.color} ${cfg.border} ring-2 ring-blue-500/20 shadow-xs font-bold`
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
              <span>{cfg.label}</span>
              <span className={`text-[10.5px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/80' : 'bg-slate-100'} font-bold`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Row: MP Selector, State Filter, Search */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-50/80 p-3 rounded-md border border-slate-200">
        
        {/* MP Selector Dropdown */}
        <div className="md:col-span-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Hon'ble Member of Parliament (MP)
          </label>
          <select
            value={selectedMP}
            onChange={(e) => setSelectedMP(e.target.value)}
            className="w-full text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-gov-navy focus:outline-none font-medium text-slate-800"
          >
            <option value="All">All Constituencies (Combined View)</option>
            {mpOptions.map(mp => (
              <option key={mp} value={mp}>MP: {mp}</option>
            ))}
          </select>
        </div>

        {/* State Filter */}
        <div className="md:col-span-3">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            State / UT Region
          </label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-gov-navy focus:outline-none font-medium text-slate-800"
          >
            <option value="All">All States</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Bihar">Bihar</option>
            <option value="Kerala">Kerala</option>
          </select>
        </div>

        {/* Cluster Name Search */}
        <div className="md:col-span-5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Search Cluster / Habitation / Sector
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Panchayat, Ward, Sector, or Work ID..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          </div>
        </div>

      </div>

      {/* Main Grid: Interactive Geographic Map Canvas (Left 7 Cols) + Cluster Deep-Inspection Card (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Geographic Cluster Map Canvas */}
        <div className="lg:col-span-7 bg-slate-900 rounded-gov border border-slate-800 p-3 flex flex-col justify-between relative overflow-hidden min-h-[440px] shadow-inner">
          
          {/* Top Canvas HUD overlay */}
          <div className="flex items-center justify-between z-10 mb-2">
            <div className="flex items-center space-x-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-white font-bold tracking-wide">
                GIS SPATIAL CLUSTER ENGINE
              </span>
              <span className="text-slate-400 text-[11px]">
                ({filteredClusters.length} Active Nodes)
              </span>
            </div>

            <div className="flex items-center space-x-2 text-[10px] text-slate-300 font-mono">
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                PROJECTION: WGS-84 / EPSG:4326
              </span>
            </div>
          </div>

          {/* SVG Map Canvas with India Geography and Clustered Nodes */}
          <div className="relative w-full flex-1 flex items-center justify-center">
            <svg 
              viewBox="0 0 500 480" 
              className={`w-full h-[360px] ${viewLayer === 'satellite' ? 'filter brightness-90 contrast-125' : ''}`}
            >
              <defs>
                {/* Background Grid */}
                <pattern id="clusterGrid" width="25" height="25" patternUnits="userSpaceOnUse">
                  <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#334155" strokeWidth="0.4" opacity="0.4" />
                </pattern>
                {/* Glow Filters */}
                <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Grid backdrop */}
              <rect width="500" height="480" fill="#0f172a" />
              <rect width="500" height="480" fill="url(#clusterGrid)" />

              {/* Simplified India Territorial Outline */}
              <path
                d="M 180 50 L 220 70 L 240 100 L 290 120 L 330 115 L 360 140 L 410 150 L 430 180 L 390 200 L 370 220 L 340 240 L 320 280 L 290 330 L 250 390 L 210 440 L 190 440 L 170 380 L 150 330 L 130 270 L 110 240 L 120 200 L 110 160 L 150 100 Z"
                fill={viewLayer === 'satellite' ? '#1e293b' : '#1e293b'}
                stroke="#475569"
                strokeWidth="1.5"
                opacity="0.85"
              />

              {/* State boundary indicators */}
              <path d="M 130 200 L 200 220 L 280 200" fill="none" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" />
              <path d="M 280 200 L 350 210 L 390 240" fill="none" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" />
              <path d="M 160 270 L 240 290 L 300 270" fill="none" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" />

              {/* Heatmap Layer if Active */}
              {viewLayer === 'heatmap' && (
                <g opacity="0.45">
                  <circle cx="295" cy="195" r="45" fill="#10b981" filter="url(#glowGreen)" />
                  <circle cx="165" cy="310" r="40" fill="#3b82f6" filter="url(#glowGreen)" />
                  <circle cx="135" cy="205" r="35" fill="#10b981" filter="url(#glowGreen)" />
                  <circle cx="306" cy="198" r="30" fill="#ef4444" filter="url(#glowRed)" />
                  <circle cx="285" cy="200" r="28" fill="#dc2626" filter="url(#glowRed)" />
                </g>
              )}

              {/* Geographical Cluster Bubbles */}
              {filteredClusters.map((cluster) => {
                const isSelected = activeCluster?.id === cluster.id;
                const nodeColor = getClusterColor(cluster.status);
                const radius = Math.max(10, Math.min(22, 8 + cluster.totalWorks * 0.7));

                return (
                  <g 
                    key={cluster.id} 
                    className="cursor-pointer transition-all duration-300 group"
                    onClick={() => setActiveCluster(cluster)}
                  >
                    {/* Pulsing ring for active or high priority */}
                    {(isSelected || cluster.status === 'NO_WORK_DONE' || cluster.status === 'NOT_COMPLETED') && (
                      <circle
                        cx={cluster.x}
                        cy={cluster.y}
                        r={radius + 6}
                        fill="none"
                        stroke={nodeColor}
                        strokeWidth="1.5"
                        opacity="0.6"
                        className="animate-ping"
                      />
                    )}

                    {/* Outer glow ring */}
                    <circle
                      cx={cluster.x}
                      cy={cluster.y}
                      r={radius + (isSelected ? 4 : 2)}
                      fill={nodeColor}
                      opacity={isSelected ? 0.35 : 0.15}
                    />

                    {/* Main Cluster Circle */}
                    <circle
                      cx={cluster.x}
                      cy={cluster.y}
                      r={radius}
                      fill={nodeColor}
                      stroke={isSelected ? '#ffffff' : '#0f172a'}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      className="transition-transform group-hover:scale-110"
                    />

                    {/* Work Count / Text Label inside Bubble */}
                    <text
                      x={cluster.x}
                      y={cluster.y + 3.5}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {cluster.totalWorks}
                    </text>

                    {/* Cluster Name Tag on hover/selected */}
                    {isSelected && (
                      <g>
                        <rect
                          x={cluster.x - 45}
                          y={cluster.y - radius - 18}
                          width="90"
                          height="16"
                          rx="3"
                          fill="#0b2e59"
                          stroke="#38bdf8"
                          strokeWidth="1"
                        />
                        <text
                          x={cluster.x}
                          y={cluster.y - radius - 6}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="8"
                          fontWeight="bold"
                        >
                          {cluster.district} ({cluster.saturationScore}%)
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Bottom Map Legend */}
          <div className="bg-slate-800/90 rounded p-2 border border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-300 z-10">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>More Work Done (&gt;75%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>In Progress (50-75%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Less Work Done (&lt;50%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <span>No Work / Delayed Gap</span>
            </div>
          </div>

        </div>

        {/* Right Column: Cluster Detail & MP Fund Tracking Card */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          
          {activeCluster ? (
            <div className="bg-white rounded-gov border border-gov-border p-4 shadow-gov flex flex-col justify-between h-full space-y-4">
              
              {/* Cluster Title & MP Tag */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Cluster ID: {activeCluster.id} • {activeCluster.state}
                    </span>
                    <h3 className="text-base font-bold text-gov-navy leading-snug">
                      {activeCluster.name}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{activeCluster.panchayatOrWard}, {activeCluster.district}</span>
                    </p>
                  </div>

                  {/* Status Badge */}
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${
                    STATUS_CONFIG[activeCluster.status].bg
                  } ${STATUS_CONFIG[activeCluster.status].color} ${
                    STATUS_CONFIG[activeCluster.status].border
                  }`}>
                    {STATUS_CONFIG[activeCluster.status].label}
                  </span>
                </div>

                {/* MP Attribution Banner */}
                <div className="mt-3 bg-blue-50/70 p-2.5 rounded border border-blue-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-blue-800 font-medium block">Allocating Member of Parliament</span>
                    <span className="font-bold text-gov-navy">{activeCluster.mpName}</span>
                  </div>
                  <span className="text-[10.5px] font-semibold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                    Lok Sabha MP
                  </span>
                </div>
              </div>

              {/* Fund Disbursed vs Total Sanctioned */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-medium block">Total Cluster Allocation</span>
                  <span className="text-sm sm:text-base font-bold text-gov-navy">
                    ₹ {activeCluster.totalCostLakhs.toFixed(1)} Lakhs
                  </span>
                </div>
                <div className="bg-emerald-50/80 p-2.5 rounded border border-emerald-100">
                  <span className="text-[10px] text-emerald-800 font-medium block">Funds Disbursed</span>
                  <span className="text-sm sm:text-base font-bold text-emerald-700">
                    ₹ {activeCluster.disbursedCostLakhs.toFixed(1)} Lakhs
                  </span>
                </div>
              </div>

              {/* Works Breakdown Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">Constituency Saturation Index</span>
                  <span className="font-bold text-emerald-700">{activeCluster.saturationScore}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-emerald-600 h-full transition-all duration-300"
                    style={{ width: `${(activeCluster.completedWorks / (activeCluster.totalWorks || 1)) * 100}%` }}
                    title={`Completed: ${activeCluster.completedWorks}`}
                  ></div>
                  <div 
                    className="bg-blue-500 h-full transition-all duration-300"
                    style={{ width: `${(activeCluster.inProgressWorks / (activeCluster.totalWorks || 1)) * 100}%` }}
                    title={`In Progress: ${activeCluster.inProgressWorks}`}
                  ></div>
                  <div 
                    className="bg-amber-400 h-full transition-all duration-300"
                    style={{ width: `${(activeCluster.pendingWorks / (activeCluster.totalWorks || 1)) * 100}%` }}
                    title={`Pending: ${activeCluster.pendingWorks}`}
                  ></div>
                </div>

                {/* 3 Metrics Mini Grid */}
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
                  <div className="bg-slate-50 p-1.5 rounded">
                    <span className="text-[9.5px] text-slate-400 block">Completed</span>
                    <span className="font-bold text-emerald-700">{activeCluster.completedWorks} Works</span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded">
                    <span className="text-[9.5px] text-slate-400 block">In Progress</span>
                    <span className="font-bold text-blue-700">{activeCluster.inProgressWorks} Works</span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded">
                    <span className="text-[9.5px] text-slate-400 block">Pending / Gap</span>
                    <span className="font-bold text-amber-700">{activeCluster.pendingWorks} Works</span>
                  </div>
                </div>
              </div>

              {/* Key Infrastructure Focus */}
              <div className="bg-slate-50/80 p-2.5 rounded border border-slate-100 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 font-medium">
                  <span>Primary Development Sector:</span>
                  <span className="font-bold text-slate-800">{activeCluster.sector}</span>
                </div>
                <p className="text-[11px] text-slate-700 font-normal">
                  <strong>Flagship Work:</strong> {activeCluster.primaryWork}
                </p>
                <div className="text-[10.5px] text-slate-500 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                  <span>Implementing Agency (IDA): {activeCluster.idaName}</span>
                </div>
              </div>

              {/* Action Buttons for MPs */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10.5px] text-slate-400">
                  GPS: {activeCluster.lat.toFixed(4)}°N, {activeCluster.lng.toFixed(4)}°E
                </span>
                <button 
                  onClick={() => alert(`Generating Official MP Constituency Audit Dossier for ${activeCluster.name} (${activeCluster.district})...`)}
                  className="px-3 py-1.5 bg-gov-navy hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs flex items-center space-x-1 transition"
                >
                  <span>Export MP Dossier</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-gov border border-gov-border p-6 text-center text-slate-500 flex flex-col items-center justify-center h-full">
              <MapPin className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-medium">Select a cluster node on the map to inspect MP fund utilization.</p>
            </div>
          )}

        </div>

      </div>

      {/* Cluster Works Tracking Table for MPs */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Detailed Habitation & Work List ({filteredClusters.length} Clustered Zones)
          </h4>
          <span className="text-xs text-slate-500">
            Total Fund Disbursed: <strong>₹{stats.totalDisbursedCr} Cr</strong> of ₹{stats.totalCostCr} Cr
          </span>
        </div>

        <div className="overflow-x-auto rounded border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3">Cluster ID & Name</th>
                <th className="py-2.5 px-3">District & State</th>
                <th className="py-2.5 px-3">MP Name</th>
                <th className="py-2.5 px-3">Development Sector</th>
                <th className="py-2.5 px-3 text-center">Status Cluster</th>
                <th className="py-2.5 px-3 text-right">Works (Comp/Total)</th>
                <th className="py-2.5 px-3 text-right">Funds Disbursed</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredClusters.map((cluster) => {
                const cfg = STATUS_CONFIG[cluster.status];
                const isSelected = activeCluster?.id === cluster.id;

                return (
                  <tr 
                    key={cluster.id} 
                    className={`hover:bg-blue-50/40 transition cursor-pointer ${isSelected ? 'bg-blue-50/80 font-medium' : ''}`}
                    onClick={() => setActiveCluster(cluster)}
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{cluster.name}</div>
                      <div className="text-[10.5px] text-slate-400">{cluster.panchayatOrWard}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      <div>{cluster.district}</div>
                      <div className="text-[10.5px] text-slate-400">{cluster.state}</div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gov-navy">
                      {cluster.mpName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {cluster.sector}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      <span className="text-emerald-700 font-bold">{cluster.completedWorks}</span>
                      <span className="text-slate-400"> / {cluster.totalWorks}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-gov-navy">
                      ₹ {cluster.disbursedCostLakhs.toFixed(1)} L
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCluster(cluster);
                        }}
                        className="text-gov-blue hover:text-gov-navy text-xs font-semibold px-2 py-1 rounded hover:bg-slate-100 transition"
                      >
                        Track
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
