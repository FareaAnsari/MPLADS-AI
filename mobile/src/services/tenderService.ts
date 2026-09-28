import { Config } from '../config/environment';

export interface MobileBidderScrutinySignal {
  signal_type: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence_score: number;
  title: string;
  observation: string;
}

export interface MobileBid {
  bid_id: string;
  tender_id: string;
  vendor_id: string;
  vendor_name: string;
  bid_amount: number;
  submission_date: string;
  technical_status: string;
  technical_score: number;
  financial_rank?: string;
  status: string;
  is_suspiciously_low?: boolean;
  variance_from_estimate_pct: number;
  data_provenance: string;
}

export interface MobileTender {
  tender_id: string;
  work_id: string;
  work_title: string;
  category: string;
  tender_type: string;
  estimated_cost: number;
  publish_date: string;
  submission_deadline: string;
  opening_date: string;
  status: string;
  district: string;
  state: string;
  procuring_entity: string;
  bid_count: number;
  bids: MobileBid[];
  scrutiny_signals: MobileBidderScrutinySignal[];
  awarded_contract_id?: string;
  data_provenance: string;
}

export interface MobileContract {
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
  status: string;
  supply_chain_record_id?: string;
  measurement_book_ref?: string;
  district: string;
  state: string;
  data_provenance: string;
}

const FALLBACK_MOBILE_TENDERS: MobileTender[] = [
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
        observation: 'Quoted ₹19,00,000 (24.0% below engineer estimate). High statutory risk of quality compromise or mid-work abandonment.'
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
      }
    ]
  },
  {
    tender_id: 'TND-2024-UP-001',
    work_id: 'MPLADS-2024-UP-001',
    work_title: 'Concrete Pavement & Drainage to Primary School',
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
    bid_count: 2,
    data_provenance: 'TIER_3_DEMO',
    awarded_contract_id: 'CNT-2024-UP-001',
    scrutiny_signals: [
      {
        signal_type: 'LEAKED_ESTIMATE_PROXIMITY',
        severity: 'MEDIUM',
        confidence_score: 0.81,
        title: 'Suspiciously Accurate Bid Proximity',
        observation: 'Bid quote aligns within 0.09% of confidential estimate. Potential advance leak of SoR.'
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

const FALLBACK_MOBILE_CONTRACTS: MobileContract[] = [
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
  }
];

export const mobileTenderService = {
  async getTenders(filters?: { status?: string; district?: string }): Promise<MobileTender[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.district) params.append('district', filters.district);

      const res = await fetch(`${Config.apiBaseUrl}/api/v1/tenders?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return FALLBACK_MOBILE_TENDERS;
  },

  async getTenderById(tenderId: string): Promise<MobileTender | null> {
    try {
      const res = await fetch(`${Config.apiBaseUrl}/api/v1/tenders/${tenderId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return FALLBACK_MOBILE_TENDERS.find((t) => t.tender_id === tenderId) || null;
  },

  async getContracts(filters?: { district?: string }): Promise<MobileContract[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.district) params.append('district', filters.district);

      const res = await fetch(`${Config.apiBaseUrl}/api/v1/tenders/contracts/all?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return FALLBACK_MOBILE_CONTRACTS;
  }
};
