import sqlite3
import os
from typing import List, Dict, Any, Optional
from datetime import datetime

DB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
os.makedirs(DB_DIR, exist_ok=True)
DB_PATH = os.getenv("SQLITE_DB_PATH", os.path.join(DB_DIR, "mplads.db"))

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS officer_decisions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id TEXT NOT NULL,
                decision TEXT NOT NULL,
                notes TEXT NOT NULL,
                officer_id TEXT NOT NULL,
                officer_name TEXT,
                timestamp TEXT NOT NULL,
                status TEXT DEFAULT 'RECORDED'
            )
        """)
        conn.commit()

init_db()

def save_officer_decision(
    project_id: str,
    decision: str,
    notes: str,
    officer_id: str = "OFFICER-001",
    officer_name: Optional[str] = "District Planning Officer"
) -> Dict[str, Any]:
    """Persists an officer decision to SQLite database."""
    clean_id = project_id.strip('/').rstrip('-').strip()
    now_iso = datetime.utcnow().isoformat() + "Z"
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO officer_decisions (project_id, decision, notes, officer_id, officer_name, timestamp, status)
            VALUES (?, ?, ?, ?, ?, ?, 'RECORDED')
        """, (clean_id, decision, notes, officer_id, officer_name, now_iso))
        conn.commit()
        inserted_id = cursor.lastrowid

    return {
        "id": inserted_id,
        "project_id": clean_id,
        "decision": decision,
        "notes": notes,
        "officer_id": officer_id,
        "officer_name": officer_name,
        "timestamp": now_iso,
        "status": "RECORDED"
    }

def get_officer_decisions(project_id: str) -> List[Dict[str, Any]]:
    """Retrieves all officer decisions for a given project from SQLite database."""
    clean_id = project_id.strip('/').rstrip('-').strip()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, project_id, decision, notes, officer_id, officer_name, timestamp, status
            FROM officer_decisions
            WHERE LOWER(project_id) = LOWER(?)
            ORDER BY id DESC
        """, (clean_id,))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_latest_officer_decision(project_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves the latest officer decision for a given project."""
    decisions = get_officer_decisions(project_id)
    return decisions[0] if decisions else None
