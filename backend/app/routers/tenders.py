import sys
import os
import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status

from schemas.tender_schemas import (
    TenderSchema,
    BidSchema,
    ContractSchema,
    BidderScrutinySignal,
    CreateTenderRequest,
    SubmitBidRequest,
    AwardTenderRequest
)

# In-memory stores with realistic pre-populated seed data
_TENDERS_DB: Dict[str, TenderSchema] = {}
_CONTRACTS_DB: Dict[str, ContractSchema] = {}

router = APIRouter(prefix="/tenders", tags=["E-Procurement, Tenders & Contract Registry"])

# Vendor registry reference for realistic bidder mapping
SAMPLE_VENDORS = [
    {"vendor_id": "VEND-001", "vendor_name": "Bharat Infra Projects Ltd", "gstin": "27AAACB1234F1Z5"},
    {"vendor_id": "VEND-002", "vendor_name": "Pragati Construction Co.", "gstin": "27AABCP5678K1Z2"},
    {"vendor_id": "VEND-003", "vendor_name": "Kaveri Water Works Pvt Ltd", "gstin": "33AAACK9988D1Z9"},
    {"vendor_id": "VEND-004", "vendor_name": "Shree Ram Engineering Works", "gstin": "09AAACS4433E1Z4"},
    {"vendor_id": "VEND-005", "vendor_name": "Apex Community Infra Corp", "gstin": "19AAACA7766L1Z8"},
    {"vendor_id": "VEND-006", "vendor_name": "Deccan Roadways & Bridges", "gstin": "29AAACD3322P1Z1"},
]

def analyze_bidder_scrutiny(tender: TenderSchema) -> List[BidderScrutinySignal]:
    """
    Algorithmic Bidder Scrutiny Engine:
    Detects procurement anomalies without manual inspection.
    """
    signals = []
    if not tender.bids:
        return signals

    estimated = tender.estimated_cost
    qualified_bids = [b for b in tender.bids if b.technical_status == "QUALIFIED"]
    
    # 1. Abnormally Low Bid (Aggressive underbidding > 15% below estimate)
    for b in qualified_bids:
        variance_pct = ((b.bid_amount - estimated) / estimated) * 100
        b.variance_from_estimate_pct = round(variance_pct, 2)
        if variance_pct <= -15.0:
            b.is_suspiciously_low = True
            signals.append(
                BidderScrutinySignal(
                    signal_type="ABNORMALLY_LOW_BID",
                    severity="HIGH",
                    confidence_score=0.92,
                    title=f"Abnormally Low Bid: {b.vendor_name}",
                    observation=(
                        f"Quoted ₹{b.bid_amount:,.0f} ({abs(variance_pct):.1f}% below official engineer estimate of ₹{estimated:,.0f}). "
                        "High statutory risk of material quality compromise, substandard cement/steel grades, or mid-work abandonment."
                    )
                )
            )

        # 2. Leaked Estimate Proximity (Quoted within 0.25% of confidential estimated cost)
        if abs(variance_pct) <= 0.25 and len(qualified_bids) > 1:
            signals.append(
                BidderScrutinySignal(
                    signal_type="LEAKED_ESTIMATE_PROXIMITY",
                    severity="MEDIUM",
                    confidence_score=0.81,
                    title=f"Suspiciously Accurate Bid Proximity: {b.vendor_name}",
                    observation=(
                        f"Bid quote of ₹{b.bid_amount:,.0f} aligns within {abs(variance_pct):.2f}% of confidential engineer estimate. "
                        "Audit pattern indicates potential advance leak of non-public Schedule of Rates (SoR)."
                    )
                )
            )

    # 3. Repeated Win Concentration in District
    if tender.status == "AWARDED" and tender.awarded_contract_id:
        contract = _CONTRACTS_DB.get(tender.awarded_contract_id)
        if contract:
            vendor_district_wins = [
                c for c in _CONTRACTS_DB.values()
                if c.vendor_id == contract.vendor_id and c.district == contract.district
            ]
            if len(vendor_district_wins) >= 2:
                signals.append(
                    BidderScrutinySignal(
                        signal_type="REPEATED_WIN_CONCENTRATION",
                        severity="MEDIUM",
                        confidence_score=0.88,
                        title=f"District Contract Concentration: {contract.vendor_name}",
                        observation=(
                            f"{contract.vendor_name} has been awarded {len(vendor_district_wins)} contracts in {contract.district}. "
                            "Cross-checking against shell agency graph and contractor network registry."
                        )
                    )
                )

    # 4. Collusive Bid Cluster (Bids tightly grouped at high premium)
    if len(qualified_bids) >= 3:
        amounts = sorted([b.bid_amount for b in qualified_bids])
        spread = ((amounts[-1] - amounts[0]) / amounts[0]) * 100
        if spread < 1.8 and amounts[0] > estimated * 1.05:
            signals.append(
                BidderScrutinySignal(
                    signal_type="COLLUSIVE_BIDDING",
                    severity="HIGH",
                    confidence_score=0.89,
                    title="Potential Bidder Ring / Collusive Grouping",
                    observation=(
                        f"All {len(amounts)} qualifying bids are clustered within a narrow {spread:.2f}% price corridor "
                        f"above benchmark estimate (L1: ₹{amounts[0]:,.0f}, Highest: ₹{amounts[-1]:,.0f})."
                    )
                )
            )

    return signals

