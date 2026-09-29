"""
Multi-turn Conversation State and Session Manager for the Universal MPLADS Intelligence Agent.
Maintains context across turns (current MP, project, active filters, previous results).
"""

from typing import Dict, Any, Optional, List
import time
from datetime import datetime
import uuid


class SessionState:
    def __init__(self, conversation_id: str, user_id: str = "anonymous", user_role: str = "CITIZEN"):
        self.conversation_id = conversation_id
        self.user_id = user_id
        self.user_role = user_role
        self.current_mp: Optional[str] = None
        self.current_constituency: Optional[str] = None
        self.current_state: Optional[str] = None
        self.current_district: Optional[str] = None
        self.current_project: Optional[str] = None
        self.active_filters: Dict[str, Any] = {}
        self.previous_results: List[Dict[str, Any]] = []
        self.history: List[Dict[str, Any]] = []
        self.created_at = datetime.utcnow().isoformat()
        self.updated_at = datetime.utcnow().isoformat()

    def update_context(
        self,
        mp: Optional[str] = None,
        constituency: Optional[str] = None,
        state: Optional[str] = None,
        district: Optional[str] = None,
        project: Optional[str] = None,
        results: Optional[List[Dict[str, Any]]] = None,
        filters: Optional[Dict[str, Any]] = None
    ):
        if mp:
            self.current_mp = mp
        if constituency:
            self.current_constituency = constituency
        if state:
            self.current_state = state
        if district:
            self.current_district = district
        if project:
            self.current_project = project
        if results:
            self.previous_results = results[:20]
        if filters:
            self.active_filters.update(filters)
        self.updated_at = datetime.utcnow().isoformat()

    def add_message(self, role: str, content: str, metadata: Optional[Dict[str, Any]] = None):
        self.history.append({
            "id": str(uuid.uuid4()),
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": metadata or {}
        })
        self.updated_at = datetime.utcnow().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "conversation_id": self.conversation_id,
            "user_id": self.user_id,
            "user_role": self.user_role,
            "current_mp": self.current_mp,
            "current_constituency": self.current_constituency,
            "current_state": self.current_state,
            "current_district": self.current_district,
            "current_project": self.current_project,
            "active_filters": self.active_filters,
            "previous_results_count": len(self.previous_results),
            "turn_count": len(self.history),
            "updated_at": self.updated_at
        }


class SessionManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SessionManager, cls).__new__(cls)
            cls._instance._sessions: Dict[str, SessionState] = {}
        return cls._instance

    def get_or_create(self, conversation_id: Optional[str], user_id: str = "anonymous", user_role: str = "CITIZEN") -> SessionState:
        cid = conversation_id if conversation_id else str(uuid.uuid4())
        if cid not in self._sessions:
            self._sessions[cid] = SessionState(conversation_id=cid, user_id=user_id, user_role=user_role)
        return self._sessions[cid]

    def get_session(self, conversation_id: str) -> Optional[SessionState]:
        return self._sessions.get(conversation_id)

session_manager = SessionManager()
