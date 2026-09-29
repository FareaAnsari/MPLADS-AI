/**
 * TypeScript Interfaces for Universal MPLADS Intelligence Agent
 */

export type ProvenanceTier = 1 | 2 | 3;

export interface CitationItem {
  source: string;
  provenance_tier: ProvenanceTier;
  citable_anchor: string;
  timestamp: string;
  tool?: string;
}

export interface KPIItem {
  label: string;
  value: string;
  variant?: 'blue' | 'green' | 'purple' | 'amber' | 'red';
}

export interface ProjectTableItem {
  work_id: string;
  work_title: string;
  work_category?: string;
  state?: string;
  ida_office?: string;
  constituency?: string;
  mp_name?: string;
  disbursed_amount_inr?: number;
  sanctioned_amount_inr?: number;
  current_stage?: string;
  completion_date?: string;
  fiscal_year?: string;
}

export interface DossierPayload {
  title: string;
  work_id: string;
  identity: {
    work_title: string;
    category: string;
    state: string;
    district: string;
    mp_name: string;
    fiscal_year: string;
  };
  financials: {
    sanctioned_amount_inr: number;
    disbursed_amount_inr: number;
    peer_cohort_median_inr: number;
    cost_deviation_pct: number;
  };
  risk_signals: {
    composite_score: number;
    severity: string;
    top_factor: string;
    explainable_reasons: string[];
  };
  similarity_and_overlaps: {
    cross_scheme_matches_count: number;
    dpr_copy_paste_flag: boolean;
    highest_dpr_similarity: number;
  };
  statutory_guideline: {
    title: string;
    citation: string;
    excerpt: string;
  };
  verification_questions: string[];
}

export interface MapMarkerItem {
  id: string;
  title: string;
  category?: string;
  amount?: number;
  position: [number, number];
  state?: string;
  district?: string;
}

export interface MapPayload {
  state: string;
  marker_count: number;
  markers: MapMarkerItem[];
}

export interface AgentResponse {
  conversation_id: string;
  answer: string;
  intents: string[];
  entities: Record<string, any>;
  kpis: KPIItem[];
  projects: ProjectTableItem[];
  map?: MapPayload | null;
  dossier?: DossierPayload | null;
  citations: CitationItem[];
  followups: string[];
  provenance_tier: ProvenanceTier;
  execution_time_ms: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  responsePayload?: AgentResponse;
  isStreaming?: boolean;
}
