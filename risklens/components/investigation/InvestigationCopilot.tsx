"use client";

import React, { useState } from "react";
import { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Bot, Send, Sparkles, User, ShieldCheck, X } from "lucide-react";

interface Message {
  role: "user" | "copilot";
  content: string;
  timestamp: string;
}

export const InvestigationCopilot: React.FC<{ project: Project }> = ({ project }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "copilot",
      content: `Hello, Officer. I am your domain-scoped RiskLens Investigation Copilot for work ${project.id}. I can explain specific signal weights, inspect pHash photo matches, or summarize statutory SLA bottlenecks for this case.`,
      timestamp: "Just now",
    },
  ]);

  const QUICK_QUESTIONS = [
    "Why was this project flagged?",
    "Explain the photo duplicate match",
    "What statutory SLA was violated?",
    "Show delay prediction details",
  ];

  const answerQuery = (query: string) => {
    const q = query.toLowerCase();
    let reply = "";

    if (q.includes("why") || q.includes("flag") || q.includes("score")) {
      const triggered = project.riskScore.breakdown.filter((b) => b.isTriggered);
      const pointsList = triggered.map((t) => `• ${t.label}: +${t.points} pts (${t.reason})`).join("\n");
      reply = `Project ${project.id} received a composite Risk Score of ${project.riskScore.compositeScore}/100 based on ${triggered.length} additive signals:\n${pointsList}\n\nRecommended officer step: Physical site inspection to verify asset existence.`;
    } else if (q.includes("photo") || q.includes("phash") || q.includes("image")) {
      const dup = project.photos.find((p) => p.isDuplicateFlagged);
      if (dup) {
        reply = `Perceptual hash analysis flagged evidence photo ID '${dup.id}' with a 97% visual fingerprint match (Hamming distance ${dup.hammingDistance}) against historical project ${dup.matchedProjectId}. This indicates photographic reuse across different budget claims.`;
      } else {
        reply = `All submitted site completion photographs for ${project.id} have passed uniqueness checks with no cross-project pHash collisions.`;
      }
    } else if (q.includes("sla") || q.includes("delay") || q.includes("bottleneck")) {
      const worst = project.stageEvents.find((s) => s.isDelayed);
      if (worst) {
        reply = `Statutory bottleneck detected at stage '${worst.stageName}'. Actual duration of ${worst.actualDays} days exceeded expected SLA norm of ${worst.expectedDays} days by ${worst.delayRatio}×. Responsible administrative role: ${worst.responsibleRole}.`;
      } else {
        reply = `All administrative and execution stages for project ${project.id} are progressing within normative statutory SLA durations.`;
      }
    } else if (q.includes("prediction") || q.includes("delay prediction") || q.includes("forecast")) {
      if (project.delayPrediction) {
        reply = `Predictive Model Trajectory: ${project.delayPrediction.likelihood} likelihood of timeline breach (${project.delayPrediction.probabilityScore}% probability, ~${project.delayPrediction.expectedDelayDays} days delay expected). Factors: ${project.delayPrediction.primaryRiskFactors.join(" ")}`;
      } else {
        reply = `Predictive trajectory indicates low probability of timeline breach based on current execution pace.`;
      }
    } else {
      reply = `I am strictly scoped to explain MPLADS audit data for project ${project.id}. Please ask about cost benchmarks, photo pHash matches, statutory SLAs, or disbursement compliance.`;
    }

    const newMsgs: Message[] = [
      ...messages,
      { role: "user", content: query, timestamp: "Now" },
      { role: "copilot", content: reply, timestamp: "Now" },
    ];
    setMessages(newMsgs);
    setInputQuery("");
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold transition-all hover:scale-105 border border-slate-700/60"
      >
        <Bot className="w-4 h-4 text-blue-400" />
        <span>Ask Investigation Copilot</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
      {/* Copilot Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-blue-400" />
          <div>
            <div className="text-xs font-bold flex items-center gap-1.5">
              RiskLens Copilot
              <span className="text-[9px] bg-blue-500/20 text-blue-300 font-semibold px-1 py-0.2 rounded border border-blue-400/30">
                RAG Engine
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Scoped to {project.id}</div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message History */}
      <div className="p-4 flex-1 overflow-y-auto max-h-80 space-y-3 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`p-3 rounded-xl max-w-[85%] leading-relaxed whitespace-pre-line ${
                m.role === "user"
                  ? "bg-slate-900 text-white rounded-br-none"
                  : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Query Chips */}
      <div className="p-2 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-1">
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => answerQuery(q)}
            className="text-[10px] bg-white border border-slate-200 hover:bg-slate-100 px-2 py-1 rounded-md text-slate-700 transition-colors truncate max-w-full font-medium"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (inputQuery.trim()) answerQuery(inputQuery);
        }}
        className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask about this project's evidence or score..."
          className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
        <button
          type="submit"
          className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