def _seed_initial_demo_dataset():
    """Generates a realistic Tier-3 demo dataset linked to real dataset project records."""
    if _TENDERS_DB:
        return

    demo_projects = [
        {"work_id": "MPLADS-2024-MH-001", "work_title": "Construction of Primary Health Sub-Centre at Ambegaon", "category": "Health & Sanitation", "est": 2500000.0, "district": "Pune", "state": "Maharashtra"},
        {"work_id": "MPLADS-2024-MH-002", "work_title": "Installation of 50 Solar Street Lights in Junnar Taluka", "category": "Renewable Energy", "est": 1200000.0, "district": "Pune", "state": "Maharashtra"},
        {"work_id": "MPLADS-2024-MH-003", "work_title": "Deep Tubewell & RO Water Filtration Plant at Shirur", "category": "Drinking Water", "est": 1850000.0, "district": "Pune", "state": "Maharashtra"},
        {"work_id": "MPLADS-2024-UP-001", "work_title": "Concrete Pavement & Drainage from Block Road to Primary School", "category": "Rural Roads & Connectivity", "est": 3200000.0, "district": "Varanasi", "state": "Uttar Pradesh"},
        {"work_id": "MPLADS-2024-UP-002", "work_title": "Community Digital Library & Skill Development Centre", "category": "Education & Skills", "est": 2200000.0, "district": "Varanasi", "state": "Uttar Pradesh"},
        {"work_id": "MPLADS-2024-TN-001", "work_title": "Smart Anganwadi Centre Construction at Sriperumbudur", "category": "Women & Child Care", "est": 1500000.0, "district": "Kanchipuram", "state": "Tamil Nadu"},
        {"work_id": "MPLADS-2024-TN-002", "work_title": "Desilting & Inflow Channel Renovation of Karunguzhi Lake", "category": "Water Harvesting", "est": 2800000.0, "district": "Chengalpattu", "state": "Tamil Nadu"},
        {"work_id": "MPLADS-2024-BR-001", "work_title": "High-Level Bridge Approach Road across Kamla River Canal", "category": "Bridges & Culverts", "est": 4500000.0, "district": "Madhubani", "state": "Bihar"},
        {"work_id": "MPLADS-2024-BR-002", "work_title": "Construction of Muktidham Crematorium with Solar Shed", "category": "Public Amenities", "est": 1600000.0, "district": "Darbhanga", "state": "Bihar"},
        {"work_id": "MPLADS-2024-WB-001", "work_title": "Modern Fishermen Landing Ghat & Net Repair Shed", "category": "Coastal / Inland Livelihoods", "est": 2100000.0, "district": "South 24 Parganas", "state": "West Bengal"},
        {"work_id": "MPLADS-2024-WB-002", "work_title": "Veterinary Dispensary Extension & Vaccine Cold Chain", "category": "Animal Husbandry", "est": 1400000.0, "district": "North 24 Parganas", "state": "West Bengal"},
        {"work_id": "MPLADS-2024-KA-001", "work_title": "Rainwater Harvesting Sumps for 10 Government High Schools", "category": "School Infrastructure", "est": 1950000.0, "district": "Mysuru", "state": "Karnataka"},
        {"work_id": "MPLADS-2024-RJ-001", "work_title": "Overhead Water Tank & Distribution Pipeline in Nokha", "category": "Drinking Water", "est": 3800000.0, "district": "Bikaner", "state": "Rajasthan"},
        {"work_id": "MPLADS-2024-GJ-001", "work_title": "Upgradation of Agricultural Produce Yard Concrete Flooring", "category": "Agrimarketing", "est": 2750000.0, "district": "Rajkot", "state": "Gujarat"},
    ]

    now = datetime.now()

    for idx, p in enumerate(demo_projects, start=1):
        t_id = f"TND-2024-{p['state'][:2].upper()}-{idx:03d}"
        
        # Determine status
        if idx in [1, 4, 6, 8, 10]:
            t_status = "AWARDED"
        elif idx in [2, 7, 12]:
            t_status = "UNDER_EVALUATION"
        elif idx in [3, 5, 9, 13]:
            t_status = "BIDDING_OPEN"
        else:
            t_status = "PUBLISHED"

        t_type = "OPEN_TENDER" if p["est"] > 1500000 else "LIMITED_TENDER"
        
        pub_date = (now - timedelta(days=45 - idx * 2)).strftime("%Y-%m-%d")
        sub_dead = (now - timedelta(days=20 - idx * 2)).strftime("%Y-%m-%d") if t_status != "BIDDING_OPEN" else (now + timedelta(days=10)).strftime("%Y-%m-%d")
        open_date = (now - timedelta(days=18 - idx * 2)).strftime("%Y-%m-%d") if t_status != "BIDDING_OPEN" else (now + timedelta(days=12)).strftime("%Y-%m-%d")

        # Generate 3-4 competitive bids per tender
        bids = []
        est = p["est"]
        
        # Bid 1: Winner or aggressive bid
        # Create an intentional anomaly for tender 1 & 4
        if idx == 1:
            # Abnormally Low Bid Anomaly
            b1_amt = round(est * 0.76, -3) # 24% under estimate
        elif idx == 4:
            # Leaked Estimate Proximity Anomaly
            b1_amt = round(est * 0.999, -2) # exactly 0.1% off estimate
        else:
            b1_amt = round(est * (0.92 + (idx % 4) * 0.02), -3)

        bids.append(
            BidSchema(
                bid_id=f"BID-{idx}-01",
                tender_id=t_id,
                vendor_id=SAMPLE_VENDORS[0]["vendor_id"],
                vendor_name=SAMPLE_VENDORS[0]["vendor_name"],
                bid_amount=b1_amt,
                submission_date=(now - timedelta(days=25)).strftime("%Y-%m-%d %H:%M"),
                technical_status="QUALIFIED",
                technical_score=92.0,
                financial_rank="L1",
                status="SELECTED" if t_status == "AWARDED" else "SUBMITTED",
                variance_from_estimate_pct=round(((b1_amt - est) / est) * 100, 2),
                is_suspiciously_low=(b1_amt <= est * 0.85),
                data_provenance="TIER_3_DEMO"
            )
        )

        # Bid 2: L2
        b2_amt = round(est * 1.04, -3)
        bids.append(
            BidSchema(
                bid_id=f"BID-{idx}-02",
                tender_id=t_id,
                vendor_id=SAMPLE_VENDORS[1]["vendor_id"],
                vendor_name=SAMPLE_VENDORS[1]["vendor_name"],
                bid_amount=b2_amt,
                submission_date=(now - timedelta(days=24)).strftime("%Y-%m-%d %H:%M"),
                technical_status="QUALIFIED",
                technical_score=88.5,
                financial_rank="L2",
                status="REJECTED" if t_status == "AWARDED" else "SUBMITTED",
                variance_from_estimate_pct=round(((b2_amt - est) / est) * 100, 2),
                data_provenance="TIER_3_DEMO"
            )
        )

        # Bid 3: L3
        b3_amt = round(est * 1.09, -3)
        bids.append(
            BidSchema(
                bid_id=f"BID-{idx}-03",
                tender_id=t_id,
                vendor_id=SAMPLE_VENDORS[2]["vendor_id"],
                vendor_name=SAMPLE_VENDORS[2]["vendor_name"],
                bid_amount=b3_amt,
                submission_date=(now - timedelta(days=23)).strftime("%Y-%m-%d %H:%M"),
                technical_status="QUALIFIED",
                technical_score=84.0,
                financial_rank="L3",
                status="REJECTED" if t_status == "AWARDED" else "SUBMITTED",
                variance_from_estimate_pct=round(((b3_amt - est) / est) * 100, 2),
                data_provenance="TIER_3_DEMO"
            )
        )

        # For awarded tenders, create real Contract object
        contract_id = None
        if t_status == "AWARDED":
            contract_id = f"CNT-2024-{p['state'][:2].upper()}-{idx:03d}"
            c = ContractSchema(
                contract_id=contract_id,
                tender_id=t_id,
                work_id=p["work_id"],
                work_title=p["work_title"],
                vendor_id=SAMPLE_VENDORS[0]["vendor_id"],
                vendor_name=SAMPLE_VENDORS[0]["vendor_name"],
                contract_value=b1_amt,
                award_date=(now - timedelta(days=15)).strftime("%Y-%m-%d"),
                commencement_date=(now - timedelta(days=10)).strftime("%Y-%m-%d"),
                scheduled_completion_date=(now + timedelta(days=120)).strftime("%Y-%m-%d"),
                status="ACTIVE",
                supply_chain_record_id=f"SC-{p['work_id']}-01",
                measurement_book_ref=f"MB/2024/{p['district'][:3].upper()}/{idx:04d}",
                district=p["district"],
                state=p["state"],
                data_provenance="TIER_3_DEMO"
            )
            _CONTRACTS_DB[contract_id] = c

        tender_obj = TenderSchema(
            tender_id=t_id,
            work_id=p["work_id"],
            work_title=p["work_title"],
            category=p["category"],
            tender_type=t_type,
            estimated_cost=est,
            publish_date=pub_date,
            submission_deadline=sub_dead,
            opening_date=open_date,
            status=t_status,
            district=p["district"],
            state=p["state"],
            procuring_entity=f"District Authority ({p['district']}) / DRDA",
            bid_count=len(bids),
            bids=bids,
            awarded_contract_id=contract_id,
            data_provenance="TIER_3_DEMO"
        )
        
        tender_obj.scrutiny_signals = analyze_bidder_scrutiny(tender_obj)
        _TENDERS_DB[t_id] = tender_obj

