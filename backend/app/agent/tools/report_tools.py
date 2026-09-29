"""
Report Generation Tool for the Universal MPLADS Intelligence Agent.
Generates verified analytical reports in CSV, JSON, and Markdown format from retrieved context.
"""

from typing import Dict, Any, Optional, List
import time
import io
import csv
from datetime import datetime
from agent.tools.base import TypedTool, ToolResult, ToolMetadata, ProvenanceTier, UserRole
from agent.data_access import data_access


class GenerateReportTool(TypedTool):
    name = "generate_report"
    description = "Compiles verified project records into downloadable CSV, JSON, or structured Markdown reports."
    min_role = UserRole.CITIZEN

    async def execute(self, params: Dict[str, Any], user_role: UserRole = UserRole.CITIZEN) -> ToolResult:
        start_t = time.time()
        title = params.get("title", "MPLADS Verified Intelligence Report")
        state = params.get("state")
        category = params.get("category")
        format_type = params.get("format", "csv").lower()
        limit = min(int(params.get("limit", 50)), 200)

        records, total_count = data_access.search_projects(state=state, category=category, limit=limit)

        if format_type == "csv":
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(["Work ID", "Work Title", "Category", "State", "District/IDA", "MP Name", "Disbursed Amount (INR)", "Fiscal Year", "Completion Date"])
            for r in records:
                writer.writerow([
                    r.get("work_id"),
                    r.get("work_title"),
                    r.get("work_category"),
                    r.get("state"),
                    r.get("ida_office"),
                    r.get("mp_name"),
                    r.get("disbursed_amount_inr"),
                    r.get("fiscal_year"),
                    r.get("completion_date")
                ])
            report_content = output.getvalue()
        elif format_type == "json":
            report_content = records
        else: # markdown
            lines = [f"# {title}", f"**Generated:** {datetime.utcnow().strftime('%d-%b-%Y %H:%M UTC')}", f"**Scope:** State={state or 'All'}, Category={category or 'All'}", "", "| Work ID | Work Title | Category | State | Disbursed (₹) |", "|---|---|---|---|---|"]
            for r in records[:20]:
                lines.append(f"| `{r.get('work_id')}` | {r.get('work_title')} | {r.get('work_category')} | {r.get('state')} | ₹{r.get('disbursed_amount_inr', 0):,.2f} |")
            report_content = "\n".join(lines)

        return ToolResult(
            tool_name=self.name,
            success=True,
            data={
                "report_title": title,
                "format": format_type,
                "total_records_in_dataset": total_count,
                "records_in_report": len(records),
                "content": report_content
            },
            metadata=ToolMetadata(
                source="eSAKSHI Verified Dataset Report Engine",
                provenance_tier=ProvenanceTier.TIER_1,
                citable_anchor=f"Report on {len(records)} records",
                timestamp=datetime.utcnow().isoformat(),
                record_count=len(records)
            ),
            execution_time_ms=round((time.time() - start_t) * 1000, 2)
        )
