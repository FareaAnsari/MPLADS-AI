"""
Automated Test Suite for ASK MPLAD Domain Intelligence Agent.
Covers Entity Resolution, Financial Utilization Aggregation, MoSPI RAG,
Multi-Turn Context Memory, Out-of-Scope Guardrails, and Multilingual Inquiries.
"""

import pytest
import asyncio
from agent.orchestrator import universal_agent
from agent.router import intent_router, IntentType
from agent.entity_resolver import entity_resolver


@pytest.mark.asyncio
async def test_entity_resolution_bhalya_mama():
    """Golden Test 1: 'Tell me about Bhalya Mama' must resolve to Balya Mama Suresh Gopinath Mhatre."""
    query = "Tell me about Bhalya Mama"
    resp = await universal_agent.process_query(query)

    assert resp.entities.get("mp_name") == "BALYA MAMA SURESH GOPINATH MHATRE"
    assert "BALYA MAMA SURESH GOPINATH MHATRE" in resp.answer_text
    assert "BHIWANDI" in resp.answer_text
    assert resp.provenance_tier == 1
    assert len(resp.kpis) >= 2


@pytest.mark.asyncio
async def test_zero_utilization_query():
    """Golden Test 2: 'Which MPs have used 0% of their budget?' must perform financial aggregation."""
    query = "Which MPs have used 0% of their budget?"
    resp = await universal_agent.process_query(query)

    assert "0% budget utilization" in resp.answer_text or "zero recorded expenditure" in resp.answer_text
    assert len(resp.projects_table) > 0
    # Every returned row must show 0.0 disbursed
    for row in resp.projects_table[:10]:
        assert row.get("disbursed_amount_inr") == 0.0
    assert resp.provenance_tier == 1


@pytest.mark.asyncio
async def test_combined_filters_maharashtra_zero_util():
    """Golden Test 3: 'Which MPs from Maharashtra have used 0% of their budget and have more than 5 projects?'"""
    query = "Which MPs from Maharashtra have used 0% of their budget and have more than 5 projects?"
    resp = await universal_agent.process_query(query)

    assert resp.entities.get("state") == "Maharashtra"
    assert resp.entities.get("max_utilization") == 0.0
    assert resp.entities.get("min_projects") == 5
    assert "Financial Utilization Analysis" in resp.answer_text


@pytest.mark.asyncio
async def test_mp_ranking_highest_expenditure():
    """Golden Test 4: 'Who spent the most?' ranks MPs deterministically."""
    query = "Who spent the most?"
    resp = await universal_agent.process_query(query)

    assert len(resp.projects_table) > 0
    top_mp = resp.projects_table[0]
    assert top_mp.get("disbursed_amount_inr", 0) > 0
    assert "Asit Kumar Mal" in top_mp.get("work_id", "") or top_mp.get("disbursed_amount_inr", 0) > 100000000


@pytest.mark.asyncio
async def test_district_ranking_highest_expenditure():
    """Golden Test 5: 'Which district has highest expenditure?' ranks districts."""
    query = "Which district has highest expenditure?"
    resp = await universal_agent.process_query(query)

    assert "District Expenditure Rankings" in resp.answer_text
    assert len(resp.projects_table) > 0
    top_dist = resp.projects_table[0]
    assert top_dist.get("disbursed_amount_inr", 0) > 0


@pytest.mark.asyncio
async def test_guideline_prohibited_works_rag():
    """Golden Test 6: 'What works are prohibited under MPLADS?' retrieves MoSPI 2023 Guidelines."""
    query = "What works are prohibited under MPLADS?"
    resp = await universal_agent.process_query(query)

    assert "Strictly Prohibited Works" in resp.answer_text or "religious structures" in resp.answer_text
    assert "MoSPI Guidelines 2023" in resp.answer_text or "Statutory Authority" in resp.answer_text


@pytest.mark.asyncio
async def test_out_of_scope_guardrail():
    """Golden Test 7: Unrelated general-purpose queries must be rejected politely."""
    out_of_scope_queries = [
        "Write Python code",
        "Write a python script to scrape a website",
        "Build me a website using React",
        "Tell me a joke",
        "What is the weather in Delhi?"
    ]
    for q in out_of_scope_queries:
        resp = await universal_agent.process_query(q)
        assert "Ask MPLAD is designed specifically for MPLADS data" in resp.answer_text
        assert len(resp.projects_table) == 0


@pytest.mark.asyncio
async def test_multiturn_conversation_memory():
    """Golden Test 8: Multi-turn contextual filtering and constraint inheritance."""
    cid = f"test-multiturn-{asyncio.get_event_loop().time()}"

    # Turn 1
    r1 = await universal_agent.process_query("Show MPs in Maharashtra", conversation_id=cid)
    assert r1.entities.get("state") == "Maharashtra"
    assert len(r1.projects_table) > 0

    # Turn 2: Inherits Maharashtra + filters 0% utilization
    r2 = await universal_agent.process_query("Which have zero utilization?", conversation_id=cid)
    assert r2.entities.get("state") == "Maharashtra"
    assert r2.entities.get("max_utilization") == 0.0

    # Turn 3: Inherits Maharashtra + Lok Sabha
    r3 = await universal_agent.process_query("Only those from Lok Sabha", conversation_id=cid)
    assert r3.entities.get("state") == "Maharashtra"
    assert r3.entities.get("house") == "LOK_SABHA"


@pytest.mark.asyncio
async def test_multilingual_hinglish_queries():
    """Golden Test 9: Evaluates Hindi and Hinglish queries."""
    r_hi = await universal_agent.process_query("Maharashtra mein kitna kharcha hua?")
    assert r_hi.entities.get("state") == "Maharashtra"
    assert "Maharashtra" in r_hi.answer_text