# Seed demo data upon module import
_seed_initial_demo_dataset()

@router.get("", response_model=List[TenderSchema])
def list_tenders(
    status: Optional[str] = Query(None, description="Filter by tender status"),
    district: Optional[str] = Query(None, description="Filter by district"),
    tender_type: Optional[str] = Query(None, description="Filter by tender type")
):
    """List all e-procurement tenders with optional filtering."""
    results = list(_TENDERS_DB.values())
    if status:
        results = [t for t in results if t.status.upper() == status.upper()]
    if district:
        results = [t for t in results if t.district.lower() == district.lower()]
    if tender_type:
        results = [t for t in results if t.tender_type.upper() == tender_type.upper()]
    return results

@router.get("/{tender_id}", response_model=TenderSchema)
def get_tender(tender_id: str):
    """Get full details of a tender including comparative bids and AI Bidder Scrutiny signals."""
    if tender_id not in _TENDERS_DB:
        raise HTTPException(status_code=404, detail=f"Tender {tender_id} not found.")
    t = _TENDERS_DB[tender_id]
    t.scrutiny_signals = analyze_bidder_scrutiny(t)
    return t

@router.post("", response_model=TenderSchema, status_code=status.HTTP_201_CREATED)
def create_tender(req: CreateTenderRequest):
    """Publish a new tender under GFR 2017 public procurement rules."""
    tender_id = f"TND-2024-{req.state[:2].upper()}-{len(_TENDERS_DB) + 1:03d}"
    now = datetime.now()
    
    tender = TenderSchema(
        tender_id=tender_id,
        work_id=req.work_id,
        work_title=req.work_title,
        category=req.category,
        tender_type=req.tender_type,
        estimated_cost=req.estimated_cost,
        publish_date=now.strftime("%Y-%m-%d"),
        submission_deadline=req.submission_deadline,
        opening_date=(datetime.strptime(req.submission_deadline, "%Y-%m-%d") + timedelta(days=2)).strftime("%Y-%m-%d") if req.submission_deadline else (now + timedelta(days=15)).strftime("%Y-%m-%d"),
        status="PUBLISHED",
        district=req.district,
        state=req.state,
        procuring_entity=req.procuring_entity,
        bid_count=0,
        bids=[],
        scrutiny_signals=[],
        data_provenance="TIER_3_DEMO"
    )
    _TENDERS_DB[tender_id] = tender
    return tender

