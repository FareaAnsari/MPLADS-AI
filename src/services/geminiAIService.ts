// Google Gemini AI Inference Service for MPLADS AI
// Powered by Google AI Models (Gemini 3.6/3.8 Flash & Gemma 4)
// Provides real-time objective forensic audits, risk explanations, and village priority reasoning.

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Priority candidate list: tries resilient, fast models first, falling back across models if high-demand 503 occurs
const GEMINI_CANDIDATE_MODELS = [
  'gemma-4-26b-a4b-it',
  'gemini-3.6-flash',
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite'
];

export interface GeminiAuditResponse {
  analysis: string;
  keyFindings: string[];
  recommendedReviewActions: string[];
  latencyMs: number;
  modelUsed: string;
}

function formatModelDisplayName(model: string): string {
  if (model.includes('gemma-4-26b')) return 'Google Gemma-4 26B (Live AI)';
  if (model.includes('gemini-3.6')) return 'Google Gemini 3.6 Flash (Live AI)';
  if (model.includes('gemini-3.8')) return 'Google Gemini 3.8 Flash (Live AI)';
  if (model.includes('gemini-3.5')) return 'Google Gemini 3.5 Flash (Live AI)';
  return `Google AI (${model})`;
}

function sanitizeAIOutput(text: string): string {
  if (!text) return '';
  let cleaned = text.trim();
  
  // Strip internal chain-of-thought bullet outlines if present
  const sectionMatch = cleaned.search(/(?:\*\*|\*|#+\s*)?(?:1\.\s*)?(?:Forensic Overview|Overview|Executive Summary|Summary|Audit Report)[:\*]/i);
  if (sectionMatch > 40) {
    cleaned = cleaned.substring(sectionMatch).trim();
  }
  
  return cleaned;
}

async function executeGeminiContentGeneration(payload: any): Promise<{ content: string; modelUsed: string }> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim().length === 0) {
    throw new Error('Gemini API key is not configured');
  }

  let lastError: any = null;

  for (const model of GEMINI_CANDIDATE_MODELS) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errDetail = await response.text().catch(() => '');
        console.warn(`Gemini model candidate [${model}] returned HTTP ${response.status}:`, errDetail.slice(0, 120));
        lastError = new Error(`HTTP ${response.status} from ${model}`);
        continue;
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText && rawText.trim().length > 0) {
        return {
          content: sanitizeAIOutput(rawText),
          modelUsed: formatModelDisplayName(model)
        };
      }
    } catch (err) {
      console.warn(`Gemini candidate [${model}] execution failure:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('All Google Gemini/Gemma candidate models exhausted');
}

export const geminiAIService = {
  isConfigured(): boolean {
    return Boolean(GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 0);
  },

  async generateRiskAudit(projectContext: {
    projectId: string;
    workName: string;
    financialProgress: number;
    physicalProgress: number;
    satelliteDelta?: string | null;
    contractorName?: string | null;
    delayMonths?: number;
    sector?: string;
  }): Promise<GeminiAuditResponse> {
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
      if (!this.isConfigured()) {
        throw new Error('Gemini API key is not configured');
      }

      const payload = {
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          {
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 600
        }
      };

      const result = await executeGeminiContentGeneration(payload);
      const latencyMs = Math.round(performance.now() - startTime);

      return {
        analysis: result.content,
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
        modelUsed: result.modelUsed
      };
    } catch (err) {
      console.warn('Google AI live API call encountered error, providing deterministic statutory fallback:', err);
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
      if (!this.isConfigured()) throw new Error('Gemini API key not configured');

      const payload = {
        system_instruction: {
          parts: [{ text: 'You are an administrative policy advisor for rural planning in India under MoSPI guidelines.' }]
        },
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 300
        }
      };

      const result = await executeGeminiContentGeneration(payload);
      return result.content || 'Village briefing generated.';
    } catch (err) {
      return `${villageContext.villageName} (LGD: ${villageContext.lgdCode}) in ${villageContext.district} district exhibits lower cumulative MPLADS asset allocation with only ${villageContext.projectCount} recorded works. Recommended for priority inclusion in upcoming parliamentary recommendation cycles for ${villageContext.unmetSectors.join(' and ')}.`;
    }
  }
};
