from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class BidderScrutinySignal(BaseModel):
    signal_type: str  # ABNORMALLY_LOW_BID | LEAKED_ESTIMATE_PROXIMITY | REPEATED_WIN_CONCENTRATION | COLLUSIVE_BIDDING
    severity: str     # HIGH | MEDIUM | LOW
    confidence_score: float = 0.85
    title: str
    observation: str

class BidSchema(BaseModel):
    bid_id: str
    tender_id: str
    vendor_id: str
    vendor_name: str
    bid_amount: float
    submission_date: str
    technical_status: str  # QUALIFIED | DISQUALIFIED | UNDER_REVIEW
    technical_score: float
    financial_rank: Optional[str] = None  # L1, L2, L3, etc.
    status: str            # SUBMITTED | SELECTED | REJECTED
    is_suspiciously_low: bool = False
    variance_from_estimate_pct: float = 0.0
    data_provenance: str = "TIER_3_DEMO"

class TenderSchema(BaseModel):
    tender_id: str
    work_id: str
    work_title: str
    category: str
    tender_type: str  # OPEN_TENDER | LIMITED_TENDER | SINGLE_TENDER_NOMINATION | GEM_DIRECT
    estimated_cost: float
    publish_date: str
    submission_deadline: str
    opening_date: str
    status: str       # DRAFT | PUBLISHED | BIDDING_OPEN | UNDER_EVALUATION | AWARDED | CANCELLED
    district: str
    state: str
    procuring_entity: str
    bid_count: int = 0
    bids: List[BidSchema] = []
    scrutiny_signals: List[BidderScrutinySignal] = []
    awarded_contract_id: Optional[str] = None
    data_provenance: str = "TIER_3_DEMO"

class ContractSchema(BaseModel):
    contract_id: str
    tender_id: str
    work_id: str
    work_title: str
    vendor_id: str
    vendor_name: str
    contract_value: float
    award_date: str
    commencement_date: str
    scheduled_completion_date: str
    status: str  # ACTIVE | COMPLETED | TERMINATED | DISPUTED
    supply_chain_record_id: Optional[str] = None
    measurement_book_ref: Optional[str] = None
    district: str
    state: str
    data_provenance: str = "TIER_3_DEMO"

class CreateTenderRequest(BaseModel):
    work_id: str
    work_title: str
    category: str
    tender_type: str = "OPEN_TENDER"
    estimated_cost: float
    submission_deadline: str
    district: str
    state: str
    procuring_entity: str = "District Authority / DRDA"

class SubmitBidRequest(BaseModel):
    vendor_id: str
    vendor_name: str
    bid_amount: float
    technical_score: Optional[float] = 85.0

class AwardTenderRequest(BaseModel):
    selected_bid_id: str
    contract_commencement_date: Optional[str] = None
    scheduled_completion_date: Optional[str] = None