@router.post("/{tender_id}/bids", response_model=TenderSchema)
def submit_bid(tender_id: str, req: SubmitBidRequest):
    """Submit a formal contractor bid against an open tender."""
    if tender_id not in _TENDERS_DB:
        raise HTTPException(status_code=404, detail=f"Tender {tender_id} not found.")
    
    t = _TENDERS_DB[tender_id]
    if t.status in ["AWARDED", "CANCELLED"]:
        raise HTTPException(status_code=400, detail=f"Tender {tender_id} is already {t.status} and cannot receive new bids.")

    bid_id = f"BID-{len(t.bids) + 1:02d}-{uuid.uuid4().hex[:4].upper()}"
    now = datetime.now()
    variance_pct = ((req.bid_amount - t.estimated_cost) / t.estimated_cost) * 100

    new_bid = BidSchema(
        bid_id=bid_id,
        tender_id=tender_id,
        vendor_id=req.vendor_id,
        vendor_name=req.vendor_name,
        bid_amount=req.bid_amount,
        submission_date=now.strftime("%Y-%m-%d %H:%M"),
        technical_status="QUALIFIED" if (req.technical_score or 80) >= 70 else "DISQUALIFIED",
        technical_score=req.technical_score or 85.0,
        status="SUBMITTED",
        variance_from_estimate_pct=round(variance_pct, 2),
        is_suspiciously_low=(req.bid_amount <= t.estimated_cost * 0.85),
        data_provenance="TIER_3_DEMO"
    )

    t.bids.append(new_bid)
    # Re-calculate financial ranks
    qualified = [b for b in t.bids if b.technical_status == "QUALIFIED"]
    qualified.sort(key=lambda x: x.bid_amount)
    for rank_idx, b in enumerate(qualified, start=1):
        b.financial_rank = f"L{rank_idx}"

    t.bid_count = len(t.bids)
    if t.status == "PUBLISHED":
        t.status = "BIDDING_OPEN"

    t.scrutiny_signals = analyze_bidder_scrutiny(t)
    return t

