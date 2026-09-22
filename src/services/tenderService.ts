export interface BidderScrutinySignal {
  signal_type: 'ABNORMALLY_LOW_BID' | 'LEAKED_ESTIMATE_PROXIMITY' | 'REPEATED_WIN_CONCENTRATION' | 'COLLUSIVE_BIDDING' | string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence_score: number;
  title: string;
  observation: string;
}

export interface Bid {
  bid_id: string;
  tender_id: string;
  vendor_id: string;
  vendor_name: string;
  bid_amount: number;
  submission_date: string;
  technical_status: 'QUALIFIED' | 'DISQUALIFIED' | 'UNDER_REVIEW' | string;
  technical_score: number;
  financial_rank?: string;
  status: 'SUBMITTED' | 'SELECTED' | 'REJECTED' | string;
  is_suspiciously_low?: boolean;
  variance_from_estimate_pct: number;
  data_provenance: string;
}

export interface Tender {
  tender_id: string;
  work_id: string;
  work_title: string;
  category: string;
  tender_type: 'OPEN_TENDER' | 'LIMITED_TENDER' | 'SINGLE_TENDER_NOMINATION' | 'GEM_DIRECT' | string;
  estimated_cost: number;
  publish_date: string;
  submission_deadline: string;
  opening_date: string;
  status: 'DRAFT' | 'PUBLISHED' | 'BIDDING_OPEN' | 'UNDER_EVALUATION' | 'AWARDED' | 'CANCELLED' | string;
  district: string;
  state: string;
  procuring_entity: string;
  bid_count: number;
  bids: Bid[];
  scrutiny_signals: BidderScrutinySignal[];
  awarded_contract_id?: string;
  data_provenance: string;
}

export interface Contract {
  contract_id: string;
  tender_id: string;
  work_id: string;
  work_title: string;
  vendor_id: string;
  vendor_name: string;
  contract_value: number;
  award_date: string;
  commencement_date: string;
  scheduled_completion_date: string;
  status: 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'DISPUTED' | string;
  supply_chain_record_id?: string;
  measurement_book_ref?: string;
  district: string;
  state: string;
  data_provenance: string;
}

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';

export const tenderService = {
  async getTenders(filters?: { status?: string; district?: string; tender_type?: string }): Promise<Tender[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.district) params.append('district', filters.district);
      if (filters?.tender_type) params.append('tender_type', filters.tender_type);

      const res = await fetch(`${API_BASE}/tenders?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend unavailable, using fallback seeded tender data', e);
    }
    return FALLBACK_TENDERS;
  },

  async getTenderById(tenderId: string): Promise<Tender | null> {
    try {
      const res = await fetch(`${API_BASE}/tenders/${tenderId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend unavailable for tender detail', e);
    }
    return FALLBACK_TENDERS.find(t => t.tender_id === tenderId) || null;
  },

  async getContracts(filters?: { district?: string; status?: string }): Promise<Contract[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.district) params.append('district', filters.district);
      if (filters?.status) params.append('status', filters.status);

      const res = await fetch(`${API_BASE}/tenders/contracts/all?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend unavailable, using fallback contracts data', e);
    }
    return FALLBACK_CONTRACTS;
  },

  async getContractById(contractId: string): Promise<Contract | null> {
    try {
      const res = await fetch(`${API_BASE}/tenders/contracts/${contractId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend unavailable for contract detail', e);
    }
    return FALLBACK_CONTRACTS.find(c => c.contract_id === contractId) || null;
  },

  async awardTender(tenderId: string, selectedBidId: string): Promise<Contract> {
    const res = await fetch(`${API_BASE}/tenders/${tenderId}/award`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected_bid_id: selectedBidId })
    });
    if (!res.ok) throw new Error('Failed to award tender');
    return await res.json();
  }
};

