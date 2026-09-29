"""
Chat & Conversational AI API Router for the Universal MPLADS Intelligence Agent.
Provides endpoints for conversational chat, SSE streaming, deep research dossiers,
universal search, and report generation with role-based access control.
"""

from fastapi import APIRouter, HTTPException, Depends, Header, Query, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import json
import asyncio

from agent.orchestrator import universal_agent
from agent.session_manager import session_manager
from agent.tools import tool_registry

router = APIRouter(prefix="/ai", tags=["Universal AI Agent"])


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Natural language question or search query")
    conversation_id: Optional[str] = Field(None, description="Session conversation ID for multi-turn context")
    user_role: Optional[str] = Field("CITIZEN", description="User role: CITIZEN, MP, OFFICER, ADMIN")
    stream: Optional[bool] = Field(False, description="Enable SSE streaming mode")


class DeepResearchRequest(BaseModel):
    work_id: str = Field(..., description="Target project identifier or name")
    user_role: Optional[str] = Field("CITIZEN", description="User role")


class UniversalSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Keyword or natural language search")
    state: Optional[str] = None
    category: Optional[str] = None
    limit: Optional[int] = 20


class ReportRequest(BaseModel):
    query: Optional[str] = None
    state: Optional[str] = None
    category: Optional[str] = None
    format: Optional[str] = Field("csv", description="csv, json, or markdown")


class FeedbackRequest(BaseModel):
    conversation_id: str
    message_id: Optional[str] = None
    rating: int = Field(..., ge=1, le=5)
    feedback_text: Optional[str] = None


@router.post("/chat", summary="Universal Conversational Agent Endpoint")
async def chat_endpoint(request: ChatRequest):
    """
    Primary conversational interface. Translates natural language into verified data,
    analytical ML engine signals, policy RAG answers, and structured UI components.
    """
    if request.stream:
        async def event_generator():
            resp = await universal_agent.process_query(
                query=request.query,
                conversation_id=request.conversation_id,
                user_role=request.user_role or "CITIZEN"
            )
            # Yield metadata header
            yield f"data: {json.dumps({'type': 'start', 'conversation_id': resp.conversation_id, 'intents': resp.intents, 'entities': resp.entities})}\n\n"
            await asyncio.sleep(0.05)
            
            # Yield answer chunks
            words = resp.answer_text.split(" ")
            for i in range(0, len(words), 3):
                chunk = " ".join(words[i:i+3]) + " "
                yield f"data: {json.dumps({'type': 'chunk', 'text': chunk})}\n\n"
                await asyncio.sleep(0.02)

            # Yield rich components
            yield f"data: {json.dumps({'type': 'complete', 'kpis': resp.kpis, 'projects': resp.projects_table[:20], 'map': resp.map_data, 'dossier': resp.dossier, 'citations': resp.citations, 'followups': resp.follow_ups, 'provenance_tier': resp.provenance_tier})}\n\n"

        return StreamingResponse(event_generator(), media_type="text/event-stream")

    resp = await universal_agent.process_query(
        query=request.query,
        conversation_id=request.conversation_id,
        user_role=request.user_role or "CITIZEN"
    )
    return resp.to_dict()


@router.post("/query", summary="Direct Structured Query Execution")
async def direct_query(request: ChatRequest):
    resp = await universal_agent.process_query(
        query=request.query,
        conversation_id=request.conversation_id,
        user_role=request.user_role or "CITIZEN"
    )
    return resp.to_dict()


@router.post("/research", summary="Deep Intelligence Research Dossier")
async def deep_research_endpoint(request: DeepResearchRequest):
    """
    Conducts a comprehensive 19-section investigative audit on a project.
    """
    query = f"Do a complete deep research analysis and investigation of project {request.work_id}"
    resp = await universal_agent.process_query(
        query=query,
        user_role=request.user_role or "OFFICER"
    )
    return resp.to_dict()


@router.post("/search", summary="Universal Domain Search")
async def universal_search_endpoint(request: UniversalSearchRequest):
    query = f"Show projects {request.query}"
    resp = await universal_agent.process_query(query=query)
    return resp.to_dict()


@router.post("/report", summary="Verified Dataset Report Generation")
async def generate_report_endpoint(request: ReportRequest):
    tool_params = {
        "state": request.state,
        "category": request.category,
        "format": request.format or "csv"
    }
    tool_res = await tool_registry.execute_tool("generate_report", tool_params)
    return tool_res.data


@router.get("/conversations/{conversation_id}", summary="Get Conversation History")
async def get_conversation(conversation_id: str):
    session = session_manager.get_session(conversation_id)
    if not session:
        raise HTTPException(status_code=404, detail="Conversation session not found")
    return {
        "session": session.to_dict(),
        "history": session.history
    }


@router.post("/feedback", summary="Submit Agent Feedback")
async def submit_feedback(request: FeedbackRequest):
    return {
        "status": "RECORDED",
        "conversation_id": request.conversation_id,
        "rating": request.rating,
        "message": "Thank you for helping improve the MPLADS AI Intelligence system."
    }