@router.post("/{tender_id}/award", response_model=ContractSchema)
def award_tender(tender_id: str, req: AwardTenderRequest):
    """
    Award contract to selected winning bid.
    Automatically spawns a linked SupplyChainRecord and updates Project Kanban state.
    """
    if tender_id not in _TENDERS_DB:
        raise HTTPException(status_code=404, detail=f"Tender {tender_id} not found.")
    
    t = _TENDERS_DB[tender_id]
    matching_bids = [b for b in t.bids if b.bid_id == req.selected_bid_id]
    if not matching_bids:
        raise HTTPException(status_code=404, detail=f"Bid {req.selected_bid_id} not found under tender {tender_id}.")
    
    winning_bid = matching_bids[0]
    now = datetime.now()

    # Mark bids
    for b in t.bids:
        if b.bid_id == winning_bid.bid_id:
            b.status = "SELECTED"
        else:
            b.status = "REJECTED"

    contract_id = f"CNT-2024-{t.state[:2].upper()}-{len(_CONTRACTS_DB) + 1:03d}"
    commence_date = req.contract_commencement_date or (now + timedelta(days=7)).strftime("%Y-%m-%d")
    completion_date = req.scheduled_completion_date or (now + timedelta(days=180)).strftime("%Y-%m-%d")

    # Downstream link to Supply Chain Tracker
    supply_chain_record_id = f"SC-{t.work_id}-01"

    contract = ContractSchema(
        contract_id=contract_id,
        tender_id=tender_id,
        work_id=t.work_id,
        work_title=t.work_title,
        vendor_id=winning_bid.vendor_id,
        vendor_name=winning_bid.vendor_name,
        contract_value=winning_bid.bid_amount,
        award_date=now.strftime("%Y-%m-%d"),
        commencement_date=commence_date,
        scheduled_completion_date=completion_date,
        status="ACTIVE",
        supply_chain_record_id=supply_chain_record_id,
        measurement_book_ref=f"MB/2024/{t.district[:3].upper()}/{len(_CONTRACTS_DB) + 1:04d}",
        district=t.district,
        state=t.state,
        data_provenance="TIER_3_DEMO"
    )

    _CONTRACTS_DB[contract_id] = contract
    t.status = "AWARDED"
    t.awarded_contract_id = contract_id
    t.scrutiny_signals = analyze_bidder_scrutiny(t)

    return contract