const FALLBACK_TENDERS: Tender[] = [
  {
    tender_id: 'TND-2024-MH-001',
    work_id: 'MPLADS-2024-MH-001',
    work_title: 'Construction of Primary Health Sub-Centre at Ambegaon',
    category: 'Health & Sanitation',
    tender_type: 'OPEN_TENDER',
    estimated_cost: 2500000,
    publish_date: '2024-08-05',
    submission_deadline: '2024-08-25',
    opening_date: '2024-08-27',
    status: 'AWARDED',
    district: 'Pune',
    state: 'Maharashtra',
    procuring_entity: 'District Authority (Pune) / DRDA',
    bid_count: 3,
    data_provenance: 'TIER_3_DEMO',
    awarded_contract_id: 'CNT-2024-MH-001',
    scrutiny_signals: [
      {
        signal_type: 'ABNORMALLY_LOW_BID',
        severity: 'HIGH',
        confidence_score: 0.92,
        title: 'Abnormally Low Bid: Bharat Infra Projects Ltd',
        observation: 'Quoted ₹19,00,000 (24.0% below engineer estimate of ₹25,00,000). High statutory risk of material quality compromise or abandonment.'
      }
    ],
    bids: [
      {
        bid_id: 'BID-1-01',
        tender_id: 'TND-2024-MH-001',
        vendor_id: 'VEND-001',
        vendor_name: 'Bharat Infra Projects Ltd',
        bid_amount: 1900000,
        submission_date: '2024-08-20 14:30',
        technical_status: 'QUALIFIED',
        technical_score: 92,
        financial_rank: 'L1',
        status: 'SELECTED',
        is_suspiciously_low: true,
        variance_from_estimate_pct: -24.0,
        data_provenance: 'TIER_3_DEMO'
      },
      {
        bid_id: 'BID-1-02',
        tender_id: 'TND-2024-MH-001',
        vendor_id: 'VEND-002',
        vendor_name: 'Pragati Construction Co.',
        bid_amount: 2600000,
        submission_date: '2024-08-21 11:15',
        technical_status: 'QUALIFIED',
        technical_score: 88.5,
        financial_rank: 'L2',
        status: 'REJECTED',
        variance_from_estimate_pct: 4.0,
        data_provenance: 'TIER_3_DEMO'
      },
      {
        bid_id: 'BID-1-03',
        tender_id: 'TND-2024-MH-001',
        vendor_id: 'VEND-003',
        vendor_name: 'Kaveri Water Works Pvt Ltd',
        bid_amount: 2725000,
        submission_date: '2024-08-22 16:40',
        technical_status: 'QUALIFIED',
        technical_score: 84,
        financial_rank: 'L3',
        status: 'REJECTED',
        variance_from_estimate_pct: 9.0,
        data_provenance: 'TIER_3_DEMO'
      }
    ]
  },
  {
    tender_id: 'TND-2024-UP-001',
    work_id: 'MPLADS-2024-UP-001',
    work_title: 'Concrete Pavement & Drainage from Block Road to Primary School',
    category: 'Rural Roads & Connectivity',
    tender_type: 'OPEN_TENDER',
    estimated_cost: 3200000,
    publish_date: '2024-08-10',
    submission_deadline: '2024-08-30',
    opening_date: '2024-09-02',
    status: 'AWARDED',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    procuring_entity: 'District Authority (Varanasi) / DRDA',
    bid_count: 3,
    data_provenance: 'TIER_3_DEMO',
    awarded_contract_id: 'CNT-2024-UP-001',
    scrutiny_signals: [
      {
        signal_type: 'LEAKED_ESTIMATE_PROXIMITY',
        severity: 'MEDIUM',
        confidence_score: 0.81,
        title: 'Suspiciously Accurate Bid Proximity: Bharat Infra Projects Ltd',
        observation: 'Bid quote of ₹31,97,000 aligns within 0.09% of confidential engineer estimate. Pattern indicates potential advance leak of non-public SoR.'
      }
    ],
    bids: [
      {
        bid_id: 'BID-4-01',
        tender_id: 'TND-2024-UP-001',
        vendor_id: 'VEND-001',
        vendor_name: 'Bharat Infra Projects Ltd',
        bid_amount: 3197000,
        submission_date: '2024-08-28 10:10',
        technical_status: 'QUALIFIED',
        technical_score: 91,
        financial_rank: 'L1',
        status: 'SELECTED',
        variance_from_estimate_pct: -0.09,
        data_provenance: 'TIER_3_DEMO'
      }
    ]
  }
];

const FALLBACK_CONTRACTS: Contract[] = [
  {
    contract_id: 'CNT-2024-MH-001',
    tender_id: 'TND-2024-MH-001',
    work_id: 'MPLADS-2024-MH-001',
    work_title: 'Construction of Primary Health Sub-Centre at Ambegaon',
    vendor_id: 'VEND-001',
    vendor_name: 'Bharat Infra Projects Ltd',
    contract_value: 1900000,
    award_date: '2024-09-01',
    commencement_date: '2024-09-08',
    scheduled_completion_date: '2025-01-10',
    status: 'ACTIVE',
    supply_chain_record_id: 'SC-MPLADS-2024-MH-001-01',
    measurement_book_ref: 'MB/2024/PUN/0001',
    district: 'Pune',
    state: 'Maharashtra',
    data_provenance: 'TIER_3_DEMO'
  },
  {
    contract_id: 'CNT-2024-UP-001',
    tender_id: 'TND-2024-UP-001',
    work_id: 'MPLADS-2024-UP-001',
    work_title: 'Concrete Pavement & Drainage from Block Road to Primary School',
    vendor_id: 'VEND-001',
    vendor_name: 'Bharat Infra Projects Ltd',
    contract_value: 3197000,
    award_date: '2024-09-05',
    commencement_date: '2024-09-12',
    scheduled_completion_date: '2025-02-15',
    status: 'ACTIVE',
    supply_chain_record_id: 'SC-MPLADS-2024-UP-001-01',
    measurement_book_ref: 'MB/2024/VAR/0002',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    data_provenance: 'TIER_3_DEMO'
  }
];
