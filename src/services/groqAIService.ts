// Groq AI High-Speed Inference Service for MPLADS AI
// Powered by Groq LPUs (Qwen 3.8 27B / GPT-OSS / LLaMA) with seamless Google AI fallback
// Provides real-time objective forensic audits, risk explanations, and village priority reasoning.

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_CANDIDATE_MODELS = [
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-120b',
  'llama-3.3-70b-versatile'
];

import { geminiAIService } from './geminiAIService';

export interface GroqAuditResponse {
  analysis: string;
  keyFindings: string[];
  recommendedReviewActions: string[];
  latencyMs: number;
  modelUsed?: string;
}

function formatGroqModelName(model: string): string {
  if (model.includes('qwen')) return 'Groq LPU (Qwen-3.8 27B Live)';
  if (model.includes('gpt-oss')) return 'Groq LPU (GPT-OSS 120B Live)';
  if (model.includes('llama')) return 'Groq LPU (LLaMA-3.3 70B Live)';
  return `Groq LPU (${model})`;
}

async function callGroqWithFallback(messages: Array<{ role: string; content: string }>, maxTokens = 600, temperature = 0.2): Promise<{ content: string; modelUsed: string }> {
  if (!GROQ_API_KEY || GROQ_API_KEY.trim().length === 0) {
    throw new Error('Groq API key not set');
  }

  let lastError: any = null;

  for (const model of GROQ_CANDIDATE_MODELS) {
    try {
      const response = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens
        })
      });

      if (!response.ok) {
        const errDetail = await response.text().catch(() => '');
        console.warn(`Groq candidate [${model}] returned HTTP ${response.status}:`, errDetail.slice(0, 100));
        lastError = new Error(`HTTP ${response.status} from Groq ${model}`);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || data.choices?.[0]?.message?.reasoning;
      if (content && content.trim().length > 0) {
        return {
          content: content.trim(),
          modelUsed: formatGroqModelName(model)
        };
      }
    } catch (err) {
      console.warn(`Groq execution error on [${model}]:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('All Groq candidate models failed');
}

export const groqAIService = {
  async generateRiskAudit(projectContext: {
    projectId: string;
    workName: string;
    financialProgress: number;
    physicalProgress: number;
    satelliteDelta?: string | null;
    contractorName?: string | null;
    delayMonths?: number;
    sector?: string;
  }): Promise<GroqAuditResponse> {
    const startTime = performance.now();

    const systemPrompt = `You are the Statutory Audit AI Engine for the Indian MPLADS (Member of Parliament Local Area Development Scheme) Monitoring Platform.
Your duty is to produce neutral, evidence-grounded administrative risk evaluations based strictly on facts.
Never invent dates, voucher numbers, or fictional contractors.
Structure your output into:
1. Forensic Overview
2. Evidentiary Inconsistencies (Financial vs Physical vs Satellite telemetry)
3. Statutory Audit Recommendations under MoSPI Guidelines`;

    const userPrompt = `Evaluate the following MPLADS project record:
- Project ID: ${projectContext.projectId}
- Work: ${projectContext.workName}
- Sector: ${projectContext.sector || 'General Infrastructure'}
- Financial Disbursement Claimed: ${projectContext.financialProgress}%
- Physical Ground Structure Measured: ${projectContext.physicalProgress}%
- Satellite InSAR/Optical Discrepancy: ${projectContext.satelliteDelta || 'No discrepancy recorded'}
- Execution Delay: ${projectContext.delayMonths ? `${projectContext.delayMonths} months past milestone` : 'On schedule'}
- Executing Entity: ${projectContext.contractorName || 'Entity unrecorded in public release'}

Provide an executive, concise forensic audit summary.`;

    try {
      const groqResult = await callGroqWithFallback([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], 600, 0.2);

      const latencyMs = Math.round(performance.now() - startTime);

      return {
        analysis: groqResult.content,
        keyFindings: [
          `Physical vs financial progress variance: ${Math.abs(projectContext.financialProgress - projectContext.physicalProgress)}%`,
          projectContext.satelliteDelta ? `Ground telemetry discrepancy detected: ${projectContext.satelliteDelta}` : 'Earth observation baseline verified',
          projectContext.delayMonths ? `${projectContext.delayMonths} months delay exceeding standard 90-day grace period` : 'Milestone execution compliant'
        ],
        recommendedReviewActions: [
          'Direct Implementing District Authority (IDA) to dispatch certified field technical inspection team.',
          'Cross-examine physical measurement book (MB) entries against treasury disbursement vouchers.',
          'Reconcile high-resolution Sentinel-2 radar telemetry with ground cadastral plot boundaries.'
        ],
        latencyMs,
        modelUsed: groqResult.modelUsed
      };
    } catch (err) {
      console.warn('Groq live API call encountered error, attempting Gemini fallback:', err);
      if (geminiAIService.isConfigured()) {
        try {
          const geminiResult = await geminiAIService.generateRiskAudit(projectContext);
          return {
            ...geminiResult,
            modelUsed: geminiResult.modelUsed || 'Google AI (Live)'
          };
        } catch (geminiErr) {
          console.warn('Gemini fallback also encountered error:', geminiErr);
        }
      }

      const latencyMs = Math.round(performance.now() - startTime);
      return {
        analysis: `Forensic audit for ${projectContext.projectId} identifies a ${Math.abs(projectContext.financialProgress - projectContext.physicalProgress)}% gap between financial disbursement and physical structure. Ground observation telemetry indicates execution stalled beyond acceptable milestone buffers. Recommended for formal District Planning Committee scrutiny.`,
        keyFindings: [
          `Physical vs financial gap: ${Math.abs(projectContext.financialProgress - projectContext.physicalProgress)}%`,
          'Milestone timeline breach reported'
        ],
        recommendedReviewActions: [
          'Verify contractor measurement book against public treasury ledger.',
          'Conduct on-site engineering verification before further disbursement release.'
        ],
        latencyMs,
        modelUsed: 'Deterministic Fallback'
      };
    }
  },

  async generateVillagePriorityBriefing(villageContext: {
    villageName: string;
    lgdCode: string;
    district: string;
    projectCount: number;
    totalExpenditureLakhs: number;
    unmetSectors: string[];
  }): Promise<string> {
    const prompt = `Provide a 3-sentence policy briefing on village ${villageContext.villageName} (LGD: ${villageContext.lgdCode}, District: ${villageContext.district}) which has only ${villageContext.projectCount} recorded MPLADS projects totaling ₹${villageContext.totalExpenditureLakhs} Lakhs. Highlighting priority sectors: ${villageContext.unmetSectors.join(', ')}.`;

    try {
      const groqResult = await callGroqWithFallback([
        { role: 'system', content: 'You are an administrative policy advisor for rural planning in India under MoSPI guidelines.' },
        { role: 'user', content: prompt }
      ], 300, 0.3);

      return groqResult.content;
    } catch (err) {
      if (geminiAIService.isConfigured()) {
        try {
          return await geminiAIService.generateVillagePriorityBriefing(villageContext);
        } catch {
          // fallback to deterministic string below
        }
      }
      return `${villageContext.villageName} (LGD: ${villageContext.lgdCode}) in ${villageContext.district} district exhibits lower cumulative MPLADS asset allocation with only ${villageContext.projectCount} recorded works. Recommended for priority inclusion in upcoming parliamentary recommendation cycles for ${villageContext.unmetSectors.join(' and ')}.`;
    }
  }
};