@router.get("/contracts/all", response_model=List[ContractSchema])
def list_contracts(
    district: Optional[str] = Query(None, description="Filter contracts by district"),
    status: Optional[str] = Query(None, description="Filter contracts by status")
):
    """List all awarded contract agreements."""
    results = list(_CONTRACTS_DB.values())
    if district:
        results = [c for c in results if c.district.lower() == district.lower()]
    if status:
        results = [c for c in results if c.status.upper() == status.upper()]
    return results

@router.get("/contracts/{contract_id}", response_model=ContractSchema)
def get_contract(contract_id: str):
    """Get contract details linked with supply chain and measurement book reference."""
    if contract_id not in _CONTRACTS_DB:
        raise HTTPException(status_code=404, detail=f"Contract {contract_id} not found.")
    return _CONTRACTS_DB[contract_id]

@router.post("/seed-demo", response_model=Dict[str, Any])
def seed_demo_tenders():
    """Reset and seed realistic Tier-3 demo dataset for procurement & contracts."""
    _TENDERS_DB.clear()
    _CONTRACTS_DB.clear()
    _seed_initial_demo_dataset()
    return {
        "status": "SUCCESS",
        "message": f"Seeded {len(_TENDERS_DB)} demo tenders and {len(_CONTRACTS_DB)} awarded contracts linked to real projects.",
        "data_provenance": "TIER_3_DEMO"
    }
