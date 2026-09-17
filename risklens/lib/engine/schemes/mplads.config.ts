import { WorkCategory } from "@/lib/types";

export interface SchemeConfiguration {
  schemeName: string;
  officialStatutoryBody: string;
  annualEntitlementPerMemberINR: number;
  statutorySlas: {
    administrativeSanctionDays: number;
    technicalSanctionDays: number;
    projectExecutionDays: number;
    postTenureClosureMonths: number;
  };
  signalWeights: {
    maxCostPoints: number;
    maxSlaDelayPoints: number;
    maxPaymentCompliancePoints: number;
    maxPhotoSimilarityPoints: number;
    maxGisOverlapPoints: number;
    maxProgressMismatchPoints: number;
    maxFiscalRushPoints: number;
  };
  inspectionMandate: {
    minInspectionPercentagePerYear: number;
  };
}

export const MPLADS_SCHEME_CONFIG: SchemeConfiguration = {
  schemeName: "Members of Parliament Local Area Development Scheme (MPLADS)",
  officialStatutoryBody: "Ministry of Statistics and Programme Implementation (MoSPI)",
  annualEntitlementPerMemberINR: 50000000, // ₹5.00 Crore per year
  statutorySlas: {
    administrativeSanctionDays: 45,
    technicalSanctionDays: 60,
    projectExecutionDays: 365,
    postTenureClosureMonths: 18,
  },
  signalWeights: {
    maxCostPoints: 25,
    maxSlaDelayPoints: 20,
    maxPaymentCompliancePoints: 15,
    maxPhotoSimilarityPoints: 20,
    maxGisOverlapPoints: 16,
    maxProgressMismatchPoints: 15,
    maxFiscalRushPoints: 12,
  },
  inspectionMandate: {
    minInspectionPercentagePerYear: 10, // ≥10% annual physical inspection mandate
  },
};
